---
title: Transfer new domains to Cloudflare Registrar
excerpt: Register new domain on NameSilo, then transfer to Cloudflare
date: 2019-09-05
tags:
- cloudflare
---

[Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) service was introduced back in [September 2018](https://blog.cloudflare.com/cloudflare-registrar/). It differs from other registrars by having no markup fees, meaning no additional cost on top of what it pays to the wholesale registry and [ICANN](https://en.wikipedia.org/wiki/ICANN). So, you essentially get the wholesale price. While you may find registrars that offer cheaper than the wholesale's (you can compare prices on [TLD-List.com](https://tld-list.com/)), it is likely that there are hidden costs somewhere.

While the service has been offered for a while, the only way to jump into it is by transferring existing domains (that you already own). This means you cannot register new domain(s) through Cloudflare, at least not yet as of writing. So, how do you get onboard if you want to get a new domain, but haven't purchase one?

Before you rush off to purchase your funky new domain, do note that (as per ICAAN rule) you need to wait for 60 days *after* getting a domain before you are able to transfer to another registrar. As for which registrar to go to, I had a good experience with [NameSilo](https://new.namesilo.com/) and successfully transferred to Cloudflare. The main reason I went with NameSilo⁠—instead of GoDaddy or NameCheap⁠—is that it does not require disabling WHOIS Privacy whereas the later two require it.

For optimal privacy, register a NameSilo account *before* you make your purchase. After you register an account, go to "Account Settings", scroll to the bottom and adjust the following settings.

![Recommended NameSilo User Settings](20190905/namesilo-user.png)

Now proceed to purchase your domain (remember to enable WHOIS Privacy in the cart, it's free) and wait for 60 days. While you are waiting, register a Cloudflare account and change the [name server](https://support.cloudflare.com/hc/en-us/articles/201720164-Creating-a-Cloudflare-account-and-adding-a-website) to Cloudflare's on NameSilo Domain Console page. This step is required before you can transfer to Cloudflare.

Once the transfer lock period has passed, go to your domain **Overview** on Cloudflare, on the right bottom is the "Domain Registration" section to kickstart the transfer. Mine looks different because I already transferred.

![Domain Registration Section on Cloudflare](20190905/cloudflare-registrar-section.png)

Simply follow [the process](https://developers.cloudflare.com/registrar/domain-transfers/transfer-flow/) and you should be able to transfer across in less than three days. To expedite the process, after you make the payment, you should receive the following email from NameSilo in less than a day.

![NameSilo transfer notification](20190905/transfer-notification.png)

Once you receive that, go to "Transfer Manager" and click Approve. After you approve, the domain should be transferred across in 15 minutes.

However, the process above may not go as smoothly and the initial transfer might fail. If you receive an email from Cloudflare saying the transfer was rejected, fret not, most probably it is rejected by the registry (for whatever reason) instead of NameSilo. Simply restart the transfer  through the Domain Registration section. The authorization code is the same (as what you receive from NameSilo's email), so you don't need to request again.

![Domain Registration Section on Cloudflare](20190905/cloudflare-registrar-section.png)

Disclaimer: I do **not** receive any commission from any of the products mentioned above. None of the links are affiliate link.
