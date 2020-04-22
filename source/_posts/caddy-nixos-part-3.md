---
title: "Setup Caddy as a reverse proxy on NixOS (Part 3: Caddy)"
excerpt: "Part 3: Configure Caddy"
date: 2020-03-14
lastUpdated: 2020-04-08
tags:
- web
- linux
- caddy
- nixos
---

In this segment, I show you how I set up this website (mdleom.com) to reverse proxy to curben.netlify.app using Caddy on NixOS (see above diagram). If you're not using NixOS, simply skip to the [Caddyfile](#Caddyfile) section.

This post is Part 2 of a series of articles that show you how I set up Caddy and Tor hidden service on NixOS:

- {% post_link caddy-nixos-part-1 'Part 1: Install NixOS' %}
- {% post_link caddy-nixos-part-2 'Part 2: Configure NixOS' %}
- Part 3: Configure Caddy
- {% post_link tor-hidden-onion-nixos 'Part 4: Configure Tor' %}
- {% post_link i2p-eepsite-nixos 'Part 5: Configure I2P' %}

![Architecture behind mdleom.com](20200223/caddy-nixos.png)

## Background

In NixOS, Caddy can be easily configured through "configuration.nix", without even touching a Caddyfile, if you have a rather simple setup. For example, to serve static files from "/var/www/" folder,

``` plain configuration.nix
services.caddy = {
  enable = true;
  email = example@example.com;
  agree = true;
  config =
    ''
      example.com {
        root /var/www/
      }
    '';
}
```

Once rebuild, caddy will run as a systemd service. This config also automatically enable HTTPS on example.com using Let's Encrypt cert which will be stored in "/var/lib/caddy/" folder by default.

The magic behind the option is "[caddy.nix](https://github.com/NixOS/nixpkgs/blob/release-19.09/nixos/modules/services/web-servers/caddy.nix)" which exposes the `services.caddy` option. It also take care of creating a systemd unit file and installation the caddy package, so you don't need to install it beforehand. caddy.nix is bundled with NixOS so you can use `services.caddy` straightaway.

This shows the declarative property of NixOS. Nix, the package manager behind NixOS, also enables the system to be atomic. Imagine putting the whole system binaries under Git or file system snapshot. If you botch the system upgrade, you can easily rollback to previous state (usually via Grub menu).

A package is installed in `/nix/store/<hash>/` folder and that hash is what makes Nix atomic. I mention this atomic thing because a package's binary is only symlink to $PATH ("/usr/bin") when installed using `environment.systemPackages` option or `nix-env`. In this case, "caddy.nix" simply specify the required binary "pkgs.caddy/bin/caddy" and NixOS will automatically install the required package. Since the caddy binary is not available under $PATH, running `$ caddy` command will return "command not found" error. If you need to use the caddy binary, you have three options:

1. Locate the binary in "/nix/store" by checking `$ systemctl status caddy`. This is only available when caddy service is enabled in "configuration.nix". Disabling the service will remove the package.
2. Install it as a system package using `environment.systemPackages`.
3. Install it as a user package using `$ nix-env -f '<nixpkgs>' -iA caddy`.

caddy.nix grants `CAP_NET_BIND_SERVICE` capability which is not needed in my use case because I'm not binding caddy to port < 1024.

## caddyProxy.nix

I created another nix file which is similar to "caddy.nix", but without `CAP_NET_BIND_SERVICE` capability. I also removed Let's Encrypt-related options since I'm using Cloudflare origin certificate. I renamed the `options.services.caddy` to `options.services.caddyProxy` to avoid clash with "caddy.nix". Save the file to "/etc/caddy/caddyProxy.nix" with root as owner. We'll revisit this file in "[configuration.nix](#configuration.nix)" section later in this guide.

``` plain /etc/caddy/caddyProxy.nix
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
      wantedBy = [ "multi-user.target" ];
      environment = mkIf (versionAtLeast config.system.stateVersion "17.09")
        { CADDYPATH = cfg.dataDir; };
      serviceConfig = {
        ExecStart = ''
          ${cfg.package}/bin/caddy -root=/var/tmp -conf=${cfg.config}
        '';
        ExecReload = "${pkgs.coreutils}/bin/kill -HUP $MAINPID";
        Type = "simple";
        User = "caddyProxy";
        Group = "caddyProxy";
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

## Caddyfile

Caddy web server is configured using a Caddyfile. The Caddyfile format I'm using is only compatible with Caddy v1. I will update to v2 once the stable version is released on NixOS. Note that v1 and v2 are incompatible with each other.

### Cloudflare origin cert

For TLS setup, I'm using Cloudflare Origin Certificate. This cert is only valid for connection between Cloudflare and the origin server (i.e. my web server) because it's not signed by a CA. The cert is only signed by Cloudflare and does not have a valid chain of trust. TLS connection between a visitor and Cloudflare is enabled by Cloudflare Universal SSL which has a valid cert.

I'm using "Full (strict)" mode which requires either origin cert or a valid cert signed by a trusted CA. This mode forbids self-signed cert unlike "Full" mode. Let's Encrypt cert is compatible with "Full (strict)". However, putting a web server behind a CDN means that Caddy could only obtain a Let's Encrypt using [DNS challenge](https://letsencrypt.org/docs/challenge-types/) not the default HTTP challenge. Setting up the DNS challenge requires installing `tls.dns.cloudflare` Caddy plugin which is not included in the NixOS package. The plugin also requires access to my Cloudflare's API key which I'm not really comfortable with. Hence, the use of Origin Certificate.

### Download certs

Generate and download the cert from Cloudflare Dash -> SSL/TLS -> Origin Server -> Create Certificate. You can choose the validity from 1 week to 15 years. I choose 1 year so I need to repeat this process every year. Make sure you have both certificate (.pem) and private key (.key).

![Cloudflare Origin Certificate](20200314/cloudflare-origin-cert.png)

I also use Authenticated Origin Pull which utilize TLS client authentication. A client must present a client certificate that is signed by a private key; in this case, it is signed by Cloudflare itself. The client certificate can be verified using Cloudflare's public key available [here](https://origin-pull.cloudflare.com/).

By now, you should have three files:

1. `<domain>.pem`
2. `<domain>.key`
3. `origin-pull-ca.pem`

Move the files to home folder of "caddyProxy" user, which is "/var/lib/caddyProxy" in this case. Set the files' owner and group to `caddyProxy` and permission to `600`.

```
# chown caddyProxy:caddyProxy /var/lib/caddyProxy/*
# chmod 600 /var/lib/caddyProxy/*
```

If you followed my {% post_link caddy-nixos-part-2 'Part 2' %} guide, you should have `caddyProxy` user and group before executing chown and chmod. If you haven't, check out [this section](/blog/2020/03/04/caddy-nixos-part-2/#Run-each-service-as-different-user) of Part 2.

### Initial setup

Set up Caddy to listen on apex domain and www.* on port 4430

``` plain Caddyfile
mdleom.com:4430 www.mdleom.com:4430 {

}
```

### Enable HTTPS

Subsequent configurations (directives) shall be inside the curly braces. Let's start with `tls` directive.

```
mdleom.com:4430 www.mdleom.com:4430 {
  tls /var/lib/caddyProxy/mdleom.com.pem /var/lib/caddyProxy/mdleom.com.key {
    clients /var/lib/caddyProxy/origin-pull-ca.pem
  }
}
```

### Redirect www to apex

Connection to www.mdleom.com is redirected to mdleom.com with HTTP 301 status.

```
  redir 301 {
    if {label1} is www
    / https://mdleom.com{uri}
  }
```

`{label1}` placeholder refers to the first part of the request hostname, e.g. if hostname is `foo.bar.com`, `{label1}` is foo, `{label2}` is bar and so on.

`{uri}` is used to retain the path when redirecting. `www.mdleom.com/foo/bar` is redirected to `mdleom.com/foo/bar`.

If you prefer to redirect apex to www,

```
  redir 301 {
    if {label1} is mdleom
    / https://www.mdleom.com{uri}
  }
```

### Reverse proxy

Aside from reverse proxy to curben.netlify.app, I also configured my Netlify website to use Statically CDN for on-the-fly image processing. My current [config](https://gitlab.com/curben/blog) is:

``` plain source/_redirects https://gitlab.com/curben/blog/-/blob/master/source/_redirects _redirects
/img/* https://cdn.statically.io/img/gitlab.com/curben/blog/raw/site/:splat 200
/screenshot/* https://cdn.statically.io/screenshot/mdleom.com/:splat?mobile=true 200
```

In Caddyfile, the config can be expressed as:

``` plain
  proxy /img https://cdn.statically.io/img/gitlab.com/curben/blog/raw/site {
    without /img
  }

  rewrite /screenshot {
    r (.*)
    to /screenshot{1}?mobile=true
  }

  proxy /screenshot https://cdn.statically.io/screenshot/curben.netlify.app {
    without /screenshot
  }

  proxy / https://curben.netlify.app
```

`without` directive is necessary to remove `libs/` from the path, so that "mdleom.com/libs/foo/bar.js" is linked to "https://cdn.statically.io/libs/foo/bar.js", not "https://cdn.statically.io/libs/libs/foo/bar.js".

For `/screenshot`, since the `proxy` doesn't support variable like the Netlify `:splat`, to prepend "?mobile=true" to the link in the background (without using 301 redirection), I use `rewrite` directive which has a regex match function. I use the regex to capture the path after `screenshot` and call it using `{1}`.

### Host header

To make sure Caddy sends the correct `Host:` header to the upstream/backend locations, I use `header_upstream` option,

``` plain
  proxy /img https://cdn.statically.io/img/gitlab.com/curben/blog/raw/site {
    without /img
    header_upstream Host cdn.statically.io
  }

  rewrite /screenshot {
    r (.*)
    to /screenshot{1}?mobile=true
  }

  proxy /screenshot https://cdn.statically.io/screenshot/curben.netlify.app {
    without /screenshot
    header_upstream Host cdn.statically.io
  }

  proxy / https://curben.netlify.app {
    header_upstream Host cdn.statically.io
  }
```

There are a few repetitions for rewriting the header for Statically. I can group that option as a global variable and call it using `import`.

```
(staticallyCfg) {
  header_upstream Host cdn.statically.io
}

mdleom.com {
  proxy /img ... {
    import staticallyCfg
  }

  proxy /screenshot ... {
    import staticallyCfg
  }
}
```

### Add or remove headers

To prevent any unnecessary request headers from being sent to the upstreams, I use `header_upstream`. I use it to remove cookie, referer and [other headers](https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-Cloudflare-handle-HTTP-Request-headers-) added by Cloudflare. Since there are many headers to remove, I group them as a global variable. I apply it to all `proxy` directive.

```
(removeHeaders) {
  header_upstream -cookie
  header_upstream -referer
  # Remove Cloudflare headers
  # https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-Cloudflare-handle-HTTP-Request-headers-
  header_upstream -cf-ipcountry
  header_upstream -cf-connecting-ip
  header_upstream -x-forwarded-for
  header_upstream -x-forwarded-proto
  header_upstream -cf-ray
  header_upstream -cf-visitor
  header_upstream -true-client-ip
  header_upstream -cdn-loop
  header_upstream -cf-request-id
  header_upstream -cf-cache-status
}

mdleom.com {
  proxy /img ... {
    import removeHeaders
  }
}
```

The upstream locations insert some information into the response headers that are irrelevant to the site visitors. I use `header` directive to filter them out. It applies to all `proxy` directive.

```
  header / {
    -server
    -alt-svc
    -cdn-cache
    -cdn-cachedat
    -cdn-edgestorageid
    -cdn-pullzone
    -cdn-requestcountrycode
    -cdn-requestid
    -cdn-uid
    -cf-cache-status
    -cf-ray
    -cf-request-id
    -etag
    -set-cookie
    -x-bytes-saved
    -x-cache
    -x-nf-request-id
    -x-served-by
    Cache-Control "max-age=604800, public"
    Referrer-Policy "no-referrer"
  }
```

I also add the `Cache-Control` and `Referrer-Policy` to the response header. Use minus (-) sign before each option to remove particular header. Without minus sign, the specified header is either added or replacing an existing one.

### header and header_downstream

`/libs` folder contains third-party libraries. Since the library is usually requested by a specific version, we can safely assume that the response would remain the same. This means I can set long expiration and `immutable` on the response. [`immutable`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#Revalidation_and_reloading) is to tell the browser that revalidation is not needed.

```
  header / {
    Cache-Control "max-age=604800, public"
  }

  header /libs {
    Cache-Control "public, max-age=31536000, immutable"
  }
```

### Complete Caddyfile

``` plain Caddyfile
(removeHeaders) {
  header_upstream -cookie
  header_upstream -referer
  # Remove Cloudflare headers
  # https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-Cloudflare-handle-HTTP-Request-headers-
  header_upstream -cf-ipcountry
  header_upstream -cf-connecting-ip
  header_upstream -x-forwarded-for
  header_upstream -x-forwarded-proto
  header_upstream -cf-ray
  header_upstream -cf-visitor
  header_upstream -true-client-ip
  header_upstream -cdn-loop
  header_upstream -cf-request-id
  header_upstream -cf-cache-status
}

(staticallyCfg) {
  header_downstream Strict-Transport-Security "max-age=31536000"
  header_upstream Host cdn.statically.io
}

## mdleom.com
mdleom.com:4430 www.mdleom.com:4430 {
  tls /var/lib/caddyProxy/mdleom.com.pem /var/lib/caddyProxy/mdleom.com.key {
    clients /var/lib/caddyProxy/origin-pull-ca.pem
  }

  # www -> apex
  redir 301 {
    if {label1} is www
    / https://mdleom.com{uri}
  }

  header / {
    -server
    -alt-svc
    -cdn-cache
    -cdn-cachedat
    -cdn-edgestorageid
    -cdn-pullzone
    -cdn-requestcountrycode
    -cdn-requestid
    -cdn-uid
    -cf-cache-status
    -cf-ray
    -cf-request-id
    -etag
    -set-cookie
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

  proxy /img https://cdn.statically.io/img/gitlab.com/curben/blog/raw/site {
    without /img
    import removeHeaders
    import staticallyCfg
  }

  rewrite /screenshot {
    r (.*)
    to /screenshot{1}?mobile=true
  }

  proxy /screenshot https://cdn.statically.io/screenshot/curben.netlify.app {
    without /screenshot
    import removeHeaders
    import staticallyCfg
  }

  proxy / https://curben.netlify.app {
    import removeHeaders
    header_upstream Host curben.netlify.app
  }
}
```

## configuration.nix

One last thing to do is to import "[caddyProxy.nix](#caddyProxy.nix)" and enable `services.caddyProxy`.

``` js /etc/nixos/configuration.nix
  require = [ /etc/caddy/caddyProxy.nix ];
  services.caddyProxy = {
    enable = true;
    config = "/etc/caddy/caddyProxy.conf";
  };
```
