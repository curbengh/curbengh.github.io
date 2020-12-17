---
title: Enabling HSTS preload in Cloudflare
excerpt: Take note if you have www -> apex redirect
date: 2020-11-22
updated: 2020-12-17
tags:
- cloudflare
- security
---

HTTP Strict Transport Security ([HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)) preload is used to instruct browsers to always use HTTPS for your website. Browsers will initiate and connect to any site in the preloaded HSTS list through HTTPS only. The list is currently maintained by [Chromium](https://cs.chromium.org/chromium/src/net/http/transport_security_state_static.json) (GitHub mirror [link](https://github.com/chromium/chromium/raw/master/net/http/transport_security_state_static.json)) and the list is utilised by all [supported](https://caniuse.com/stricttransportsecurity) browsers. Eligible website can request to be included at [hstspreload.org](https://hstspreload.org/). In order to be accepted to the HSTS preload list through this form, your site must satisfy the following set of requirements:

1. Serve a valid certificate.
2. Redirect from HTTP to HTTPS on the **same host**, if you are listening on port 80. (see [next section](#Redirect))
3. Serve all subdomains over HTTPS.
  1. In particular, you must support HTTPS for the **www** subdomain if a DNS record for that subdomain exists.
4. Serve an HSTS header on the base domain for HTTPS requests:
  1. The max-age must be at least 31536000 seconds (1 year).
  2. The includeSubDomains directive must be specified.
  3. The preload directive must be specified.
  4. If you are serving an additional redirect from your HTTPS site, that redirect must still have the HSTS header (rather than the page it redirects to).

In actual implementation, a website must have the following header to meet above requirements:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

To serve the above HTTP header in Cloudflare, head to SSL/TLS -> Edge Certificates. Enable "Always Use HTTPS". Under the HSTS setting:

1. Enable HSTS: On
2. Max Age: 12 months
3. Apply HSTS policy to subdomains: On
4. Preload: On
5. No-Sniff Header: On (optional)

![Cloudflare HSTS configuration](20201122/cf-hsts-config.png)

![Recommended SSL/TLS configuration](20201122/cf-tls.png)

After enabling HSTS, you can proceed submit your website to [hstspreload.org](https://hstspreload.org/). To check current status, you can either query hstspreload.org or Chromium-maintained list,

```
$ curl -L https://github.com/chromium/chromium/raw/master/net/http/transport_security_state_static.json -o hsts-chromium.json
$ grep example.com hsts-chromium.json
```

## Redirect

If you have www -> apex redirect (`www.example.com` -> `example.com`) or vice versa, it's tempting to do the following redirect:

- `http://www.example.com` -> `https://example.com` (**invalid**)

While it saves one redirect (`http://www.example.com` -> `https://www.example.com`), it goes against the requirement. The valid redirect should be:

- `http://www.example.com` -> `https://www.example.com` -> `https://example.com` (**valid**)

You can use either use your origin server or Page Rules to handle the redirect; when combining with "Always Use HTTPS" feature, you only need to add the following redirect:

- `https://www.example.com` -> `https://example.com`

Covered by "Always use HTTPS":

- `http://example.com` -> `https://example.com`
- `http://www.example.com` -> `https://www.example.com`

![Page Rules](20201122/page-rules.png)

## Update (17 Dec 2020)

This website is now included in the Chromium's preload list after I submitted a [request](https://hstspreload.org/) a month ago. The list hasn't been deployed to browsers' (Chrome and Firefox) stable version yet, that may take another month or two.

```
$ curl -L https://github.com/chromium/chromium/raw/master/net/http/transport_security_state_static.json -o hsts-chromium.json
$ grep mdleom.com hsts-chromium.json 
  { "name": "mdleom.com", "policy": "bulk-1-year", "mode": "force-https", "include_subdomains": true },
```
