---
title: Access Facebook/Instagram/Whatsapp/Google/ChatGPT/TikTok in China
excerpt: Data roaming or roll your own VPN.
date: 2018-12-31
updated: 2026-08-09
tags:
  - censorship
  - travel
---

Facebook/Instagram/Whatsapp/Google/ChatGPT/TikTok are blocked in China. You can either use data roaming or VPN to access them. Roll your own VPN if you don't trust commercial VPN providers.

## Data Roaming

Data roaming using a foreign eSIM is the easiest and most reliable method. You don't need to install any app, just scan/install the eSIM before departure, enable data roaming once landed and you're good to go. Any roaming eSIM would work, as long it's not Mainland China's. Hong Kong, Macau or Taiwan's SIM is considered as a roaming SIM, so they work as well.

If your phone doesn't support eSIM, an alternative is to get a [eSIM adapter](https://euicc-manual.osmocom.org/docs/lpa/known-card/#product) which is a SIM card that you can install eSIM on it. I bought ESTKme eSIM adapter from [JMP](https://jmp.chat/esim-adapter) (with USB reader), installed eSIM using JMP [SIM Manager](https://f-droid.org/en/packages/chat.jmp.simmanager/) and it worked fine.

Following are eSIMs commonly available at online eSIM retailers. Most retailers don't specify the original eSIM provider but you can infer by APN value though this is usually tucked away in the troubleshooting page.

| Provider                 | APN                 | Notes               |
| ------------------------ | ------------------- | ------------------- |
| SingTel                  | e-ideas             |
| StarHub                  | shppd               |
| China Mobile (Hong Kong) | cmhk                | No ChatGPT & TikTok |
| 3HK                      | mobile.three.com.hk | No ChatGPT & TikTok |

## Deploy private VPN using Algo

Data roaming can be expensive, especially if you're going to stay there for more than a month. Not to mention the data plan that is puny to the data-hungry users.

VPN works by having an intermediate or proxy server, usually located overseas, to forward back-and-forth your Internet traffic. The traffic between your device and the proxy is encrypted, so it can't be analysed and censored (in theory), in addition to the server being located elsewhere.

You can roll your own VPN if you don't trust commercial provider. [Algo](https://github.com/trailofbits/algo) is a bunch of scripts put together to make it much easier for you to do that. With Algo, you can either set up a home server which is least likely to get blocked, or you can use cloud providers if you don't want to mess around with port forwarding. Several cloud providers offer a free trial, usually with some limitations like traffic limit. The limit is not too bad, for example, Amazon EC2 offers 15GB/month. Obviously, this limit doesn't apply to a home server.

In my experience, despite Algo's effort, I still think it's much harder than using a commercial VPN provider. This is not Algo's fault per se. Setting up an EC2 account is too complicated than it should, and the complex Amazon cloud ecosystem is not helping.

Anyhow, for best results with Algo, I recommend using multiple cloud providers in multiple locations, in case one of them is blocked.
