---
title: DNS-over-TLS/DNS-over-HTTPS does not protect your privacy
date: 2019-04-04 00:00:00
tags:
- Privacy
- Security
---

Recently I stumbled upon this [bug report](https://lists.zx2c4.com/pipermail/wireguard/2019-February/003902.html), and as a side note, the reporter wants to use DNS-over-TLS (DoT) for privacy reasons; to prevent the ISP from knowing visited website. It turns out many also believe this after a brief search for news articles on DoT or DNS-over-HTTPS (DoH). Actually, DoT/DoH does not completely eliminate ISP surveillance. Here's why,

<!-- more -->

ISP still knows what **IP address** you are connecting to. Even with HTTPS and DoT/DoH, ISP currently can sniff the website domain you are visiting/visited including the complete URL due to a security weakness in the [Server Name Indication](https://en.wikipedia.org/wiki/Server_Name_Indication). This weakness can be fixed by using [Encrypted SNI](https://blog.cloudflare.com/esni/) (ESNI).

But even with all that, I repeat, ISP still *knows* what IP address you are connecting to. A simple reverse DNS lookup or even just by visiting the IP address can reveal what website it belongs to. Reverse DNS lookup is indeed not as easy as ten years ago due to the current proliferation of content delivery network (CDN) like Cloudflare. But it is still possible. For example, A `dig startpage @9.9.9.9` returned `216.218.239.2`. When you go to the IP through a web browser, it redirects to startpage.com. Going to gitlab.com's IP resulted in SSL warning with gitlab.com shown as the valid hostname.

{% cloudinary 20190404/gitlab-ip.png %}

Websites that are behind Cloudflare can be harder to lookup. For example, `dig is.gd @9.9.9.9` returned `104.25.23.21`, but going to that IP resulted in a Cloudflare error page. So, every website should use Cloudflare, I guess?

Anyhow, DoT/DoH helps to address DNS spoofing issue by preventing the DNS query/answer from being maliciously modified. It makes it *harder* for the ISP from recording your browsing history because it prevents them from doing DNS logging. But they can still continue doing **IP logging**. Not to mention DoT/DoH resolvers also can log DNS traffic. Even [DNSCrypt](https://en.wikipedia.org/wiki/DNSCrypt) cannot prevent that.

A brief search on DoT/DoH topics showed many (most?) news articles perpetuate the misconception that it can prevents ISP surveillance.

Title | Link
--- | ---
How to keep your ISP's nose out of your browser history with encrypted DNS | [[1]](https://arstechnica.com/information-technology/2018/04/how-to-keep-your-isps-nose-out-of-your-browser-history-with-encrypted-dns/)
Android takes aim at ISP surveillance with DNS privacy | [[2]](https://nakedsecurity.sophos.com/2017/10/27/android-takes-aim-at-isp-surveillance-with-dns-privacy/)
Android To Get 'DNS over TLS' Support To Hide Your Browsing Data From ISPs | [[3]](https://wccftech.com/android-dns-over-tls-isp/)
New Android Future "DNS over TLS" going to Stop ISPs from Knowing what websites you visit | [[4]](https://gbhackers.com/dns-over-tls/)
Prevent ISPs from seeing what website you’re viewing with DNS over TLS | [[5]](https://www.thesslstore.com/blog/what-is-dns-over-tls/)
Android getting "DNS over TLS" support to stop ISPs from knowing what websites you visit | [[6]](https://www.xda-developers.com/android-dns-over-tls-website-privacy/)




***TL;DR*** DoT/DoH doesn't hide your destination IPs. Use Tor/VPN for that.