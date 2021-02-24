---
title: About
layout: page
date: 2019-09-20
updated: 2021-02-24
---

## About Me

[![LinkedIn handle](/svg/linkedin.svg)](https://www.linkedin.com/in/mdleom/)

## Projects

[![GitHub handle](/svg/github.svg)](https://github.com/curbengh)&ensp;[![GitLab handle](/svg/gitlab.svg)](https://gitlab.com/curben)&ensp;[![npm handle](/svg/npm.svg)](https://www.npmjs.com/~curben)

- Core member of [Hexojs](http://github.com/hexojs) organisation and maintainer of [Hexo](https://github.com/hexojs/hexo), a Nodejs-powered static site generator. (This site is created using Hexo)

- [**hexo-yam**](https://github.com/curbengh/hexo-yam): Yet Another Minifier plugin for Hexo. Minify and compress HTML, JS, CSS and SVG. XML, JSON, etc. Support gzip and brotli compressions.

- [**hexo-nofollow**](https://github.com/curbengh/hexo-nofollow): A Hexo plugin that adds [`rel="external nofollow noopener noreferrer"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types) to all external links in your blog posts for security, privacy and SEO.

- [**urlhaus-filter**](https://gitlab.com/curben/urlhaus-filter): A set of blocklists to restrict ~3,000 malware websites. Part of [uBlock Origin](https://github.com/gorhill/uBlock)'s default filter. Based on [URLhaus](https://urlhaus.abuse.ch/).

- [**phishing-filter**](https://gitlab.com/curben/phishing-filter): A set of blocklists to restrict ~9,000 phishing websites. Based on [PhishTank](https://www.phishtank.com/) and [OpenPhish](https://openphish.com/).

## Architecture

![Architecture behind mdleom.com](20200223/caddy-nixos.png)

mdleom.com is hosted on a [VPS](https://en.wikipedia.org/wiki/Virtual_private_server) with Cloudflare CDN. The OS is [NixOS](https://nixos.org/) and the web server is [Caddy](https://caddyserver.com/). The web server is a reverse proxy, specifically an active/standby load balancer to multiple backend for redundancy. The backend (where the static site is actually hosted) are Cloudflare Pages, Netlify and GitHub Pages, in order of priority. Blog content is deployed from a [GitLab repository](https://gitlab.com/curben/blog) which hosts the source. The repo also hosts [images and attachments](https://gitlab.com/curben/blog/-/tree/site); images are resized on-the-fly using [Statically](https://statically.io/).

More details are available in the following series of posts:

- {% post_link caddy-nixos-part-1 'Part 1: Install NixOS' %}
- {% post_link caddy-nixos-part-2 'Part 2: Configure NixOS' %}
- {% post_link caddy-nixos-part-3 'Part 3: Configure Caddy' %}
- {% post_link tor-hidden-onion-nixos 'Part 4: Setup Tor hidden service' %}
- {% post_link i2p-eepsite-nixos 'Part 5: Configure I2P' %}

## Publications

- Leom, MD, Deegan, G, Martini, B & Boland, J 2021, 'Information disclosure in mobile device: examining the influence of information relevance and recipient', [_HICSS_](https://hicss.hawaii.edu/), pp. 4632-4640. [PDF](/files/publications/Information-disclosure-mobile-device.pdf)
- Leom, MD 2020, 'User privacy preservation on mobile devices: investigating the role of contextual integrity', PhD thesis, University of South Australia. [PDF](/files/publications/User-privacy-preservation_thesis.pdf)
- Leom, MD, Choo, K-KR & Hunt, R 2016, 'Remove wiping and secure deletion on mobile devices: a review', _Journal of Forensic Sciences_, pp. 1-20, doi: [10.1111/1556-4029.13203](https://doi.org/10.1111/1556-4029.13203). [Postprint](/files/publications/Remote-wiping-and-secure-deletion-on-mobile-devices-a-review_postprint.pdf)
- Leom, MD 2015, 'Remote wiping in Android', MSc thesis, University of South Australia. [PDF](/files/publications/Remote-wiping-in-Android_thesis.pdf)
- Leom, MD, D'orazio, CJ, Deegan, G & Choo, K-KR 2015, 'Forensic collection and analysis of thumbnails in Android', _Trustcom/BigDataSE/ISPA_, IEEE, pp. 1059-66, doi: [10.1109/Trustcom.2015.483](https://doi.org/10.1109/Trustcom.2015.483). [Postprint](/files/publications/Forensic-collection-and-analysis-of-thumbnails-in-Android_postprint.pdf)
