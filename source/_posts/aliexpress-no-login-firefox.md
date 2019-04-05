---
title: How to solve 'Cannot login to AliExpress on Firefox'
date: 2019-02-28 00:00:00
tags:
- firefox
---

AliExpress login doesn't show up on Firefox. This is due to X-Frame-Options restriction. Here's how to whitelist it.

<!-- more -->

When you try to login to AliExpress on Firefox, the login box is just blank.

{% cloudinary 20190228/no-login.png %}

When I inspected the element (right click on the blank login and select ``Inspect Element`), the login box is an iframe of `https://passport.aliexpress.com`. From the Web Console (`Ctrl + Shift + K`), the following error message suggested it's caused by [X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options).

{% cloudinary 20190228/iframe.png %}

{% cloudinary 20190228/x-frame.png %}

From the Network inspection (`Ctrl + Shift + E`), `https://passport.aliexpress.com` has HTTP header `x-frame-options: SAMEORIGIN`. This restricts the iframe to the same domain. This caused the iframe unable to load because it's different from the login page `https://login.aliexpress.com`.

{% cloudinary 20190228/sameorigin.png %}

[Ignore X-Frame-Options](https://addons.mozilla.org/en-US/firefox/addon/ignore-x-frame-options-header/) Firefox extension is a way to whitelist the domain from the restriction. By default, the extension whitelist all domains. This is highly discouraged because it nullifies the security benefits of x-frame-options (e.g. prevent a banking website from being iframe-d inside a phishing website). Instead, we can whitelist the login page only.

```
https://passport.aliexpress.com/*
```

{% cloudinary 20190228/whitelist.png %}

That's how the whitelist works on the extension; you add the domain of the iframe not the page's domain. After you add it to the list, refresh the page and you should see the login.

{% cloudinary 20190228/login.png %}