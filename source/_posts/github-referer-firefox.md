---
title: GitHub now requires web browser to send referer
excerpt: Otherwise it would respond with HTTP Error 422
date: 2019-12-08
tags:
- firefox
- privacy
---

Firefox offers a security feature which you can restrict [HTTP referer](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer) from being sent with varying granularity ([docs](https://wiki.mozilla.org/Security/Referrer)). I disabled referer altogether through `network.http.referer.defaultPolicy;0`. Most of the websites that I usually browse work just fine without referer. For website that do require ({% post_link aliexpress-no-login-firefox 'example' %}), I created {% post_link firefox-instances-profiles 'another profile' %} with slightly less strict referer policies.

A website that had always worked without referer was GitHub, until 26 October 2019. At that time, I kept encountering HTTP Error 422 whenever I try to create a new pull request (the [pull request](https://github.com/hexojs/hexo/pull/3800) in question). I later pinpointed the cause to be the referer policy after I managed to create pull request in another Firefox profile and Chromium, that do not have any referer policy in place. I ended up with [duplicate](https://github.com/hexojs/hexo/pull/3801) [pull](https://github.com/hexojs/hexo/pull/3802) requests in the process.

The referer policy I ended up is ``network.http.referer.defaultPolicy;1` (default is `3`) which restricts the referer to the same origin only. This config is compatible with *every* website I've encountered so far, including those that require referer. One thing to note is that website can set referer policy through [Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy) response header. But a website can only set it to the same or more strict than browser's. For this website, I set it [`no-referrer`](https://gitlab.com/curben/blog/blob/master/source/_headers), the strictest setting equivalent to `network.http.referer.defaultPolicy;0`.
