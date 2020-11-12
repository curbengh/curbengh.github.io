---
title: "Setup Caddy as a reverse proxy on NixOS (Part 3: Caddy)"
excerpt: "Part 3: Configure Caddy"
date: 2020-03-14
updated: 2020-11-09
tags:
- server
- linux
- caddy
- nixos
---

> 9 Nov 2020: Updated to Caddy 2.1 syntax. Refer to {% post_link caddy-upgrade-v2-proxy 'this article' %} for upgrade guide.

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

``` nix configuration.nix
services.caddy = {
  enable = true;
  email = example@example.com;
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

``` nix /etc/caddy/caddyProxy.nix
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
      # 21.03+
      # https://github.com/NixOS/nixpkgs/pull/97512
      # startLimitIntervalSec = 14400;
      # startLimitBurst = 10;
      serviceConfig = {
        ExecStart = "${cfg.package}/bin/caddy run --config ${cfg.config} --adapter ${cfg.adapter}";
        ExecReload = "${cfg.package}/bin/caddy reload --config ${cfg.config} --adapter ${cfg.adapter}";
        Type = "simple";
        User = "caddyProxy";
        Group = "caddyProxy";
        Restart = "on-abnormal";
        StartLimitIntervalSec = 14400;
        StartLimitBurst = 10;
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
    protocols tls1.3
    client_auth {
      mode require_and_verify
      trusted_ca_cert_file /var/lib/caddyProxy/origin-pull-ca.pem
    }
  }
}
```

### Redirect www to apex

Connection to www.mdleom.com is redirected to mdleom.com with HTTP 301 status.

```
  @www host www.mdleom.com
  redir @www https://mdleom.com{uri} permanent
```

`{label1}` placeholder refers to the first part of the request hostname, e.g. if hostname is `foo.bar.com`, `{label1}` is foo, `{label2}` is bar and so on.

`{uri}` is used to retain the path when redirecting. `www.mdleom.com/foo/bar` is redirected to `mdleom.com/foo/bar`.

If you prefer to redirect apex to www,

```
  @www host mdleom.com
  redir @www https://www.mdleom.com{uri} permanent
```

### Reverse proxy

Aside from reverse proxy to curben.netlify.app, I also configured my Netlify website to use Statically CDN for on-the-fly image processing. My current [config](https://gitlab.com/curben/blog) is:

``` plain source/_redirects https://gitlab.com/curben/blog/-/blob/master/source/_redirects _redirects
/img/* https://cdn.statically.io/img/gitlab.com/curben/blog/raw/site/:splat 200
/screenshot/* https://cdn.statically.io/screenshot/mdleom.com/:splat?mobile=true 200
```

In Caddyfile, the config can be expressed as:

``` plain
  handle_path /img/* {
    rewrite * /img/gitlab.com/curben/blog/raw/site{path}
    reverse_proxy https://cdn.statically.io
  }

  handle_path /screenshot/* {
    rewrite * /screenshot/curben.netlify.app{path}?mobile=true

    reverse_proxy https://cdn.statically.io
  }

  reverse_proxy https://curben.netlify.app
```

`rewrite` directive is necessary to remove `img/` and `screenshot/*` from the path, so that "mdleom.com/img/foo.jpg" is linked to "https://cdn.statically.io/img/foo.jpg", not "https://cdn.statically.io/img/img/foo.jpg".

### Host header

To make sure Caddy sends the correct `Host:` header to the upstream/backend locations, I use `header_upstream` option,

{% codeblock mark:5,13,18 %}
  handle_path /img/* {
    rewrite * /img/gitlab.com/curben/blog/raw/site{path}

    reverse_proxy https://cdn.statically.io {
      header_up Host cdn.statically.io
    }
  }

  handle_path /screenshot/* {
    rewrite * /screenshot/curben.netlify.app{path}?mobile=true

    reverse_proxy https://cdn.statically.io {
      header_up Host cdn.statically.io
    }
  }

  reverse_proxy https://curben.netlify.app {
    header_up Host curben.netlify.app
  }
{% endcodeblock %}

### Add or remove headers

To prevent any unnecessary request headers from being sent to the upstreams, I use `header_up`. I use it to remove cookie, referer and [other headers](https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-Cloudflare-handle-HTTP-Request-headers-) added by Cloudflare. Since there are many headers to remove, I group them as a global variable. I apply it to all `reverse_proxy` directives.

{% codeblock mark:25,34,40 %}
(removeHeaders) {
  header_up -cdn-loop
  header_up -cf-cache-status
  header_up -cf-connecting-ip
  header_up -cf-ipcountry
  header_up -cf-ray
  header_up -cf-request-id
  header_up -cf-visitor
  header_up -cookie
  header_up -referer
  header_up -sec-ch-ua
  header_up -sec-ch-ua-mobile
  header_up -true-client-ip
  header_up -via
  header_up -x-forwarded-for
  header_up -x-forwarded-proto
  header_up User-Agent "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
}

mdleom.com {
  handle_path /img/* {
    rewrite * /img/gitlab.com/curben/blog/raw/site{path}

    reverse_proxy https://cdn.statically.io {
      import removeHeaders
      header_up Host cdn.statically.io
    }
  }

  handle_path /screenshot/* {
    rewrite * /screenshot/curben.netlify.app{path}?mobile=true

    reverse_proxy https://cdn.statically.io {
      import removeHeaders
      header_up Host cdn.statically.io
    }
  }

  reverse_proxy https://curben.netlify.app {
    import removeHeaders
    header_up Host curben.netlify.app
  }
}
{% endcodeblock %}

The upstream locations insert some information into the response headers that are irrelevant to the site visitors. I use `header` directive to filter them out. It also applies to all `reverse_proxy` directives.

```
  header {
    -access-control-allow-origin
    -access-control-expose-headers
    -alt-svc
    -cdn-cache
    -cdn-cachedat
    -cdn-edgestorageid
    -cdn-pullzone
    -cdn-requestcountrycode
    -cdn-requestid
    -cdn-uid
    -cf-bgj
    -cf-cache-status
    -cf-polished
    -cf-ray
    -cf-request-id
    -content-disposition
    -etag
    -expect-ct
    -server
    -set-cookie
    -timing-allow-origin
    -via
    -x-bytes-saved
    -x-cache
    -x-cache-hits
    -x-nf-request-id
    -x-served-by
    -x-timer
    Clear-Site-Data `"cookies", "storage"`
    Content-Language "en-GB"
    Content-Security-Policy "default-src 'self'; child-src 'none'; connect-src 'none'; font-src 'none'; frame-src 'none'; img-src 'self'; manifest-src 'none'; media-src 'none'; object-src 'none'; prefetch-src 'none'; script-src 'self'; style-src 'self'; worker-src 'none'; base-uri 'none'; form-action https://duckduckgo.com https://3g2upl4pq6kufc4m.onion; frame-ancestors 'none'; block-all-mixed-content"
    Expires "0"
    Feature-Policy "accelerometer 'none'; ambient-light-sensor 'none'; autoplay 'none'; camera 'none'; display-capture 'none'; document-domain 'none'; encrypted-media 'none'; fullscreen 'none'; geolocation 'none'; gyroscope 'none'; magnetometer 'none'; microphone 'none'; midi 'none'; payment 'none'; picture-in-picture 'none'; speaker 'none'; sync-xhr 'none'; usb 'none'; vibrate 'none'; vr 'none'; wake-lock 'none'; webauthn 'none'; xr-spatial-tracking 'none'"
    Referrer-Policy "no-referrer"
    X-Content-Type-Options "nosniff"
    X-Frame-Options "DENY"
    X-XSS-Protection "1; mode=block"
    defer
  }
```

I also add the `Cache-Control` and `Referrer-Policy` to the response header. Use minus (-) sign before each option to remove particular header. Without minus sign, the specified header is either added or replacing an existing one.

### Cache-Control

`/libs` folder contains third-party libraries. Since the library is usually requested by a specific version, we can safely assume that the response would remain the same. This means I can set long expiration and `immutable` on the response. [`immutable`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#Revalidation_and_reloading) is to tell the browser that revalidation is not needed.

```
  header {
    Cache-Control "max-age=86400, public"
  }

  header /libs/* {
    Cache-Control "public, max-age=31536000, immutable"
  }
```

### Complete Caddyfile

Since I also set up reverse proxy for {% post_link tor-hidden-onion-nixos 'Tor Onion' %} and {% post_link i2p-eepsite-nixos 'I2P Eepsite' %}, I refactor most of the configuration into "common.conf" and import it into "caddyProxy.conf".

``` plain common.conf
## Optional: disable admin endpoint and http->https redirect
#{
#  admin off
#  auto_https disable_redirects
#}

(setHeaders) {
  -access-control-allow-origin
  -access-control-expose-headers
  -alt-svc
  -cdn-cache
  -cdn-cachedat
  -cdn-edgestorageid
  -cdn-pullzone
  -cdn-requestcountrycode
  -cdn-requestid
  -cdn-uid
  -cf-bgj
  -cf-cache-status
  -cf-polished
  -cf-ray
  -cf-request-id
  -content-disposition
  -etag
  -expect-ct
  -server
  -set-cookie
  -timing-allow-origin
  -via
  -x-bytes-saved
  -x-cache
  -x-cache-hits
  -x-nf-request-id
  -x-served-by
  -x-timer
  Cache-Control "max-age=86400, public"
  Clear-Site-Data `"cookies", "storage"`
  Content-Language "en-GB"
  Content-Security-Policy "default-src 'self'; child-src 'none'; connect-src 'none'; font-src 'none'; frame-src 'none'; img-src 'self'; manifest-src 'none'; media-src 'none'; object-src 'none'; prefetch-src 'none'; script-src 'self'; style-src 'self'; worker-src 'none'; base-uri 'none'; form-action https://duckduckgo.com https://3g2upl4pq6kufc4m.onion; frame-ancestors 'none'; block-all-mixed-content"
  Expires "0"
  Feature-Policy "accelerometer 'none'; ambient-light-sensor 'none'; autoplay 'none'; camera 'none'; display-capture 'none'; document-domain 'none'; encrypted-media 'none'; fullscreen 'none'; geolocation 'none'; gyroscope 'none'; magnetometer 'none'; microphone 'none'; midi 'none'; payment 'none'; picture-in-picture 'none'; speaker 'none'; sync-xhr 'none'; usb 'none'; vibrate 'none'; vr 'none'; wake-lock 'none'; webauthn 'none'; xr-spatial-tracking 'none'"
  Referrer-Policy "no-referrer"
  X-Content-Type-Options "nosniff"
  X-Frame-Options "DENY"
  X-XSS-Protection "1; mode=block"
}

(removeHeaders) {
  header_up -cdn-loop
  header_up -cf-cache-status
  header_up -cf-connecting-ip
  header_up -cf-ipcountry
  header_up -cf-ray
  header_up -cf-request-id
  header_up -cf-visitor
  header_up -cookie
  header_up -referer
  header_up -sec-ch-ua
  header_up -sec-ch-ua-mobile
  header_up -true-client-ip
  header_up -via
  header_up -x-forwarded-for
  header_up -x-forwarded-proto
  header_up User-Agent "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
}

(reverseProxy) {
  reverse_proxy https://{args.0} {
    import removeHeaders
    header_up Host "{args.0}"
  }
}

(pathProxy) {
  @staticFiles {
    path *.css *.gif *.ico *.jpg *.js *.png *.svg *.webp
  }
  header @staticFiles {
    Cache-Control "max-age=604800, public"
    defer
  }

  header /libs/* {
    Cache-Control "max-age=31536000, public, immutable"
    defer
  }

  handle_path /img/* {
    rewrite * /img/gitlab.com/curben/blog/raw/site{path}

    import reverseProxy cdn.statically.io
  }

  handle_path /screenshot/* {
    rewrite * /screenshot/curben.netlify.app{path}?mobile=true

    import reverseProxy cdn.statically.io
  }

  import reverseProxy curben.netlify.app
}
```

``` plain caddyProxy.conf
import common.conf

## mdleom.com
mdleom.com:4430 www.mdleom.com:4430 {
  tls /var/lib/caddyProxy/mdleom.com.pem /var/lib/caddyProxy/mdleom.com.key {
    protocols tls1.3
    client_auth {
      mode require_and_verify
      trusted_ca_cert_file /var/lib/caddyProxy/origin-pull-ca.pem
    }
  }

  # www -> apex
  @www host www.mdleom.com
  redir @www https://mdleom.com{uri} permanent

  header {
    import setHeaders
    Onion-Location "http://xw226dvxac7jzcpsf4xb64r4epr6o5hgn46dxlqk7gnjptakik6xnzqd.onion"
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    defer
  }

  import pathProxy
}
```

## configuration.nix

One last thing to do is to import "[caddyProxy.nix](#caddyProxy.nix)" and enable `services.caddyProxy`.

``` nix /etc/nixos/configuration.nix
  require = [ /etc/caddy/caddyProxy.nix ];
  services.caddyProxy = {
    enable = true;
    config = "/etc/caddy/caddyProxy.conf";
  };
```
