---
title: Prevent Engadget from redirect to guce
subtitle: Block its cookies
date: 2019-06-09
tags:
- Firefox
- Web
---

> Skip to [solution](#Block-cookie).

Whenever I try to open an Engadget article, it will automatically redirect me to `guce.advertising.com/...` which is (thankfully) blocked by uBO.

{% cloudinary '20190609/guce-engadget.png' 'uBO blocks Engadget redirect' %}

Initially, I was able to workaround by opening the article in a private window, but it was not reliable. I didn't know why private window worked in the first place (and only found the reason later on). I figured it must be redirected by third-party javascript, so I checked the page source, looked for suspicious domains and block them using uBO. That didn't work, not even disabling javascript.

I then checked the Network Monitor (of Firefox Developer Tools) and I found it redirects using HTTP 302(?) response *without* any response body. This confirmed the redirection wasn't through javascript. But why it redirects but not in a private window?

I compared the request header between a normal and private window. There was no cookie sent in a private window. Then, I tried removing the cookie field and resend the request, but I didn't get any response. I wondered why a cookie is sent even after removing all the cookies and restarted the browser.

The source turned out to be [Livemarks](https://addons.mozilla.org/en-US/firefox/addon/livemarks/) addon. It's a RSS addon, functions similarly to Live Bookmark feature that was removed in Firefox 64. I'm not blaming Livemarks here. Since I subscribe to Engadget's RSS, immediately after I start the browser, the RSS will be reloaded and a cookie would be set. It seems Engadget would set a cookie, regardless of links.

## Block cookie

Firefox can block cookie by website. To block Engadget from setting a cookie, in Firefox:

1. Go to **Preferences**.
2. Navigate to **Privacy & Security** tab on the left.
3. Scroll down to **Cookies & Site Data** section and open **Manage Permissions**.

  {% cloudinary '20190609/privacy-settings.png' 'Privacy settings in Firefox' %}

4. Put `https://www.engadget.com` as the address and click **Block** and save it.

  {% cloudinary '20190609/engadget-block-cookie.png' 'Block Engadget cookies' %}

5. If you have **Clear history when Firefox enabled** enabled, make sure **Site Preferences** is unchecked.

  {% cloudinary '20190609/uncheck-site.png' 'Settings for clearing history' %}


That's it. If you want to know what is the purpose of `guce.advertising.com`, read on.

The previous owner of Engadget, AOL Inc was acquired by Verizon Media (previously known as Oath Inc) in May 2015. With Yahoo! and other media companies as part of its portfolio, Verizon Media can track readers across those websites. One way to do it is through cookie. So, `guce.advertising.com` is essentially a [cookie consent form](https://archive.fo/ik3Pu) (page archived using [archive.today](https://archive.fo/)).