---
title: You should switch to these replacements of TrueCrypt/KeePassX/Adblock Plus
date: 2019-01-15
tags:
- Linux
- Web
---

TrueCrypt and KeePassX have been discontinued while Adblock Plus has been [commercialised](https://en.wikipedia.org/wiki/Adblock_Plus#Controversy_over_ad_filtering_and_ad_whitelisting). Their replacements are [VeraCrypt](https://www.veracrypt.fr/), [KeePassXC](https://keepassxc.org/) and [uBlock Origin](https://github.com/gorhill/uBlock/) respectively.

<!-- more -->

## VeraCrypt

{% cloudinary '20190115/veracrypt.png' 'Screenshot of VeraCrypt' %}

VeraCrypt is a fork of the discontinued [TrueCrypt](https://en.wikipedia.org/wiki/TrueCrypt). It includes security improvements and fixes over the original—for example using much higher iterations (327,661-655,331 vs 1,000-2,000) to generate the header key—to make brute force more costly. This improvement along with supporting more ciphers and their combinations, means its storage format is incompatible to the original's. User still has the option to open TrueCrypt volume and (optionally, but recommended) convert it to VeraCrypt format.

## KeePassXC

{% cloudinary '20190115/keepassxc.png' 'Screenshot of KeePassXC' %}

KeePassXC is a fork of the discontinued [KeePassX](https://www.keepassx.org/). KeePassX started out as a Linux port of (previously Windows-only) KeePass. While both eventually become cross-platform, I stick with KeePassX (even on Windows) for being lighter and quicker to launch. The [Mono](https://www.mono-project.com/)-developed KeePass—like Java—makes it not quite as native as Qt-developed KeePass, thus feels slower on Linux. It last [released](https://www.keepassx.org/news/2016/10/609) in October 2016 with no further update since then.

Notable [improvements](https://keepassxc.org/project/) of KeePassXC including KDBX 4.0 format support and [YubiKey](https://keepassxc.org/docs/#faq-yubikey-2fa) support (*incompatible* with KeePass2). KDBX 4.0 adds support for ChaCha20 cipher, Argon2 key derivation function and other [enhancements](https://keepass.info/help/kb/kdbx_4.html).

## uBlock Origin

{% cloudinary '20190115/ubo.png' 'Screenshot of uBlock Origin' %}

uBlock Origin (uBO) is a popular ad blocker well-known for its low memory and CPU usage (compared to other ad blockers). The [dynamic filtering](https://github.com/gorhill/uBlock/wiki/Dynamic-filtering:-quick-guide) allows granular control over filtering rules. It supports HOSTS syntax for blocking malicious websites. I created a [blocklist](https://gitlab.com/curben/urlhaus-filter) based on the Abuse.sh [URLhaus](https://urlhaus.abuse.ch/). 

## Miscellaneous

Meanwhile, for server environment:

Software | Replacement | Comment
--- | ---
MySQL | [MariaDB](https://mariadb.org/)
ownCloud | [Nextcloud](https://nextcloud.com/)
Apache/nginx | [Caddy](https://caddyserver.com/) | It's not a direct replacement, rather a web server that prioritise secure-by-default.
