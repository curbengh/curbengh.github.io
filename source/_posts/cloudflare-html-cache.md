---
title: Cloudflare does not cache html by default
excerpt: But it can be easily enabled
date: 2020-11-21
tags:
- cloudflare
---

In this guide, I'll show you how to enable html caching. Since I started using Cloudflare eight months ago, I always make sure [caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) is configured correctly so that most of the content are served from CDN, which is much faster than serving content from my origin server. This is in addition to the fact that this website is a static site, so _all_ content are cacheable. I configured caching in [Netlify](https://gitlab.com/curben/blog/-/blob/master/source/_headers), [Caddy](/blog/2020/03/14/caddy-nixos-part-3/#Cache-Control) and [Cloudflare](https://support.cloudflare.com/hc/en-us/articles/200168276-Understanding-Browser-Cache-TTL). However, every time I check the analytics (Analytics -> Performance), it only showed 1% of content is served from cache.

![1% bandwidth saved](20201121/cf-before.png)

It was only last week that I realised that Cloudflare does not cache everything by default, only certain [file extensions](https://support.cloudflare.com/hc/en-us/articles/200172516#h_a01982d4-d5b6-4744-bb9b-a71da62c160a) are cached and they do not include HTML and XML, despite majority (55%) of content served are HTML and XML.

Html caching can be easily enabled through Page Rules. Since my site's content are all static, I opt to cache _everything_ instead. To achieve this, I created a new page rule:

- URL: `https://mdleom.com/*`
  * The asterisk (*) is to apply the page rule to every page under HTTPS, instead of just the homepage.
- Setting: Cache Level
- Value: Cache Everything

After a week with the new page rule, cached content has now increased to 72%.

![72% bandwidth saved](20201121/cf-after.png)
