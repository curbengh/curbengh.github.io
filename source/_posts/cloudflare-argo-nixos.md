---
title: Setup Cloudflare Tunnel in NixOS
excerpt: No open inbound port required
date: 2021-06-15
updated: 2024-08-25
tags:
  - server
  - linux
  - caddy
  - nixos
  - cloudflare
---

Cloudflare Tunnel (formerly known as Cloudflare Argo Tunnel) enables a web server to serve websites over the public internet without opening an inbound port. With its built-in NAT traversal, a web server can even operate behind a NAT without resorting to port forwarding. The NAT traversal feature reminds me of Tor onion and I2P Eepsite, though the underlying connection is totally different.

It operates through a Cloudflare daemon ([cloudflared](https://github.com/cloudflare/cloudflared)) that a user installs in a server. The daemon creates outbound tunnel(s) to the CDN and forward incoming request to the local web server.

[Static tunnel](https://blog.cloudflare.com/argo-tunnels-that-live-forever/) is a feature introduced in v2020.9.3 that associate a tunnel with a static subdomain (UUID.cfargotunnel.com) that a user can CNAME a website to; without this feature, cloudflared had to recreate DNS record every time a tunnel reconnects.

## Setup

Grab the cloudflared binary from [Cloudflare](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) and make it executable without installing it to "/usr/bin".

```
./cloudflared tunnel login
```

cert.pem will be generated in the default [cloudflared directory](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/tunnel-useful-terms/#default-cloudflared-directory).

## Create a new tunnel

This step can be done on your local machine, the actual installation on a server can [come later](#configure-nixos).

```
./cloudflared tunnel create mytunnel
```

A new _UUID_.json will be generated in the default [cloudflared directory](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/tunnel-useful-terms/#default-cloudflared-directory).

## Configure the tunnel

Create a new yml file.

```yml
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

Alternatively, HTTPS can be reached directly if enabled.

```yml
tunnel: mytunnel
credentials-file: /var/lib/argoWeb/uuid.json
originRequest:
  matchSNItoHost: true

# Optional
# loglevel: warn

ingress:
  - hostname: mdleom.com
    service: https://localhost:4430
  - hostname: www.mdleom.com
    service: https://localhost:4430
  - service: http_status:404
```

The last entry is intentionally left without a `hostname` key as required by cloudflared. Usually, it's configured with `http_status:404` so cloudflared returns that status if there is no matching destination hostname for an incoming request. This can happen when say you have a foo.example.com DNS record that points to the daemon, so incoming request does reach the daemon, but either you forgot to configure the daemon to route the traffic to the actual foo.example.com web server or the web server is not running at all. In that case, the daemon will return a HTTP 404 status.

## Configure NixOS

Create a new user and group named "argoWeb" in the server.

```nix
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

Once `argoWeb` is created via nixos-rebuild, upload and move the json file (located in the default [cloudflared directory](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/tunnel-useful-terms/#default-cloudflared-directory)) to "/var/lib/argoWeb" folder. `chown argoWeb:argoWeb` and `chmod 600` that file.

Then, Create a new nix file; in this case, I'm using "/etc/caddy/" folder (where I put other \*.nix files):

```nix /etc/caddy/argoWeb.nix
{ config, lib, pkgs, ... }:

with lib;

let
  cfg = config.services.argoWeb;
in {
  options.services.argoWeb = {
    enable = mkEnableOption "Cloudflare Tunnel";

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
      description = "Cloudflare Tunnel";
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

Bind the web server to localhost and _optionally_ enable the tls. [`client_auth`](https://caddyserver.com/docs/caddyfile/directives/tls#client_auth) should not be configured as Cloudflare Tunnel [does not](https://community.cloudflare.com/t/authenticated-origin-pulls-while-using-the-zerotrust-tunnels/442702) support it and [does not](https://github.com/cloudflare/cloudflared/issues/407) offer security benefit for a localhost web server.

```Caddyfile
mdleom.com:4430 www.mdleom.com:4430 {
  bind 127.0.0.1 [::1]

  tls /var/lib/caddyProxy/mdleom.com.pem /var/lib/caddyProxy/mdleom.com.key {
    protocols tls1.3
  }
}
```

Restart/reload Caddy for the changed config to take effect.

## Custom package (optional)

If your NixOS instance is IPv6-only, you may want to use a {% post_link custom-package-nixos-module 'custom package' %}. [`pkgs.cloudflared`](https://search.nixos.org/packages?channel=unstable&type=packages&query=cloudflared) is installed by compiling the source from the [GitHub repo](https://github.com/cloudflare/cloudflared), instead of using a cached binary from Nix repo. cloudflared's license restricts the distribution of binary, hence the need of source compilation. However, GitHub doesn't support IPv6 yet, so we need to clone its repo to other Git repo that supports IPv6 and then download it from there.

## Start cloudflared

```nix
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
