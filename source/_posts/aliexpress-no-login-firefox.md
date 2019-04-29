---
title: How to solve 'Cannot login to AliExpress on Firefox'
date: 2019-02-28 00:00:00
lastUpdated: 2019-04-29 00:00:00
tags:
- firefox
---

AliExpress login doesn't show up on Firefox when there is a strict cross-origin policy (i.e. `network.http.referer.XOriginPolicy`). Here's how to whitelist it.

<!-- more -->

## Background

> Click [**here**](#My-Orders) to go straight to the workarounds.

Firefox can restrict the referrer to the same origin only ([docs](https://wiki.mozilla.org/Security/Referrer)), by setting `network.http.referer.XOriginPolicy` value to 2 in `about:config`. Initially, I figured this would break many websites. But to my surprise, I have yet to encounter any issue; well, *except* for AliExpress.

When you try to login to AliExpress, the login box is just blank.

{% cloudinary 20190228/no-login.png %}

In the new design, the loading wheel just keeps spinning.

{% cloudinary 20190228/invalid-login.png %}
<br />
{% cloudinary v1556526937/20190228/invalid-login-ani.webp %}

Upon inspection on the blank element (right click on the blank login and select `Inspect Element`), the login box is an iframe of `https://passport.aliexpress.com`. From the Web Console (`Ctrl + Shift + K`), the following error message suggested it's caused by [X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options).

{% cloudinary 20190228/iframe.png %}
<br />
{% cloudinary 20190228/x-frame.png %}

From the Network inspection (`Ctrl + Shift + E`), `https://passport.aliexpress.com` has HTTP header `x-frame-options: SAMEORIGIN` (which I believe stems from the `XOriginPolicy` setting). This restricts the iframe to the same domain. This caused the iframe unable to load because it's different from the login page `https://login.aliexpress.com`.

{% cloudinary 20190228/sameorigin.png %}

**Edit:** After pinpoint the issue to `XOriginPolicy`, I suspect AliExpress sends the referrer from `login` to `passport` for tracking purpose, and somehow `passport` could not be loaded if it does not receive any referrer. There are a few options to resolve this.

## My Orders

To use the old login page, mouse-over on the **Account** link at the top right corner and click on **My Orders**. It should redirects to `https://login.aliexpress.com/...`

{% cloudinary 20190228/my-orders.png %}
<br />
{% cloudinary v1556526936/20190228/my-orders-ani.webp %}

## Reset XOriginPolicy

1. Go to [about:config](about:config).
2. Search for `network.http.referer.XOriginPolicy`.
3. Right click and select `Reset`.

## "Ignore X-Frame-Options" extension

[**Ignore X-Frame-Options**](https://addons.mozilla.org/en-US/firefox/addon/ignore-x-frame-options-header/) Firefox extension is a way to whitelist the domain from the restriction. By default, the extension whitelist all domains. This is highly discouraged because it nullifies the security benefits of x-frame-options (e.g. prevent a banking website from being iframe-d inside a phishing website). Instead, we can whitelist the login page only.

```
https://passport.aliexpress.com/*
```

{% cloudinary 20190228/whitelist.png %}

That's how the whitelist works on the extension; you add the domain of the iframe not the page's domain. After you add it to the list, refresh the page and you should see the login.

{% cloudinary 20190228/login.png %}

## Direct link

If none of the above work, the last resort is to use the direct link https://login.aliexpress.com/express/mulSiteLogin.htm