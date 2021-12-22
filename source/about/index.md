---
title: About
layout: page
date: 2019-09-20
updated: 2021-12-19
---

## About Me

[![LinkedIn handle](/svg/linkedin.svg)](https://www.linkedin.com/in/mdleom/)

## Projects

[![GitHub handle](/svg/github.svg)](https://github.com/curbengh)&ensp;[![GitLab handle](/svg/gitlab.svg)](https://gitlab.com/curben)&ensp;[![npm handle](/svg/npm.svg)](https://www.npmjs.com/~curben)

- (Inactive) Core member of [Hexojs](http://github.com/hexojs) organisation and maintainer of [Hexo](https://github.com/hexojs/hexo), a Nodejs-powered static site generator. (This site is created using Hexo)

- [**hexo-yam**](https://github.com/curbengh/hexo-yam): Yet Another Minifier plugin for Hexo. Minify and compress HTML, JS, CSS and SVG. XML, JSON, etc. Support gzip and brotli compressions.

- [**hexo-nofollow**](https://github.com/curbengh/hexo-nofollow): A Hexo plugin that adds [`rel="external nofollow noopener noreferrer"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types) to all external links in your blog posts for security, privacy and SEO.

- [**urlhaus-filter**](https://gitlab.com/curben/urlhaus-filter): A set of blocklists to restrict ~3,000 malware websites. Part of [uBlock Origin](https://github.com/gorhill/uBlock)'s default filter. Based on [URLhaus](https://urlhaus.abuse.ch/).

- [**phishing-filter**](https://gitlab.com/curben/phishing-filter): A set of blocklists to restrict ~9,000 phishing websites. Based on [PhishTank](https://www.phishtank.com/) and [OpenPhish](https://openphish.com/).

- [**pup-filter**](https://gitlab.com/curben/pup-filter): A set of blocklists to restrict ~500 websites that host potentially unwanted programs (PUP). Based on [Zhouhan Chen](https://zhouhanc.com/)'s [malware-discoverer](https://github.com/zhouhanc/malware-discoverer).

- [**tracking-filter**](https://gitlab.com/curben/tracking-filter): A set of blocklists to restrict javascript links that perform [browser fingerprinting](https://en.wikipedia.org/wiki/Web_tracking). Based on DuckDuckGo [Tracker Radar](https://github.com/duckduckgo/tracker-radar). [Blokada version](https://blokada.org/blocklists/ddgtrackerradar/standard/hosts.txt) is can block more tracking links ([more details](https://community.blokada.org/t/introducing-duckduckgo-tracker-radar-to-blokada/469)) but with more false positives.

## Architecture

![Architecture behind mdleom.com](20200223/caddy-nixos.png)

mdleom.com is hosted on a [VPS](https://en.wikipedia.org/wiki/Virtual_private_server) with Cloudflare CDN. The OS is [NixOS](https://nixos.org/) and the web server is [Caddy](https://caddyserver.com/). The web server functions as a file server with ability to failover to mirrors (Cloudflare Pages, Netlify and GitHub Pages). It serves content via cloudflared that connects to the CDN network using an outbound tunnel. Blog content is deployed from a [GitLab repository](https://gitlab.com/curben/blog) which hosts the source. The repo also hosts [images and attachments](https://gitlab.com/curben/blog/-/tree/site); images are resized on-the-fly using [Statically](https://statically.io/).

More details are available in the following series of posts:

- {% post_link caddy-nixos-part-1 'Part 1: Install NixOS' %}
- {% post_link caddy-nixos-part-2 'Part 2: Configure NixOS' %}
- {% post_link caddy-nixos-part-3 'Part 3: Configure Caddy' %}
- {% post_link tor-hidden-onion-nixos 'Part 4: Setup Tor hidden service' %}
- {% post_link i2p-eepsite-nixos 'Part 5: Configure I2P' %}
- {% post_link cloudflare-argo-nixos 'Setup Cloudflare Argo Tunnel in NixOS' %}

## Services

- [Nitter](https://github.com/zedeus/nitter): A free and open source lightweight alternative Twitter front-end focused on privacy.
  * [Onion](http://26oq3gioiwcmfojub37nz5gzbkdiqp7fue5kvye7d4txv4ny6fb4wwid.onion)
  * [Eepsite](http://u6ikd6zndl3c4dsdq4mmujpntgeevdk5qzkfb57r4tnfeccrn2qa.b32.i2p)
- [Bibliogram](https://sr.ht/~cadence/bibliogram/): An alternative front-end for Instagram. It works without client-side JavaScript, has no ads or tracking, and doesn't urge you to sign up.
  * [Onion](http://g5kdmgu6dybc2wvfcyy67pax2b57sm2edtwjgikrzz4rps4qmny2y3id.onion)
  * [Eepsite](http://uc3imttrmypvgmmayqd4eaqcinwvy5yrriiirwgu3k6q2tum6khq.b32.i2p)
- [Teddit](https://codeberg.org/teddit/teddit): A free and open source alternative Reddit front-end focused on privacy.
  * [Onion](http://ibarajztopxnuhabfu7fg6gbudynxofbnmvis3ltj6lfx47b6fhrd5qd.onion)
  * [Eepsite](http://xugoqcf2pftm76vbznx4xuhrzyb5b6zwpizpnw2hysexjdn5l2tq.b32.i2p)
- [Libreddit](https://github.com/spikecodes/libreddit): A private front-end for Reddit. No JavaScript, no ads, no tracking, no bloat.
  * [Onion](http://twjxj64xqcxkz2gif4irnvnd5svvmwnlpv4zqxknwksqhx4yucxeg6ad.onion)
  * [Eepsite](http://gv47huyjz6esmu4q7ps6twvsn6pe7punuuzxa5cgwor2ubbt5jea.b32.i2p)
- [SimplyTranslate](https://simple-web.org/projects/simplytranslate.html): Provide fast and private translations to the user without wasting much overhead for extensive styling or JavaScript. Supports Google Translate engine.
  * [Onion](http://fmgp3rg56ng6mtb5gvu5hgzwwdyzgkmnanettwnmbnueues7ndw2fkyd.onion)
  * [Eepsite](http://mmiyv57bfhgc7p4pipk7jjqv5meuz5rjijoviquplvhxl3v7aoba.b32.i2p)
- [Lingva](https://github.com/TheDavidDelta/lingva-translate): An alternative front-end for Google Translate. Retrieves the translation without using any Google-related service.
  * [Onion](http://beko4bipbbqvwjizoswa3gcjrj3fdgb6nqthv7mt2gcswd2nln45ooid.onion)
  * [Eepsite](http://ek34dpqqketa3o75jucgiimy6uk5uxyrkr2iv6bt3jnbckshb5la.b32.i2p)
- [Wikiless](https://codeberg.org/orenom/wikiless): A free open source alternative Wikipedia front-end focused on privacy.
  * [Onion](http://c2pesewpalbi6lbfc5hf53q4g3ovnxe4s7tfa6k2aqkf7jd7a7dlz5ad.onion)
  * [Eepsite](http://hflqp2ejxygpj6cdwo3ogfieqmxw3b56w7dblt7bor2ltwk6kcfa.b32.i2p)
- [Scribe](https://sr.ht/~edwardloveall/scribe/): Alternative front-end to Medium.com
  * [Onion](http://3xejtix5tkneqclwbcuqi2mysi3bqp6qv2b3jwp466itjzjjptiwhdqd.onion)
  * [Eepsite](http://4dpb7ukgzbmmccrdpeyxkghptrh5ulvxlnfeyxay2ftzgkwf75ca.b32.i2p)

## Publications

- Leom, MD, Deegan, G, Martini, B & Boland, J 2021, 'Information disclosure in mobile device: examining the influence of information relevance and recipient', [_HICSS_](https://hicss.hawaii.edu/), pp. 4632-4640. [PDF](/files/publications/Information-disclosure-mobile-device.pdf)
- Leom, MD 2020, 'User privacy preservation on mobile devices: investigating the role of contextual integrity', PhD thesis, University of South Australia. [PDF](/files/publications/User-privacy-preservation_thesis.pdf)
- Leom, MD, Choo, K-KR & Hunt, R 2016, 'Remote wiping and secure deletion on mobile devices: a review', _Journal of Forensic Sciences_, pp. 1-20, doi: [10.1111/1556-4029.13203](https://doi.org/10.1111/1556-4029.13203). [Postprint](/files/publications/Remote-wiping-and-secure-deletion-on-mobile-devices-a-review_postprint.pdf)
- Leom, MD 2015, 'Remote wiping in Android', MSc thesis, University of South Australia. [PDF](/files/publications/Remote-wiping-in-Android_thesis.pdf)
- Leom, MD, D'orazio, CJ, Deegan, G & Choo, K-KR 2015, 'Forensic collection and analysis of thumbnails in Android', _Trustcom/BigDataSE/ISPA_, IEEE, pp. 1059-66, doi: [10.1109/Trustcom.2015.483](https://doi.org/10.1109/Trustcom.2015.483). [Postprint](/files/publications/Forensic-collection-and-analysis-of-thumbnails-in-Android_postprint.pdf)
