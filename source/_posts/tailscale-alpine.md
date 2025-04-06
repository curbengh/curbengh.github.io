---
title: Running Tailscale in GitLab CI/CD with Alpine container
excerpt: OAuth client and running service in Alpine container
date: 2025-04-06
tags:
  - gitlab
  - tailscale
  - alpine
---

> Skip to [configuration](#tailscale-acl).

## Background

Previously, I used [cloudflared-powered](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/use-cases/ssh/ssh-cloudflared-authentication/) SSH certificate to access [my servers](/about/#architecture). Since SSH connection is proxied through a cloudflared tunnel--which is created by initiating outbound connection only--I could have restricted the SSH port to localhost only without having to open inbound port. It worked for my workstation--I could initiate SSH through cloudflared which opens a browser and I authenticate on Cloudflare Access through [OTP](https://developers.cloudflare.com/cloudflare-one/identity/one-time-pin/).

But obviously that wouldn't work for automated deployment--building by my blog in GitLab CI then deploys to my web servers automatically. Cloudflare Access supports authenticating through service tokens, but cloudflared apparently [could not](https://github.com/cloudflare/cloudflared/issues/1104) grab SSH certificate through this way. Reading through the [documentation](https://developers.cloudflare.com/cloudflare-one/identity/service-tokens/), I don't see any mention of which _username_ to associate with, so Cloudflare Access could not identify which [_identity_](https://developers.cloudflare.com/cloudflare-one/applications/non-http/short-lived-certificates-legacy/#2-ensure-unix-usernames-match-user-sso-identities) to issue an SSH certificate to.

For CI/CD pipeline use case, Cloudflare instead recommends to use [WARP connector](https://blog.cloudflare.com/introducing-warp-connector-paving-the-path-to-any-to-any-connectivity-2/#securing-access-to-ci-cd-pipeline) which creates a Site-to-Site VPN tunnel between networks: a source network which hosts a build server that runs the pipelines connecting to a destination network which hosts the web servers. The connector agent acts as a subnet router and can either runs on a router, server or directly in each server. However, I run my pipelines on public shared runners which are serverless to me as I don't manage the underlying servers. This rules out a long-running tunnel, so the only method left is to run the WARP client _in_ the CI/CD pipeline, specifically the deployment job. However, WARP client is not meant to run on ephemeral container. It _could_, but imagine cleaning up all the stale clients in the Zero Trust portal.

## Tailscale

Reading through comments on SSH through Cloudflare Access, some mentioned they have moved on to Tailscale instead. When I search the web for "tailscale gitlab", the first result is this [official guide](https://tailscale.com/kb/1287/tailscale-gitlab-runner) by Tailscale. The guide notably mentions the concept of [ephemeral nodes](https://tailscale.com/kb/1111/ephemeral-nodes), a Tailscale device registered with this mode will be automatically removed from the device list after it has gone offline.

The guide is brief, _too_ brief in fact. The guide mentions creating an auth key which only lasts up to 90 days; perhaps it's a good security practice, but I find having to update GitLab secret every quarter to be unappealing. Instead, an [OAuth client](https://tailscale.com/kb/1215/oauth-clients) should be used because it has no expiry, which is also the recommended and _only_ option when running in [Github Action](https://tailscale.com/kb/1276/tailscale-github-action). Even the [auth key](https://tailscale.com/kb/1085/auth-keys) documentation also suggest to use OAuth client to create auth key, instead of creating it directly. I also faced difficulty running the `tailscaled` daemon on [`node:alpine`](https://hub.docker.com/_/node) which I later figured out.

## Tailscale ACL

The first thing to do after I signed up for Tailscale is to replace the allow-all-by-default ACL with the following ACL, which allows port 22 from owner's devices (my workstation) and GitLab Runner to my web servers. The ACL is also used to create tags--a tag must exist in the ACL first before you can assign it to a device.

```json
{
	"tagOwners": {
		"tag:server1": ["autogroup:owner"],
		"tag:server2": ["autogroup:owner"],
		"tag:ci":      ["autogroup:owner"],
	},

	"acls": [
		{
			"action": "accept",
			"src":    ["autogroup:owner", "tag:ci"],
			"dst":    ["tag:server1:22", "tag:server2:22"],
			"proto":  "tcp",
		},
	],

	// Owner must have SSH access
	"tests": [
		{
			"src":    "owner@example.com",
			"accept": ["tag:server1:22", "tag:server2:22"],
			"proto":  "tcp",
		},
	],
}
```

## NixOS

I added my web servers under the [Machines](https://tailscale.com/kb/1316/device-add) tab and tagged them with `server1` and `server2` respectively. I saved the (non-ephemeral and non-reusable) auth key to a file "/run/secrets/tailscale_key" in my servers and chmod it to 600. Each server has a unique auth key. Add the following lines and `sudo nixos-rebuild switch`. The servers should then show up and I manually approved them because I have [device approval](https://tailscale.com/kb/1099/device-approval) enabled.

```nix /etc/nixos/configuration.nix
  services.tailscale = {
    enable = true;
    authKeyFile = "/run/secrets/tailscale_key";
    extraDaemonFlags = [ "--no-logs-no-support" ];
  };
```

## OAuth client

In Tailscale admin console, navigate to Settings -> [OAuth clients](https://login.tailscale.com/admin/settings/oauth). Generate a new client with read+write permission to "Auth Keys".

Create a new GitLab CI/CD variable:

  - Check "masked and hidden" and "protect variable".
  - Uncheck "expand variable".
  - Name the key `TS_OAUTH_SECRET` and paste the secret under value.


## Alpine container

_Skip to the actual commands: [GitLab CI](#gitlab-ci)_

Tailscale provides an official Alpine-based container image [`tailscale/tailscale:stable`](https://tailscale.com/kb/1282/docker) which is probably the easiest way to run it in container. I don't use it because the Alpine package repository only has [LTS version](https://pkgs.alpinelinux.org/package/edge/main/x86_64/nodejs) of Nodejs, not the latest release as available at the [`node:alpine`](https://hub.docker.com/_/node/) image. Instead of using tailscale image as a base, I prefer to use the larger Nodejs as a base and install tailscale on top of it.

It took me a few attempts to run Tailscale in the `node:alpine` image as I was unfamiliar with the behaviour of init/OpenRC in an Alpine container. These are my attempts in order:

1. `tailscale up` failed because `tailscaled` is not running.
2. `rc-service tailscale start` failed because "openrc" is not installed.
3. It still failed with openrc.
4. Found [this workaround](https://github.com/tailscale/tailscale/issues/11628#issuecomment-2039012828) which worked but I wasn't sure why.
5. Then I found this [StackOverflow question](https://stackoverflow.com/questions/78269734/is-there-a-better-way-to-run-openrc-in-a-container-than-enabling-softlevel). One of the answers mentioned a container doesn't really boot, which explains why the container doesn't install nor run openrc by default.
6. Instead of starting a service (which executes `tailscaled`), I could just run `tailscaled` in the background instead.
7. I follow the tailscaled's environment variables and default arguments of its [alpine package](https://gitlab.alpinelinux.org/alpine/aports/-/tree/master/community/tailscale), including the [`$PATH` override](https://gitlab.alpinelinux.org/alpine/aports/-/blob/b12738c7639e2cd988a56aa58e23b1eb8f791d78/community/tailscale/tailscale.initd#L40). I only changed the `--state` from "/var/lib/tailscale/tailscaled.state" to "mem:" since it will be a ephemeral node.

### GitLab CI


```yml .gitlab-ci.yml
	before_script:
    - apk update && apk add tailscale
    - export PATH="/usr/libexec/tailscale:$PATH"
    - export TS_DEBUG_FIREWALL_MODE=nftables
    - tailscaled --socket=/run/tailscale/tailscaled.sock --state="mem:" --port=41641 --no-logs-no-support >/dev/null 2>&1 &
    - tailscale up --auth-key="${TS_OAUTH_SECRET}?ephemeral=true&preauthorized=true" --advertise-tags=tag:ci --hostname="gitlab-$(cat /etc/hostname)" --accept-routes
```

## Additional reading

[GitOps for Tailscale ACLs with GitLab CI](https://tailscale.com/kb/1254/gitops-acls-gitlab)
