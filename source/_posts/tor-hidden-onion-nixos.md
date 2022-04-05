---
title: "How to make your website available over Tor hidden service on NixOS"
excerpt: "A guide on Tor hidden service on NixOS"
date: 2020-03-16
updated: 2020-11-09
tags:
- server
- linux
- caddy
- nixos
- tor
- censorship
series: true
---

> 9 Nov 2020: Updated to Caddy 2.1 syntax. Refer to {% post_link caddy-upgrade-v2-proxy 'this article' %} for upgrade guide.

In this segment, I show you how I set up Tor hidden (.onion) service that reverse proxy to curben.netlify.app. This website can be accessed through the following [.onion address](http://xw226dvxac7jzcpsf4xb64r4epr6o5hgn46dxlqk7gnjptakik6xnzqd.onion).

This post is Part 4 of a series of articles that show you how I set up Caddy, Tor hidden service and I2P Eepsite on NixOS:

- {% post_link caddy-nixos-part-1 'Part 1: Install NixOS' %}
- {% post_link caddy-nixos-part-2 'Part 2: Configure NixOS' %}
- {% post_link caddy-nixos-part-3 'Part 3: Configure Caddy' %}
- Part 4: Configure Tor
- {% post_link i2p-eepsite-nixos 'Part 5: Configure I2P' %}

The main reason for me to have a Tor hidden service is so that visitor can visit my website (mdleom.com) anonymously. Visitor indeed can browse this website _somewhat_ anonymously via VPN, but it's not hidden from the VPN provider. Even with Tor, the traffic still needs to get out from the Tor network to the Internet via exit relays, and exit relays can [do whatever](https://doi.org/10.1007/978-3-319-08506-7_16) they want to the traffic. Tor hidden service ensures the traffic is end-to-end encrypted and stays inside the Tor network--without involving any exit relay.

Note that this only applies to the traffic between visitor and the (Caddy) web server, as shown in the following diagram; a request still needs to get passed to the upstream curben.netlify.app, but Netlify only sees the request comes from my web server as if it's just a regular visitor and shouldn't know that its origin from the Tor network.

![Architecture behind mdleom.com](20200223/caddy-nixos.png)

## Launch Tor

The first step is to bring up a Tor hidden service to get an onion address. Add the following options to **configuration.nix**:

``` nix /etc/nixos/configuration.nix
  ## Tor onion
  services.tor = {
    enable = true;
    enableGeoIP = false;
    relay.onionServices = {
      myOnion = {
        version = 3;
        map = [{
          port = 80;
          target = {
            addr = "[::1]";
            port = 8080;
          };
        }];
      };
    };
    settings = {
      ClientUseIPv4 = false;
      ClientUseIPv6 = true;
      ClientPreferIPv6ORPort = true;
    };
  };
```

1. `enableGeoIP` is disabled as I don't need by-country statistics.
2. I `name` the service as "myOnion", so the keys will be stored in "/var/lib/tor/onion/**myOnion**" folder.
3. Set the `version` to 3, which is a [more secure](https://trac.torproject.org/projects/tor/wiki/doc/NextGenOnions#Howtoconnecttothetesthubfornextgenonionservices) version. The most noticable difference is that the generated onion address will be 56-character long, which is much longer than v2's 16-character. Tor already defaults to v3 since 0.3.5, but I set it just to make sure.
4. `port` is to set the port number that the hidden service binds to. Recommend to set it to port **80**.
  * If you set it to "1234", visitor needs to specify the port number to browse your site, e.g. http://foobar.onion:1234
  * There is no need to grant CAP_NET_BIND_SERVICE capability nor open port 80. Tor has NAT traversal capability and can function without opening any inbound port.
5. `toHost` is location of your web server. In my case, it is the IPv6 loopback **[::1]**. If your server supports IPv4 (mine doesn't), you can set it to "127.0.0.1" or "localhost". If it's an IPv6 address, you need to wrap the address with square brackets **[]**.
  * You can even set your domain here and skip the rest of the sections. However, this can double the latency, especially if the website is behind a CDN. Tor recommends to have a separate web server that is dedicated for Tor hidden service only. The [next section](#caddyTor.nix) shows how to set up the web server.
6. `toPort` is the port number that your web server listens to.
7. `extraConfig` is optional. The options I use here are only applicable if the server is IPv6 only.

Run `# nixos-rebuild switch` and three important files will be generated in the "/var/lib/tor/onion/**myOnion**" folder.

1. `hostname` your unique onion address, note this down. The address is derived from the private key.
2. `hs_ed25519_public_key` ED25519 elliptic-curve public key. Backup this key.
3. `hs_ed25519_private_key` Absolutely backup this key and protect it with your own life. Losing this file means losing the onion address.

**Backup the keys**. If you migrate to another server, you just need to move the keys, Tor will generate the same `hostname` from the private key.

## caddyTor.nix

I set up another Caddy-powered reverse proxy which is separate from the {% post_link caddy-nixos-part-3 "mdleom.com's" %}. It's similar to [caddyProxy.nix](/blog/2020/03/14/caddy-nix-part-3/#caddyProxy.nix), except I replace "caddyProxy" with "caddyTor". This Nix file exposes `services.caddyTor` so that I can enable the Tor-related Caddy service from "configuration.nix".

``` plain /etc/caddy/CaddyTor.nix
{ config, lib, pkgs, ... }:

with lib;

let
  cfg = config.services.caddyProxy;
in {
  options.services.caddyProxy = {
    enable = mkEnableOption "Caddy web server";

    config = mkOption {
      default = "/etc/caddy/caddyProxy.conf";
      type = types.str;
      description = "Path to Caddyfile";
    };

    adapter = mkOption {
      default = "caddyfile";
      example = "nginx";
      type = types.str;
      description = ''
        Name of the config adapter to use.
        See https://caddyserver.com/docs/config-adapters for the full list.
      '';
    };

    dataDir = mkOption {
      default = "/var/lib/caddyProxy";
      type = types.path;
      description = ''
        The data directory, for storing certificates. Before 17.09, this
        would create a .caddy directory. With 17.09 the contents of the
        .caddy directory are in the specified data directory instead.
      '';
    };

    package = mkOption {
      default = pkgs.caddy;
      defaultText = "pkgs.caddy";
      type = types.package;
      description = "Caddy package to use.";
    };
  };

  config = mkIf cfg.enable {
    systemd.services.caddyProxy = {
      description = "Caddy web server";
      after = [ "network-online.target" ];
      wants = [ "network-online.target" ]; # systemd-networkd-wait-online.service
      wantedBy = [ "multi-user.target" ];
      startLimitIntervalSec = 14400;
      startLimitBurst = 10;
      serviceConfig = {
        ExecStart = "${cfg.package}/bin/caddy run --config ${cfg.config} --adapter ${cfg.adapter}";
        ExecReload = "${cfg.package}/bin/caddy reload --config ${cfg.config} --adapter ${cfg.adapter}";
        Type = "simple";
        User = "caddyProxy";
        Group = "caddyProxy";
        Restart = "on-abnormal";
        # < 20.09
        # https://github.com/NixOS/nixpkgs/pull/97512
        # StartLimitIntervalSec = 14400;
        # StartLimitBurst = 10;
        NoNewPrivileges = true;
        LimitNPROC = 512;
        LimitNOFILE = 1048576;
        PrivateTmp = true;
        PrivateDevices = true;
        ProtectHome = true;
        ProtectSystem = "full";
        ReadWriteDirectories = cfg.dataDir;
        KillMode = "mixed";
        KillSignal = "SIGQUIT";
        TimeoutStopSec = "5s";
      };
    };

    users.users.caddyProxy = {
      home = cfg.dataDir;
      createHome = true;
    };

    users.groups.caddyProxy = {
      members = [ "caddyProxy" ];
    };
  };
}
```

### File ownership and permissions

After you save the file to **/etc/caddy/CaddyTor.nix**, remember to restrict it to root.

```
# chown root:root /etc/caddy/caddyTor.nix
# chown 600 /etc/caddy/caddyTor.nix
```

## caddyFile

Create a new caddyFile in `/etc/caddy/caddyTor.conf` and starts with the following config:

```
import common.conf

# Tor onion
http://xw226dvxac7jzcpsf4xb64r4epr6o5hgn46dxlqk7gnjptakik6xnzqd.onion:8080 {
  bind ::1

  header {
    import setHeaders
    -strict-transport-security
    defer
  }

  import pathProxy
}
```

Update the onion address to the value shown in "[/var/lib/tor/onion/myOnion/hostname](#configuration.nix)". HTTPS is disabled by specifying `http://` prefix, HTTPS is not necessary as Tor hidden service already encrypts the traffic. Let's Encrypt doesn't support validating a .onion address. The only way is to purchase the cert from [Digicert](https://www.digicert.com/blog/ordering-a-onion-certificate-from-digicert/). Since HTTPS is not enabled, `strict-transport-security` (HSTS) no longer applies and the header needs to be removed to prevent the browser from attempting to connect to `https://`. It binds to IPv6 loopback so it only listens to localhost, specify `bind 127.0.0.1 ::1` if you need IPv4.

The rest are similar to "[caddyProxy.conf](blog/2020/03/14/caddy-nix-part-3/#Complete-Caddyfile)". Content of "common.conf" is available at [this section](/blog/2020/03/14/caddy-nix-part-3/#Complete-Caddyfile).

``` plain /etc/caddy/caddyTor.conf
import common.conf

# Tor onion
http://xw226dvxac7jzcpsf4xb64r4epr6o5hgn46dxlqk7gnjptakik6xnzqd.onion:8080 {
  bind ::1

  header {
    import setHeaders
    -strict-transport-security
    defer
  }

  import pathProxy
}
```

### Alternate Caddyfile

There is another approach which has a much simpler Caddyfile, but it _doubles_ the latency. I could simply reverse proxy to mdleom.com but that itself is {% post_link caddy-nixos-part-3 'also' %} a reverse proxy, so it would add one more roundtrip. But hey, if the latency doesn't faze you, why not.

This is also suitable if you have a website that you can't root access.

```
# Do not use this approach unless you are absolutely sure
http://xw226dvxac7jzcpsf4xb64r4epr6o5hgn46dxlqk7gnjptakik6xnzqd.onion:8080 {
  bind ::1

  header {
    -strict-transport-security
    defer
  }

  reverse_proxy https://mdleom.com {
    header_up Host mdleom.com
  }
}
```

## Launch Caddy

Start the Caddy service.

``` js /etc/nixos/configuration.nix
  require = [ /etc/caddy/caddyProxy.nix /etc/caddy/caddyTor.nix ];
  services.caddyTor = {
    enable = true;
    config = "/etc/caddy/caddyTor.conf";
  };
```

Tor hidden service needs some time to announce to the Tor network, wait for a few hours before trying your newfangled onion address.
