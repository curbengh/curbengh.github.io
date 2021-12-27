---
title: Setup Cloudflare Argo Tunnel in NixOS
excerpt: No inbound port required
date: 2021-06-15
tags:
- server
- linux
- caddy
- nixos
- cloudflare
---

Cloudflare Argo Tunnel enables a web server to serve websites over the public internet without opening an inbound port. With its built-in NAT traversal, a web server can even operate behind a NAT without resorting to port forwarding. The NAT traversal feature reminds me of Tor onion and I2P Eepsite, though the underlying connection is totally different.

It operates through a Cloudflare daemon ([cloudflared](https://github.com/cloudflare/cloudflared)) that a user installs in a server. The daemon creates outbound tunnel(s) to the CDN and forward incoming request to the local web server. It is available for free since April 2021. However, the latest NixOS at that time was 20.09 and it shipped an older version of the daemon that didn't support static tunnel.

[Static tunnel](https://blog.cloudflare.com/argo-tunnels-that-live-forever/) is a feature introduced in v2020.9.3 that associate a tunnel with a static subdomain (UUID.cfargotunnel.com) that a user can CNAME a website to; without this feature, cloudflared had to recreate DNS record every time a tunnel reconnects.

I can now use the newer daemon after my recent upgrade to {% post_link upgrade-note-nixos-21-05 'NixOS 21.05' %}.

## Setup

Generate a new cert.pem from [dashboard](https://dash.cloudflare.com/argotunnel). This is only required to create a new tunnel. When creating a new tunnel, cloudflared also generate a credentials file (UUID.json) that you use to _run_ a tunnel, so you don't have upload the cert.pem to your server. Since tunnel can be created anywhere, you can do it from your workstation.

Grab the cloudflared binary from [Cloudflare](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation) and make it executable without installing it to "/usr/bin".

## Create a new tunnel

This step can be done on your local machine, the actual installation on a server comes later. Once cloudflared binary and cert.pem are downloaded, proceed to creating a new tunnel.

```
./cloudflared tunnel --origincert cert.pem create mytunnel
```

A new _UUID_.json will be generated in the current folder.

## Configure the tunnel

Create a new yml file.

``` yml
tunnel: mytunnel
credentials-file: /var/lib/argoWeb/uuid.json

# Optional
# loglevel: warn

ingress:
  - hostname: mdleom.com
    service: http://localhost:4430
  - hostname: www.mdleom.com
    service: http://localhost:4430
  - service: http_status:404
```

The last entry is intentionally left without a `hostname` key as required by cloudflared. Usually, it's configured with `http_status:404` so cloudflared returns that status if there is no matching destination hostname for an incoming request. This can happen when say you have a foo.example.com DNS record that points to the daemon, so incoming request does reach the daemon, but either you forgot to configure the daemon to route the traffic to the actual foo.example.com web server or the web server is not running at all. In that case, the daemon will return a HTTP 404 status.

## Configure NixOS

Create a new user and group named "argoWeb" in the server.

``` nix
  users = {
    users = {
      argoWeb = {
        home = "/var/lib/argoWeb";
        createHome = true;
        isSystemUser = true;
        group = "argoWeb";
      };
    };

    groups = {
      caddyProxy.members = [ "argoWeb" ];
    };
  };
```

Once `argoWeb` is created via nixos-rebuild, upload and move the json file to "/var/lib/argoWeb" folder. `chown argoWeb:argoWeb` and `chmod 600` that file.

Then, Create a new nix file; in this case, I'm using "/etc/caddy/" folder (where I put other *.nix files):

``` nix /etc/caddy/argoWeb.nix
{ config, lib, pkgs, ... }:

with lib;

let
  cfg = config.services.argoWeb;
in {
  options.services.argoWeb = {
    enable = mkEnableOption "Cloudflare Argo Tunnel";

    config = mkOption {
      default = "/etc/caddy/argoWeb.yml";
      type = types.str;
      description = "Path to cloudflared config";
    };

    dataDir = mkOption {
      default = "/var/lib/argoWeb";
      type = types.path;
      description = ''
        The data directory, for storing credentials.
      '';
    };

    package = mkOption {
      default = pkgs.cloudflared;
      defaultText = "pkgs.cloudflared";
      type = types.package;
      description = "cloudflared package to use.";
    };
  };

  config = mkIf cfg.enable {
    systemd.services.argoWeb = {
      description = "Cloudflare Argo Tunnel";
      after = [ "network-online.target" ];
      wants = [ "network-online.target" ]; # systemd-networkd-wait-online.service
      wantedBy = [ "multi-user.target" ];
      serviceConfig = {
        ExecStart = "${cfg.package}/bin/cloudflared --config ${cfg.config} --no-autoupdate tunnel run";
        Type = "simple";
        User = "argoWeb";
        Group = "argoWeb";
        Restart = "on-failure";
        RestartSec = "5s";
        NoNewPrivileges = true;
        LimitNPROC = 512;
        LimitNOFILE = 1048576;
        PrivateTmp = true;
        PrivateDevices = true;
        ProtectHome = true;
        ProtectSystem = "full";
        ReadWriteDirectories = cfg.dataDir;
      };
    };
  };
}
```

Move the yml file to "/etc/caddy/" and set both yml and nix files to be `chown root:root` and `chmod 644`.

## Configure Caddy

Bind the web server to localhost ("127.0.0.1" or "::1") and _optionally_ disable the tls. If Cloudflare's authenticated origin pull (client authentication) is configured, that should still work if you prefer to leave tls on, though I haven't test it. You don't have to bind it to localhost if you insist so, but it defeats the security purpose of Argo.

``` Caddyfile
mdleom.com:4430 www.mdleom.com:4430 {
  bind 127.0.0.1

  tls /var/lib/caddyProxy/mdleom.com.pem /var/lib/caddyProxy/mdleom.com.key {
    protocols tls1.3
    client_auth {
      mode require_and_verify
      trusted_ca_cert_file /var/lib/caddyProxy/origin-pull-ca.pem
    }
  }
}
```

Restart/reload Caddy for the changed config to take effect.

## Custom package (optional)

If your NixOS instance is IPv6-only, you may want to use a {% post_link custom-package-nixos-module 'custom package' %}. [`pkgs.cloudflared`](https://search.nixos.org/packages?channel=21.11&from=0&size=50&sort=relevance&type=packages&query=cloudflared) is installed by compiling the source from the [GitHub repo](https://github.com/cloudflare/cloudflared), instead of using a cached binary from Nix repo. cloudflared's license restricts the distribution of binary, hence the need of source compilation. However, GitHub doesn't support IPv6 yet, so we need to clone its repo to other Git repo that supports IPv6 and then download it from there.

## Start cloudflared

``` nix
  require = [
    /etc/caddy/argoWeb.nix
  ];
  # cloudflared is not distributed via a free software license
  nixpkgs.config.allowUnfree = true;
  services.argoWeb = {
    enable = true;
    config = "/etc/caddy/argoWeb.yml";
    # custom package
    # package = pkgs.callPackage (import /etc/caddy/cloudflared-custom.nix) { };
  };
```

## Create a CNAME record

The last step is to create a new DNS record to CNAME the relevant hostname to _UUID_.cfargotunnel.com . Existing A/CNAME must be removed beforehand since a hostname cannot have both A and CNAME records at the same time, nor having two similar CNAMEs.
