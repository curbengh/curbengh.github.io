---
title: Access Facebook/Instagram/Whatsapp/Google in China
subtitle: Data roaming, commercial VPN provider to rolling your own VPN.
date: 2018-12-31
lastUpdated: 2019-01-13
tags:
- security
---

Facebook/Instagram/Whatsapp/Google are blocked in China. You can either use data roaming or VPN to access them. Roll your own VPN if you don't trust commercial VPN provider.

## Data Roaming

Data roaming using a foreign SIM is the easiest and most reliable method. You don't need to install any app, just pop the SIM, enable data roaming and you're good to go. Any foreign SIM would work, as long it's not Mainland China. Hong Kong, Macau or Taiwan's SIM is considered as a foreign SIM, so it works as well.

However, this method is also the most expensive. Unless your telco offers a cheap global roaming plan (e.g. [Google Fi](https://fi.google.com/about/international-rates/)), following are your best options:

1. [StarHub Internet-only SIM](http://www.starhub.com/personal/mobile/mobile-phones-plans/prepaid-cards/internet-sim.html)

Screenshots:
[5-Day](https://res.cloudinary.com/curben/image/upload/20181231/starhub-5-day.jpg), [15-Day](https://res.cloudinary.com/curben/image/upload/20181231/starhub-15-day.jpg)

2. China Unicom Data-only SIM

Screenshots:
[3-day](https://res.cloudinary.com/curben/image/upload/20181231/unicom-3-day.jpg), [5-day](https://res.cloudinary.com/curben/image/upload/20181231/unicom-5-day.jpg), [7-Day](https://res.cloudinary.com/curben/image/upload/20181231/unicom-7-day.jpg), [8-Day](https://res.cloudinary.com/curben/image/upload/20181231/unicom-8-day.jpg), [15-Day](https://res.cloudinary.com/curben/image/upload/20181231/unicom-15-day.jpg), [30-Day](https://res.cloudinary.com/curben/image/upload/20181231/unicom-30-day.png)

StarHub | China Unicom HK
---|---
Pros:<br/>- Support [more countries](http://www.starhub.com/personal/mobile/mobile-phones-plans/prepaid-cards/happy-roam.html#hr_plans)<br/>- Can be kept active | Pros:<br/>- Widely available online<br/>- Does not require ID
Cons:<br/>- Only available at Singapore Airport | Cons:<br/>- One-time use only\* <br/>- Support only Mainland China.\**

\* Except for [this product](https://res.cloudinary.com/curben/image/upload/20181231/unicom-cross-border.jpg).
\** Some plans include Hong Kong, Macau or Taiwan.


StarHub SIM is available at the Singapore Changi Airport, so it's a good option if you transit over there. You can top-up the prepaid value to keep it active. However, I think this SIM is not available online, so if you're not transiting through Singapore, your next option would be the China Unicom SIM.

China Unicom SIMs shown here are provided by its Hong Kong subsidiary, so they are considered as foreign SIM and use data roaming. They are widely available online, you can easily purchase it through eBay, Amazon or your local online shopping. You don't need an ID to purchase it, and the seller won't request it either. It works all over the Mainland, unlike some China domestic SIMs that only work in the originating city or state. This benefit applies to any roaming SIM.

Do note the SIM package cover must be one of four examples provided above, otherwise the SIM could be China Unicom domestic SIM ([example](https://res.cloudinary.com/curben/image/upload/20181231/unicom-domestic.jpg)). The SIM is one-time use only. The SIM is activated once you start using it and when you reach the validity period, it can no longer be used.

If you haven't noticed, the SIMs I mentioned here (including Starhub and China Unicom) are **data-only** (some can call/text, read below). So you can't make/send/receive calls and SMS.

**Edit**: I found China Unicom SIMs that can call (not sure about text) between Mainland and Hong Kong; [3-day](https://res.cloudinary.com/curben/image/upload/20181231/unicom-3-day.jpg) and [5-day](https://res.cloudinary.com/curben/image/upload/20181231/unicom-5-day.jpg) SIMs. They are Hong Kong SIMs, so they should work. They include data but the SIMs are one-time use only.

For regular SIMs that include call and text, I found this [Hong Kong SIM](https://res.cloudinary.com/curben/image/upload/20181231/unicom-cross-border.jpg). The seller usually also sells prepaid voucher, so you can keep it active like StarHub's.

For the purpose of this article, you should *avoid* this [domestic SIM](https://res.cloudinary.com/curben/image/upload/20181231/unicom-domestic.jpg) (which is subjected to local censorship) and this [Asia SIM](https://res.cloudinary.com/curben/image/upload/20181231/unicom-asia-8-dau.jpg) that doesn't include Mainland.

## VPN

Data roaming can be exorbitantly expensive, especially if you're going to stay there for more than a month. Not to mention the data plan that is puny to the data-hungry. The next option, which is more well-known, is VPN.

VPN works by having an intermediate or proxy server, usually located overseas, to forward back-and-forth your Internet traffic. The traffic between your device and the proxy is encrypted, so it can't be analysed and censored (in theory), in addition to the server being located elsewhere.

Following is the list of VPNs that I've tried:

Provider | Platform | Protocol
---|---|---
Amazon EC2 (via Algo) | iOS | IPSec
 | Android | Wireguard
VyprVPN | Windows | Chameleon
 | iOS | Chameleon
Mullvad | Android | Wireguard

Amazon EC2 (Algo) | VyprVPN | Mullvad
---|---|---
Pros:<br/>- Free [1-year trial](https://aws.amazon.com/free/) | - Easiest to setup | - More technical customer support
Cons:<br/>- Hardest to setup<br/>- Free trial has limited traffic | - Most expensive | - Not battery-friendly

They all worked at least once, except for the Windows platform which never worked. I believe it was more of a router issue, as I can't connect to any VPN at all with an old home router I encountered.

None of them was 100% reliable. It seemed you would have a higher success rate when connecting through low (data/human) traffic area, but YMMW.

VyprVPN is the easiest to use among the three. It offers proprietary Chameleon protocol, which claimed to add obfuscation on top of OpenVPN, thus less likely to be detected and blocked.

Mullvad is a cheaper alternative. It offers OpenVPN and Wireguard. They are the first commercial VPN provider to offer Wireguard, so you can expect a level of technical knowledge with their customer support. They're not as popular as VyprVPN and perhaps attract less attention from the censorship regime. But having fewer users also means they don't operate as many servers or own many IPs; and if they're somehow got targeted, they have fewer IPs to switch to.

You can roll your own VPN if you don't trust commercial provider. [Algo](https://github.com/trailofbits/algo) is a bunch of scripts put together to make it much easier for you to do that. With Algo, you can either set up a home server which is least likely to get blocked, or you can use cloud providers if you don't want to mess around with port forwarding. Several cloud providers offer a free trial, usually with some limitations like traffic limit. The limit is not too bad, for example, Amazon EC2 offers 15GB/month. Obviously, this limit doesn't apply in a home server.

In my experience, despite Algo's effort, I still think it's much harder than using a commercial VPN provider. This is not Algo's fault actually. Setting up an EC2 account is too complicated than it should, and the complex Amazon cloud ecosystem is not helping.

Anyhow, for best results with Algo, I recommend using multiple cloud providers in multiple locations, in case one of them is blocked.
