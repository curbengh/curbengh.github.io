---
title: Firefox Multi-Account Containers
excerpt: Separate website cookies in a single session
date: 2019-08-12
tags:
- firefox
- privacy
- firefox-ext
---

There are situations where you may want to use more than one account on a website. Meaning you want to use more than one cookie for a specific website. This can be achieved by using a Private Window or creating/cloning a new Firefox profile. I previously wrote about Firefox profile in a {% post_link firefox-instances-profiles 'separate article' %}. While you can use more than two cookies through Firefox profile, this also means managing multiple profiles (especially if you want to use more than *four* cookies).

## Multi-Account Containers

Firefox Multi-Account Containers feature offers an easy way to separate cookies (login sessions). It was first mentioned in [blog.mozilla.org](https://blog.mozilla.org/tanvi/2016/06/16/contextual-identities-on-the-web/) in June 2016. By tracing the `privacy.userContext.enabled` and `privacy.userContext.ui` configs in previous Firefox versions, we can see the groundwork was laid in Firefox 44, albeit with limited functionality and there was no UI. UI was later landed in Firefox 50.

The feature was later spun off as [an extension](https://addons.mozilla.org/en-US/firefox/addon/multi-account-containers/), while the built-in feature is still being developed. As of writing (Firefox 68), the feature is disabled by default, but we can easily enable it. Simply go to `about:config`,

```
privacy.userContext.enabled;true
privacy.userContext.ui.enabled;true
privacy.userContext.longPressBehavior;2
```

Once you enabled it, you should be able to access its setting from `about:preferences#containers`. Here's what the default settings look like:

{% cloudinary '20190812/container-in-preferences.png' "Containers settings in Firefox Preferences" %}

{% cloudinary '20190812/container-settings.png' "Containers' default setting" %}

The name, icon and colour are customisable.

{% cloudinary '20190812/container-personalisation.png' "Personalise Containers" %}

There are two ways of using the Containers. We can open a link on a webpage in a specific container, by right-click → Open Link in New Container Tab.

{% cloudinary '20190812/container-context-menu.png' "Containers right-click menu" %}

We also can open a new container tab by long-pressing the plus (+) button, next to a tab.

{% cloudinary '20190812/containers-tab.png' "New Container Tab" %}

{% cloudinary '20190812/containers-webp.webp' "Container Tab in action" %}

## Facebook Container

There is a related extension, [Facebook Container](https://addons.mozilla.org/en-US/firefox/addon/facebook-container/) which is also made by Mozilla. It functions almost similarly, but specifically target Facebook's cookies.

With this extension, Facebook cookie (your login session) is sent only when you are accessing Facebook.com, as first-party. The cookie is not sent outside of Facebook.com, even when the website is using Facebook's resources. Meaning Facebook cookie is not used when Facebook.com is accessed as a third-party resource in another website. This sandbox feature also means Facebook comments would not work outside of Facebook.com.
