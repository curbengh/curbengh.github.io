---
title: Cloudflared/Tailscaled/NetBird tunnel detection
layout: page
date: 2025-07-27
updated: 2026-04-25
---

References: [1](https://thedfirreport.com/2024/12/02/the-curious-case-of-an-egg-cellent-resume/#command-and-control), [2](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/deploy-tunnels/tunnel-with-firewall/), [3](https://www.sophos.com/en-us/blog/qemu-abused-to-evade-detection-and-enable-ransomware-delivery)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Web WHERE index="proxy" Web.url_domain IN ("region*.argotunnel.com", "cftunnel.com", "update.argotunnel.com", "controlplane.tailscale.com", "derp*-all.tailscale.com", "api.netbird.io", "signal.netbird.io", "stun.netbird.io", "turn.netbird.io", "*.relay.netbird.io")
BY Web.user, Web.src, Web.dest, Web.url_domain, Web.url, Web.category, Web.action, _time span=1s
| rename Web.* AS *
```
