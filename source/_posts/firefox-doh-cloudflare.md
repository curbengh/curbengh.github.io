---
title: Cloudflare in Firefox is not the end of the world
date: 2019-05-25
tags:
- Firefox
- Privacy
- Security
- DoH
---

It's not enabled by default and you can easily switch to other providers.

<!-- more -->

Many criticise Firefox for using Cloudflare by default in DNS-over-HTTPS. In reality, it's **not enabled** by default and you can **easily switch** to other providers.

{% cloudinary '20190525/firefox-doh.png' "'DNS over HTTPS' setting in Firefox" %}

That's right, as of version 66, it's *still* **not** enabled by default. You want to use DNS-over-HTTPS but not to use Cloudflare? Just click on 'Custom' and enter the provider's address. There are a few to choose from. Refer to the lists provided by [AdGuard](https://kb.adguard.com/en/general/dns-providers) and [cURL](https://github.com/curl/curl/wiki/DNS-over-HTTPS).

{% cloudinary '20190525/firefox-doh-animated.webp' "How to enable 'DNS over HTTPS' in Firefox" %}

I'm writing this in response to the recent [Opera article](https://arstechnica.com/information-technology/2019/05/review-opera-once-led-web-browser-innovation-it-has-new-ideas-again-with-reborn-3/2/) by Ars Technica,

{% blockquote %}
Firefox is also planning to change how it handles DNS in ways that [could seriously compromise](https://ungleich.ch/en-us/cms/blog/2018/08/04/mozillas-new-dns-resolution-is-dangerous/) the browser, which makes me uncertain about its future.
{% endblockquote %}

The link referenced by the author refers to an article written right after Firefox introduces the DoH feature. At that time, there was no UI to configure it, the only way is through the 'about:config'. So, I can see why some feel sceptical *at that time*. The [official announcement](https://hacks.mozilla.org/2018/05/a-cartoon-intro-to-dns-over-https/), "We'd like to turn this on as the default...", didn't help either. Yet a year later, it's still disabled by default.

For me, I think having DoH in a browser is a great *security* feature. Yes, DoH has overhead of HTTP and SSL, as many have critiqued. But look in this way, DoH is a stopgap solution, until DNS encryption (via DNS-over-TLS, DNSCrypt or similar) is baked into the OS.

By the way, despite what tech articles said about DoH, it is more of a security feature, rather than a privacy feature. See my {% post_link doh-tls-privacy 'other post' %} on this.