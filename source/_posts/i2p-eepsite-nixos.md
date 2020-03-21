---
title: "How to make your website available over I2P Eepsite on NixOS"
excerpt: "A guide on I2P Eepsite on NixOS"
date: 2020-03-21
tags:
- web
- linux
- caddy
- nixos
- i2p
- censorship
---

This post is Part 5 of a series of articles that show you how I set up Caddy, Tor hidden service and I2P Eepsite on NixOS:

- {% post_link caddy-nixos-part-1 'Part 1: Install NixOS' %}
- {% post_link caddy-nixos-part-2 'Part 2: Configure NixOS' %}
- {% post_link caddy-nixos-part-3 'Part 3: Configure Caddy' %}
- {% post_link tor-hidden-onion-nixos 'Part 4: Configure Tor' %}
- Part 5: Configure I2P

In this segment, I show you how I set up I2P Eepsite service that reverse proxy to curben.netlify.com. This website can be accessed using this [B32 address](http://ggucqf2jmtfxcw7us5sts3x7u2qljseocfzlhzebfpihkyvhcqfa.b32.i2p) or [mdleom.i2p](http://mdleom.i2p/)

The reason I set up an Eepsite is similar to why I have a Tor hidden service, is to let people visit my website (mdleom.com) anonymously. I2P is touted as superior to Tor with its garlic routing which is claimed to be an improvement to onion routing. In practice though, I don't see much difference. From a client's (as in client-server) perspective,  the browsing experience is still as slow since the traffic has to jump through a few hops, just like in Tor. For a server, the setup is similar as both involve creating public/private key pair.

A thing to note about I2P is that, while inside its network, you can only browse *.i2p websites, not normal websites or what is so-called the _clearnet_. This is unlike Tor where you can browse .onion and clearnet, which is routed through _exit relays_. You could browse the clearnet from I2P network by using a _outproxy_, which works similarly to exit relay of Tor. However, I2P user is discouraged from using a outproxy as that would compromise the user's anonymity.

For this website, I2P network only applies to the traffic between visitor and my (Caddy) web server, as shown in the following diagram; a request still needs to get passed to the upstream curben.netlify.com, but Netlify only sees the request comes from my web server as if it's just a regular visitor and shouldn't know that its origin from the I2P network.

![Architecture behind mdleom.com](20200223/caddy-nixos.png)

## Launch i2pd

To join the I2P network, I'm using [i2pd](https://i2pd.website/), an (unofficial) C++ client of I2P. Most users probably opt for the official Java client which configures everything through a web portal. While using a web portal is more user-friendly, it's a bit tricky to configure from a server which is limited to CLI only. You could ssh port forward the web portal to your local workstation, but since I haven't (and not planning to) set up ssh on the server, I'm reluctant to do it, not to mention the risk of opening another port. i2pd does offer a web portal, but it's only for displaying some running info. Configuration is set using command line flags or a config file; for NixOS, it is through **configuration.nix**.

``` plain /etc/nixos/configuration.nix
  ## I2P Eepsite
  services.i2pd = {
    enable = true;
    ifname = "ens3";
    address = "xxxx";
    inTunnels = [{
      name = "myEep";
      enable = true;
      keys = "myEep-keys.dat";
      inPort = 80;
      address = "::1";
      destination = "::1";
      port = 8081;
    }];
    enableIPv4 = false;
    enableIPv6 = true;
  };
```

1. `ifname` is the interface name that has Internet connection.
2. `address` is the IP address of that Internet-connected interface. Usually i2pd can figure it out by itself, but in an IPv6 environment, an interface could have multiple IPv6 addresses due to IPv6 privacy extensions. In that case, the _true_ IPv6 address needs to be specified.
2. I `name` the service as "myOnion", so the key pair will be stored in "/var/lib/i2pd/**myEep**-keys.dat". I set `keys` to make sure it really save to that file, despite being the default.
4. `inPort` is to set the port number that the service binds to. Recommend to set it to port **80**.
  * If you set it to "1234", visitor needs to specify the port number to browse your site, e.g. http://foobar.i2p:1234
  * There is no need to grant CAP_NET_BIND_SERVICE capability nor open port 80. I2P has NAT traversal capability and can function without opening any inbound port.
5. `address` is location of your server where the Eepsite is hosted. For most use cases, set it to the loopback **127.0.0.1** (default). In my case, it is the IPv6 loopback "::1".
6. `destination` is the location of your website where Eeepsite will forward the request to. It can be a loopback (if website and Eepsite are hosted within the same server), an IP address, a domain or even another eepsite.
  * You can even set your domain here and skip the rest of the sections. However, this can double the latency, especially if the website is behind a CDN. For separation of privilege, it is recommended to have a web server that is dedicated for Eepsite only. The [next section](#caddyI2p.nix) shows how to set up the web server.
6. `port` is the port number that your web server listens to.
7. `enableIPv4` and `enableIPv6` are optional. I set them because my server is IPv6 only.
8. (Optional)

Run `# nixos-rebuild switch` and the keypair will be generated in a file "/var/lib/i2pd/**myEep**-keys.dat". There are no separate files for public and private keys, both are embedded in the same file.

**Backup the file**. If you migrate to another server, you just need to import the file and your Eepsite should be available through the same B32 address.

### B32 address

Eepsite has an **52-character Base32** (B32) address which works similarly like an onion address of Tor hidden service. B32 address is Base32-encoded SHA256 hash of an Eepsite's public key or "I2P destination" as the lingo goes. . I2P generates EDDSA (ED25519-SHA512) by default, in future it may switch to RedDSA. The easy way to get your Eepsite's B32 address is look for a file with 52-character filename in **/var/lib/i2pd/destinations** folder. In my case, the file is **ggucqf2jmtfxcw7us5sts3x7u2qljseocfzlhzebfpihkyvhcqfa.dat**, so my B32 address is **ggucqf2jmtfxcw7us5sts3x7u2qljseocfzlhzebfpihkyvhcqfa.b32.i2p**.

You also manually derive it from the public key using common Linux utility tools. The public key is located in the first 391 bytes of **keypair.dat**.

```
$ head -c 391 <name>-keys.dat | sha256sum | cut -f1 -d\  | xxd -r -p | base32 | tr '[:upper:]' '[:lower:]' | sed -r 's/=//g'
```

This extracts the public key, calculate its SHA256 hash which is in hexadecimal (hex), convert hex to binary, Base32-encode the binary output, convert to lowercase and remove all equal (=) sign.

### I2P Destination

**I2P Destination** refers to the public key in Base64 encoding. An unusual thing about I2P is that it uses minus (-) and tilde (~) symbols for Base64, instead of the more common plus (+) and slash (/).

```
$ head -c 391 <name>-keys.dat | base64 | tr '+' '-' | tr '/' '~'
```

### I2P Destination hash

**Destination hash** is Base64-encoded SHA256 hash of an Eepsite's public key

```
$ head -c 391 <name>-keys.dat | sha256sum | cut -f1 -d\  | xxd -r -p | base64 | tr '+' '-' | tr '/' '~'
```

## caddyI2p.nix

I set up another Caddy-powered reverse proxy which is separate from the {% post_link caddy-nixos-part-3 "mdleom.com's" %}. It's similar to [caddyTor.nix](/blog/2020/03/16/tor-hidden-onion-nixos/#caddyTor.nix) (which in turn is based on [caddyProxy.nix](/blog/2020/03/14/caddy-nix-part-3/#caddyProxy.nix)), except I replace "caddyTor" with "caddyI2p". This Nix file exposes `services.caddyI2p` so that I can enable the I2p-dedicated Caddy service from "configuration.nix".

``` plain /etc/caddy/caddyI2p.nix
{ config, lib, pkgs, ... }:

with lib;

let
  cfg = config.services.caddyI2p;
in {
  options.services.caddyI2p = {
    enable = mkEnableOption "Caddy web server";

    config = mkOption {
      default = "/etc/caddy/caddyI2p.conf";
      type = types.str;
      description = "Path to Caddyfile";
    };

    dataDir = mkOption {
      default = "/var/lib/caddyI2p";
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
    systemd.services.caddyI2p = {
      description = "Caddy web server";
      after = [ "network-online.target" ];
      wantedBy = [ "multi-user.target" ];
      environment = mkIf (versionAtLeast config.system.stateVersion "17.09")
        { CADDYPATH = cfg.dataDir; };
      serviceConfig = {
        ExecStart = ''
          ${cfg.package}/bin/caddy -root=/var/tmp -conf=${cfg.config}
        '';
        ExecReload = "${pkgs.coreutils}/bin/kill -HUP $MAINPID";
        Type = "simple";
        User = "caddyI2p";
        Group = "caddyI2p";
        Restart = "on-failure";
        StartLimitInterval = 86400;
        StartLimitBurst = 5;
        NoNewPrivileges = true;
        LimitNPROC = 64;
        LimitNOFILE = 1048576;
        PrivateTmp = true;
        PrivateDevices = true;
        ProtectHome = true;
        ProtectSystem = "full";
        ReadWriteDirectories = cfg.dataDir;
      };
    };
    
    users.users.caddyI2p = {
      home = cfg.dataDir;
      createHome = true;
    };
    
    users.groups.caddyI2p = {
      members = [ "caddyI2p" ];
    };
  };
}
```

### File ownership and permissions

After you save the file to **/etc/caddy/caddyI2p.nix**, remember to restrict it to root.

```
# chown root:root /etc/caddy/caddyI2p.nix
# chown 600 /etc/caddy/caddyI2p.nix
```

## caddyFile

Create a new caddyFile in `/etc/caddy/caddyI2p.conf` and starts with the following config:

```
ggucqf2jmtfxcw7us5sts3x7u2qljseocfzlhzebfpihkyvhcqfa.b32.i2p:8081 mdleom.i2p:8081 {
  bind ::1

  tls off

  header / {
    -strict-transport-security
  }
}
```

Update the B32 address as per the value derived from the [previous section](#B32-address). `mdleom.i2p` is my I2P domain that I registered with a jump service like [stats.i2p](http://stats.i2p/) and it acts as a shortcut to my B32 address. `tls` (HTTPS) is disabled here because it's not necessary as Tor hidden service already encrypts the traffic. Let's Encrypt doesn't support validating a .i2p address. Since HTTPS is not enabled, `strict-transport-security` (HSTS) no longer applies and the header needs to be removed to prevent the browser from attempting to connect to `https://`. It binds to loopback so it only listens to localhost.

The rest are similar to "[caddyTor.conf](/blog/2020/03/16/tor-hidden-onion-nixos/#caddyTor.conf)" and "[caddyProxy.conf](/blog/2020/03/14/caddy-nix-part-3/#caddyFile)".

``` plain /etc/caddy/caddyI2p.conf
(removeHeaders) {
  header_upstream -cookie
  header_upstream -referer
}

(staticallyCfg) {
  header_upstream Host cdn.statically.io
}

# I2P Eepsite
ggucqf2jmtfxcw7us5sts3x7u2qljseocfzlhzebfpihkyvhcqfa.b32.i2p:8081 mdleom.i2p:8081 {
  bind ::1

  tls off

  header / {
    -server
    -cdn-cache
    -cdn-cachedat
    -cdn-edgestorageid
    -cdn-pullzone
    -cdn-requestcountrycode
    -cdn-requestid
    -cdn-uid
    -etag
    -set-cookie
    -strict-transport-security
    -x-bytes-saved
    -x-cache
    -x-nf-request-id
    -x-served-by
    Cache-Control "max-age=604800, public"
    Referrer-Policy "no-referrer"
  }

  header /libs {
    Cache-Control "public, max-age=31536000, immutable"
  }

  proxy /libs https://cdn.statically.io/libs {
    without /libs
    import removeHeaders
    import staticallyCfg
  }

  proxy /img https://cdn.statically.io/img/gitlab.com/curben/blog/raw/site {
    without /img
    import removeHeaders
    import staticallyCfg
  }

  rewrite /screenshot {
    r (.*)
    to /screenshot{1}?mobile=true
  }

  proxy /screenshot https://cdn.statically.io/screenshot/curben.netlify.com {
    without /screenshot
    import removeHeaders
    import staticallyCfg
  }

  proxy / https://curben.netlify.com {
    import removeHeaders
    header_upstream Host curben.netlify.com
  }
}
```

### Alternate Caddyfile

There is another approach which is suitable if you have a website that you don't have root access. It results in a much simpler Caddyfile, but it _doubles_ the latency.

```
# Do not use this approach unless you are absolutely sure
ggucqf2jmtfxcw7us5sts3x7u2qljseocfzlhzebfpihkyvhcqfa.b32.i2p:8081 mdleom.i2p:8081 {
  bind ::1

  tls off

  header / {
    -strict-transport-security
  }

  proxy / https://mdleom.com {
    header_upstream Host mdleom.com
  }
}
```

## Launch Caddy

Start the Caddy service.

``` js /etc/nixos/configuration.nix
  require = [ /etc/caddy/caddyProxy.nix /etc/caddy/caddyTor.nix /etc/caddy/caddyI2p.nix ];
  services.caddyI2p = {
    enable = true;
    config = "/etc/caddy/caddyI2p.conf";
  };
```

Wait for a few hours and try to access your B32 address.

## Register domain.i2p

Since B32 address is too long to remember, you can register an I2P domain which acts as an alias to your B32 address. Use [regaddr](https://github.com/PurpleI2P/i2pd-tools#regaddr) of i2pd-tools to generate an authentication string. i2pd-tools is not packaged in most of the distro (except for [AUR](https://aur.archlinux.org/packages/i2pd-tools-git), of course), so you need to manually compile it. The authentication string contains:

```
<domain.i2p>=<Base64-encoded public key>#!sign=<digital signature>
```

A jump service verifies the ownership of B32 address by checking the digital signature with the public key. The digital signature is created by signing the domain.i2p and public key with your private key.

Submit the authentication string via [this form](http://stats.i2p/i2p/addkey.html). You should see the following page if the submission is successful. As the screenshot implies, your new domain will take at least a week to propagate to most users' addressbook.

![Domain registration success](20200321/stats-i2p.png)

## File permission

**<name>-keys.dat** is generated with `chmod 644` permission which means it is readable by other OS users. Since it contains private key, it should be restricted to `caddyI2p` and root only, by changing it to `chmod 600`.
