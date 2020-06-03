---
title: "Onion-Location: redirect your cleanet website to .onion"
excerpt: Supported in Tor Browser >=9.5
date: 2020-06-03
tags:
- tor
---

Tor Browser recently introduced "Onion Location" feature to enable a (cleanet) website to advertise its onion service to users of Tor Browser by adding an HTTP header. When visiting a cleanet website that has onion service available and the relevant HTTP header, Tor Browser will display a ".onion available" button on the address bar. When user clicks on it, Tor Browser will redirects to the .onion address of the website. User could also opt-in the "Always Prioritise Onions" option and Tor Browser will automatically redirects to a website's .onion if detected.

![.onion button](20200603/onion-location.png)

![Redirected to onion service](20200603/redirected-onion.png)

The HTTP header is:

```
Onion-Location: http://xxx.onion
```

## Caddy

In Caddy, the header can be added by:

``` plain v1
example.com {
  header / {
    Onion-Location "http://xxx.onion"
  }
}
```

``` plain v2
example.com {
  header {
    Onion-Location "http://xxx.onion"
  }
}
```

## <meta> tag

If you don't have access to the web server to add the header (e.g. GitHub/GitLab Pages), you can add `<meta>` tag instead.

The tag should be added in `<head>`:

``` html
<html>
  <head>
    <meta http-equiv="Onion-Location" content="http://xxx.onion">
  </head>
</html>
```
