---
title: Firefox Multi-Account Containers
excerpt: Separate website cookies in a single session
date: 2019-08-12
updated: 2019-08-27
tags:
- firefox
- privacy
---

There are situations where you may want to use more than one account on a website. Meaning you want to use more than one cookie for a specific website. This can be achieved by using a Private Window or creating/cloning a new Firefox profile. I previously wrote about Firefox profile in a {% post_link firefox-instances-profiles 'separate article' %}. While you can use more than two cookies through Firefox profile, this also means managing multiple profiles (especially if you want to use more than *four* cookies).

## Multi-Account Containers

Firefox Multi-Account Containers feature offers an easy way to separate cookies (login sessions). It was first mentioned in [blog.mozilla.org](https://blog.mozilla.org/tanvi/2016/06/16/contextual-identities-on-the-web/) in June 2016. By tracing the `privacy.userContext.enabled` and `privacy.userContext.ui` configs in previous Firefox versions, we can see the groundwork was laid in Firefox 44, albeit with limited functionality and there was no UI. UI was later landed in Firefox 50.

This feature could also be utilised to minimise cookie tracking, a form of [web tracking](https://en.wikipedia.org/wiki/Web_tracking), when used correctly. It does not stop cooking tracking by default, you need to manually separate certain websites to different containers. FYI, [Firefox 67.0.1](https://www.mozilla.org/en-US/firefox/67.0.1/releasenotes/) onwards block third-party tracking cookie by default. iOS 12.2 and Safari 12.1 on macOS High Sierra and Mojave limit storage of tracking cookie to [seven days](https://webkit.org/blog/8613/intelligent-tracking-prevention-2-1/). There are suggestions that its use [is dwindling](https://digiday.com/media/were-building-for-media-businesses-of-tomorrow-how-the-washington-post-is-preparing-for-a-cookieless-future/), but it's [not going](http://www.prnewswire.com/news-releases/major-ad-trade-groups-release-joint-letter-outlining-deep-concerns-over-cookie-handling-functionality-of-apples-safari-11-browser-300519829.html) [away soon](https://www.blog.google/products/chrome/building-a-more-private-web/).

Anyway I digressed. Back to Container; the feature was later spun off as [an extension](https://addons.mozilla.org/en-US/firefox/addon/multi-account-containers/), while the built-in feature is still being developed. As of writing (Firefox 68), the feature is still disabled by default, but we can easily enable it. Simply go to `about:config`,

```
privacy.userContext.enabled;true
privacy.userContext.ui.enabled;true
privacy.userContext.longPressBehavior;2
```

Once you enabled it, you should be able to access its setting from `about:preferences#containers`. Here's what the default settings look like:

![Containers settings in Firefox Preferences](20190812/container-in-preferences.png)

![Containers' default setting](20190812/container-settings.png)

The name, icon and colour are customisable.

![Personalise Containers](20190812/container-personalisation.png)

There are two ways of using the Containers. We can open a link on a webpage in a specific container, by right-click ??? Open Link in New Container Tab.

![Containers right-click menu](20190812/container-context-menu.png)

We also can open a new container tab by long-pressing the plus (+) button, next to a tab.

![New Container Tab](20190812/containers-tabs.png)

![Container Tab in action](20190812/containers-tabs.webp)

## Facebook Container

There is a related extension, [Facebook Container](https://addons.mozilla.org/en-US/firefox/addon/facebook-container/) which is also made by Mozilla. It functions almost similarly, but specifically target Facebook's cookies.

With this extension, Facebook cookie (your login session) is sent only when you are accessing Facebook.com, as first-party. The cookie is not sent outside of Facebook.com, even when the website is using Facebook's resources. Meaning Facebook cookie is not used when Facebook.com is accessed as a third-party resource in another website. This sandbox feature also means Facebook comments would not work outside of Facebook.com.
