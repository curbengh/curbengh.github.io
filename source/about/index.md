---
title: About
layout: page
date: 2019-09-20
updated: 2024-07-20
---

## About Me

[![LinkedIn handle](/svg/linkedin.svg)](https://www.linkedin.com/in/mdleom/)

## Projects

[![GitHub handle](/svg/github.svg)](https://github.com/curbengh) [![GitLab handle](/svg/gitlab.svg)](https://gitlab.com/curben) [![npm handle](/svg/npm.svg)](https://www.npmjs.com/~curben) [![Codeberg handle](/svg/codeberg.svg)](https://codeberg.org/curben/)

- [**malware-filter**](https://gitlab.com/malware-filter): A collection of blocklists:

  - [**urlhaus-filter**](https://gitlab.com/malware-filter/urlhaus-filter): A set of blocklists to restrict malware-hosting websites. Enabled by default in uBlock Origin. Based on [URLhaus](https://urlhaus.abuse.ch/).

  - [**phishing-filter**](https://gitlab.com/malware-filter/phishing-filter): A set of blocklists to restrict phishing websites. Bundled with uBlock Origin, requires manual enablement. Curated from [PhishTank](https://www.phishtank.com/), [OpenPhish](https://openphish.com/), [Phishunt](https://phishunt.io) and mitchellkrogza's [Phishing.Database](https://github.com/mitchellkrogza/Phishing.Database).

  - (Inactive) [**pup-filter**](https://gitlab.com/malware-filter/pup-filter): A set of blocklists to restrict websites that host potentially unwanted programs (PUP). Based on [Zhouhan Chen](https://zhouhanc.com/)'s [malware-discoverer](https://github.com/zhouhanc/malware-discoverer).

  - [**tracking-filter**](https://gitlab.com/malware-filter/tracking-filter): A set of blocklists to restrict javascript links that perform [browser fingerprinting](https://en.wikipedia.org/wiki/Web_tracking). Based on DuckDuckGo [Tracker Radar](https://github.com/duckduckgo/tracker-radar). [Blokada version](https://community.blokada.org/t/introducing-duckduckgo-tracker-radar-to-blokada/469) blocks more tracking links but the trade-off is more false positive; available at [blokada.org](https://blokada.org/blocklists/ddgtrackerradar/standard/hosts.txt).

  - [**vn-badsite-filter**](https://gitlab.com/malware-filter/vn-badsite-filter): A set of blocklists to restrict malicious websites targeting Vietnamese users; also suitable for global users. Based on [Hieu Minh Ngo](https://chongluadao.vn)'s list.

  - [**botnet-filter**](https://gitlab.com/malware-filter/botnet-filter): A set of blocklists to restrict botnet IPs used as command and control (C2) servers. Based on [Feodo Tracker](https://feodotracker.abuse.ch/). Recommend to use the [upstream blocklist](https://feodotracker.abuse.ch/blocklist/) whenever possible, it has much more frequent update (every 5 minutes).

  - [**splunk-malware-filter**](https://gitlab.com/malware-filter/splunk-malware-filter): A Splunk add-on for update malware-filter lookups.

- [**splunk-scripts**](https://gitlab.com/curben/splunk-scripts): Miscellaneous python scripts for Splunk.

- [**aws-scripts**](https://gitlab.com/curben/aws-scripts): Security-related python scripts for AWS.

- (Inactive) Core contributor of [Hexo](https://github.com/hexojs/hexo), a Nodejs-powered static site generator. (This site is created using Hexo)

- [**hexo-yam**](https://github.com/curbengh/hexo-yam): Yet Another Minifier plugin for Hexo. Minify and compress HTML, JS, CSS and SVG. XML, JSON, etc. Support gzip and brotli compressions.

- [**hexo-nofollow**](https://github.com/curbengh/hexo-nofollow): A Hexo plugin that adds [`rel="external nofollow noopener noreferrer"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types) to all external links in your blog posts for security, privacy and SEO.

## Architecture

![Architecture behind mdleom.com](about/website-architecture.png)

mdleom.com is served from two identical VMs hosted in a cloud provider. The VMs are using [NixOS](https://nixos.org/) and [Caddy](https://caddyserver.com/) web server. The web server functions as a file server to serve static website. Each VM has cloudflared to connect the web server to Cloudflare CDN using an outbound tunnel. Each cloudflared instance acts as a [replica](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/deploy-cloudflared-replicas/) that connects to the same tunnel to provide failover.

The web server is able to failover to mirrors ([Cloudflare Pages](https://curben.pages.dev), [Netlify](https://curben.netlify.app), [GitLab Pages](https://curben.gitlab.io) and [GitHub Pages](https://curbengh.github.io)). Blog content is deployed from a [GitLab repository](https://gitlab.com/curben/blog) which hosts the source. The source is compiled to static site using [Hexo](https://hexo.io). The repo also hosts [images and attachments](https://gitlab.com/curben/blog/-/tree/site); images are resized on-the-fly using [Statically](https://statically.io/).

More details are available in the following series of posts:

- {% post_link caddy-nixos-part-1 'Part 1: Install NixOS' %}
- {% post_link caddy-nixos-part-2 'Part 2: Configure NixOS' %}
- {% post_link caddy-nixos-part-3 'Part 3: Configure Caddy' %}
- {% post_link tor-hidden-onion-nixos 'Part 4: Setup Tor hidden service' %}
- {% post_link i2p-eepsite-nixos 'Part 5: Configure I2P' %}
- {% post_link cloudflare-argo-nixos 'Setup Cloudflare Argo Tunnel in NixOS' %}

## Services

- [Teddit](https://codeberg.org/teddit/teddit): A free and open source alternative Reddit front-end focused on privacy.
  - [Onion](http://clnxvdfthhcmvwhauaadincmitimhawq7nee4dmqkk4nfkpfi3orsgad.onion)
  - [Eepsite](http://xugoqcf2pftm76vbznx4xuhrzyb5b6zwpizpnw2hysexjdn5l2tq.b32.i2p)
- [SimplyTranslate](https://simple-web.org/projects/simplytranslate.html): Provide fast and private translations to the user without wasting much overhead for extensive styling or JavaScript. Supports Google Translate engine.
  - [Onion](http://fmgp3rg56ng6mtb5gvu5hgzwwdyzgkmnanettwnmbnueues7ndw2fkyd.onion)
  - [Eepsite](http://mmiyv57bfhgc7p4pipk7jjqv5meuz5rjijoviquplvhxl3v7aoba.b32.i2p)
- [Lingva](https://github.com/TheDavidDelta/lingva-translate): An alternative front-end for Google Translate. Retrieves the translation without using any Google-related service.
  - [Onion](http://beko4bipbbqvwjizoswa3gcjrj3fdgb6nqthv7mt2gcswd2nln45ooid.onion)
  - [Eepsite](http://ek34dpqqketa3o75jucgiimy6uk5uxyrkr2iv6bt3jnbckshb5la.b32.i2p)
- [Wikiless](https://github.com/Metastem/wikiless): A free open source alternative Wikipedia front-end focused on privacy.
  - [Onion](http://g6gr4dahewooeelw3h44qhqzr3x2jy475xm6rpve4m6hrsqe467lwxad.onion)
  - [Eepsite](http://hflqp2ejxygpj6cdwo3ogfieqmxw3b56w7dblt7bor2ltwk6kcfa.b32.i2p)
- [Scribe](https://sr.ht/~edwardloveall/scribe/): Alternative front-end to Medium.com
  - [Onion](http://3xejtix5tkneqclwbcuqi2mysi3bqp6qv2b3jwp466itjzjjptiwhdqd.onion)
  - [Eepsite](http://4dpb7ukgzbmmccrdpeyxkghptrh5ulvxlnfeyxay2ftzgkwf75ca.b32.i2p)
- [LibMedium](https://git.batsense.net/realaravinth/libmedium): Privacy-focused proxy for medium.com
  - [Onion](http://atfykf7jyn4uxuwdqmonyz4xohrw5mrnrldkwtulxkpictxrm3xxfsyd.onion)
  - [Eepsite](http://c4vqxvn27l7z5neffrasc22xxoglf23eudmp7mtwmk3yqgrbefsa.b32.i2p)
- [Rimgo](https://codeberg.org/video-prize-ranch/rimgo): An alternative frontend for Imgur. Images and albums can be viewed without wasting resources from downloading and running tracking scripts.
  - [Onion](http://eertpnpliglunzserhwbr2unvyfa4dj7j3iq43sktlytvhcmgj4io6id.onion)
  - [Eepsite](http://xazdnfgtzmcbcxhmcbbvr4uodd6jtn4fdiayasghywdn227xsmoa.b32.i2p)
- [Quetre](https://github.com/zyachel/quetre): A libre front-end for Quora.
  - [Onion](http://4sg56knxo4vklsb7uj6iwtnuuwqyrel5im75ovlml6zywdnpeed55xqd.onion)
  - [Eepsite](http://yk5xtcyxoyj4hwj3g5yzdest6ixqri332prqvpwcufmufzdelcuq.b32.i2p)
- [libremdb](https://github.com/zyachel/libremdb): A free & open source IMDb front-end.
  - [Onion](http://ijridx42bzzelztznz7lzeoule4ug45qmtmvhffotdetj6xxaxi54ryd.onion)
  - [Eepsite](http://jjr6zhcpe763emklpklre3vorzluczwd67uxhb5pxslawn4dedwa.b32.i2p)
- [AnonymousOverflow](https://github.com/httpjamesm/AnonymousOverflow): View StackOverflow in privacy and without the clutter.
  - [Onion](http://7gpurrl7besakeh6ml5xkxriamnmt2awbt3u7o5td6lkeocmqujikzad.onion)
  - [Eepsite](http://kb2qqt2ycigflptnyqvamamqnexwnqnzghnwswtty773mn24jkfa.b32.i2p)
- [LibreTranslate](https://github.com/LibreTranslate/LibreTranslate): Free and Open Source Machine Translation API.
  - [Onion](http://ryp7domnuvrha3sm5fohl75vrj3opolykbfv6rh35hg5i4uo3rrpslid.onion)
  - [Eepsite](http://b5nins66p4rpvspyr3j43x26lapr7e5jm4nnvv53gbtljfcbgihq.b32.i2p)
- [Redlib](https://github.com/redlib-org/redlib): Private front-end for Reddit.
  - [Onion](http://dzfahc2b6rbt6zqos4xdfhdzoes25vbsquupge3dcni7rnft7s6fvjyd.onion)
  - [Eepsite](http://qmab3wkogmb6xscouvzpjzaeetemcfikpj7g7vk6wuho4pk7jutq.b32.i2p)

## Publications

- Leom, MD, Deegan, G, Martini, B & Boland, J 2021, 'Information disclosure in mobile device: examining the influence of information relevance and recipient', [_HICSS_](https://hicss.hawaii.edu/), pp. 4632-4640. [PDF](/files/publications/Information-disclosure-mobile-device.pdf)
- Leom, MD 2020, 'User privacy preservation on mobile devices: investigating the role of contextual integrity', PhD thesis, University of South Australia. [PDF](/files/publications/User-privacy-preservation_thesis.pdf)
- Leom, MD, Choo, K-KR & Hunt, R 2016, 'Remote wiping and secure deletion on mobile devices: a review', _Journal of Forensic Sciences_, pp. 1-20, doi: [10.1111/1556-4029.13203](https://doi.org/10.1111/1556-4029.13203). [Postprint](/files/publications/Remote-wiping-and-secure-deletion-on-mobile-devices-a-review_postprint.pdf)
- Leom, MD 2015, 'Remote wiping in Android', MSc thesis, University of South Australia. [PDF](/files/publications/Remote-wiping-in-Android_thesis.pdf)
- Leom, MD, D'orazio, CJ, Deegan, G & Choo, K-KR 2015, 'Forensic collection and analysis of thumbnails in Android', _Trustcom/BigDataSE/ISPA_, IEEE, pp. 1059-66, doi: [10.1109/Trustcom.2015.483](https://doi.org/10.1109/Trustcom.2015.483). [Postprint](/files/publications/Forensic-collection-and-analysis-of-thumbnails-in-Android_postprint.pdf)
