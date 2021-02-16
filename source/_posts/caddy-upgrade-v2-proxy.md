---
title: Upgrading Caddy reverse proxy from v1 to v2 syntax
excerpt: route, strip_prefix, rewrite, reverse_proxy
date: 2020-05-23
updated: 2021-02-16
tags:
- server
- caddy
---

Caddy v2 brought many major changes, particularly to the Caddyfile syntax. This [site](https://mdleom.com/) is powered by the reverse proxy feature of Caddy, so I need to make sure everything works before I finally upgrade. While v2 has been released for more than 2 weeks by now (after months of beta testing), I only managed get my feet wet last weekend, even though I should've done it during the beta releases. After testing v2 on a local server (plus some forum posts), I would say it is _mostly_ working. While v2.0 has reached feature parity with v1, Caddyfile has not; there are two TLS/HTTPS options that are not yet supported in Caddyfile (see [#3219](https://github.com/caddyserver/caddy/issues/3219), [#3334](https://github.com/caddyserver/caddy/issues/3334); planned to be released in v2.1). So, if you don't need HTTPS--like my {% post_link tor-hidden-onion-nixos 'Tor' %} and {% post_link i2p-eepsite-nixos 'I2P' %} proxies--it should be safe to upgrade.

Edit (16 Feb 2021): v2.1 implemented #3219 and #3334, I've updated this post accordingly.

## proxy to reverse_proxy

`proxy` directive is updated to `reverse_proxy`.

Reverse proxy the whole website:

``` plain v1
proxy / https://backend.com
```

In v2, the matcher needs `*`:

``` plain v2
reverse_proxy /* https://backend.com
```

If no matcher is specified, it defaults to `/*` which match every path:

``` plain v2
reverse_proxy https://backend.com
```

### Custom path

Reverse proxy a certain path, like `/api`:

``` plain v2
reverse_proxy /api/* https://backend.com
```

Requests to `https://example.com/api/foo/bar/` is redirected to `https://backend.com/api/foo/bar/`.

To remove the path prefix:

``` plain v1
proxy /api https://backend.com {
  without /api
}
```

Requests to `https://example.com/api/foo/bar/` is redirected to `https://backend.com/foo/bar/`.

v2 doesn't have `without` directive, instead you need to use `route` the request and remove the prefix using `uri strip_prefix`:

``` plain v2.0
route /api/* {
	uri strip_prefix /api
	reverse_proxy https://backend.com
}
```

v2.1 adds `handle_path` directive which integrates prefix stripping:

``` plain v2.1
handle_path /api/* {
	reverse_proxy https://backend.com
}
```

### Backend with custom path

Reverse proxy with custom path:

``` plain v1
proxy /img https://backend.com/img/blog {
  without /img
}
```

![v1 syntax](20200523/proxy.png)

v2 doesn't support custom path, instead you need to use `rewrite` to prepend the path:

``` plain v2.0
route /img/* {
  uri strip_prefix /img

  rewrite * /img/blog{path}

  reverse_proxy https://backend.com
}
```

``` plain v2.1
handle_path /img/* {
  rewrite * /img/blog{path}
  reverse_proxy https://backend.com
}
```

![v2 syntax](20200523/reverse_proxy.png)

## header_upstream to header_up

``` plain v1
proxy / https://backend.com {
  header_upstream Host backend.com
}
```

``` plain v2
reverse_proxy https://backend.com {
  header_up Host backend.com
}
```

## header_downstream to header_down

``` plain v1
proxy / https://backend.com {
  header_downstream -server
}
```

``` plain v2
reverse_proxy https://backend.com {
  header_up -server
}
```

## HTTP only (disable HTTPS/TLS)

``` plain v1
example.com:8080 {
  tls off
}
```

In v2, `tls` doesn't have `off` option, instead you can specify `http://` to listen on HTTP only:

``` plain v2
http://example.com:8080 {

}
```

## Redirect www subdomain

Remove `www.` subdomain with HTTP 301 Permanent redirect:

``` plain v1
example.com www.example.com {
  redir 301 {
    if {label1} is www
    / https://example.com{uri}
  }
}
```

``` plain v2.0
example.com www.example.com {
  @www {
    host www.example.com
  }
  redir @www https://example.com{uri} permanent
}
```

v2.1 supports single-line matcher:

``` plain v2.1
example.com www.example.com {
  @www host www.example.com
  redir @www https://example.com{uri} permanent
}
```

Add `www.` subdomain:

``` plain v1
example.com www.example.com {
  redir 301 {
    if {label1} is example
    / https://www.example.com{uri}
  }
}
```

``` plain v2.0
example.com www.example.com {
  @www {
    host example.com
  }
  redir @www https://www.example.com{uri} permanent
}
```

``` plain v2.1
example.com www.example.com {
  @www host example.com
  redir @www https://www.example.com{uri} permanent
}
```

## header and reverse_proxy

`header` directive still keeps similar syntax, but operates a bit different. In v2, when used alongside with `reverse_proxy`, Caddy modifies the header _before_ receiving header response from the backend. This behaviour is apparent when you want to replace existing header(s); instead of replacing, Caddy adds the header and results in duplicate headers. To avoid this issue, you should use `defer`:

``` plain v2
  header {
    -server
    Referrer-Policy "no-referrer"
    defer
  }
```

## Disable HTTP -> HTTPS redirects

In v2, Caddy automatically listens on HTTP (port 80) and redirects to HTTPS, whereas in v1, you need add a separate `redir 301`. This is handy is most use cases, but doesn't apply to my {% post_link caddy-nixos-part-3 'use case' %}--listens on HTTPS only.

In v2.0, this can only be disabled in [JSON](https://caddyserver.com/docs/json/apps/http/servers/#automatic_https/disable_redirects).

v2.1 supports configuring Automatic HTTPS in Caddyfile using [`auto_https`](https://caddyserver.com/docs/caddyfile/options#auto-https) global option:

``` plain Caddyfile
{
  auto_https disable_redirects
}
```

## TLS client authentication

Client authentication adds another step to TLS connection process whereby a client needs to present a certificate (that has been signed by a CA certificate) to the server (which has the CA certificate) when it attempts to establish a TLS connection. Once the client is authenticated, the process is reversed and client authenticates the server instead. The padlock icon next to the web address indicates that the website's certificate is valid. Client authentication is only used in private web server to restrict access to authorised clients only. In my case, I restrict my origin server to [Cloudflare CDN](https://support.cloudflare.com/hc/en-us/articles/204899617-Authenticated-Origin-Pulls) only; mdleom.com is only accessible via Cloudflare, direct connection to the origin server will be dropped.

In v2.0, this can only be disabled in [JSON](https://caddyserver.com/docs/json/apps/http/servers/tls_connection_policies/#client_authentication).

v2.1 supports configuring client authentication in Caddyfile using `client_auth` option in [`tls`](https://caddyserver.com/docs/caddyfile/directives/tls) directive:

``` plain v1.0
example.com {
  tls cert.pem cert.key {
    clients origin-pull-ca.pem
  }
}
```

``` plain v2.1
example.com {
  tls cert.pem cert.key {
    client_auth {
      mode require_and_verify
      trusted_ca_cert_file origin-pull-ca.pem
      # base64 DER-encoded CA cert is also supported
      # trusted_ca_cert MIIDSzCCAjOgAwIBAg
    }
  }
}
```

## Administration endpoint

[Admin endpoint](https://caddyserver.com/docs/api) is the highlight feature of v2.0; new config can be loaded without restarting Caddy. It is enabled by default and listens on `http://localhost:2019`.

To disable it:

```
{
  admin off
}
```
