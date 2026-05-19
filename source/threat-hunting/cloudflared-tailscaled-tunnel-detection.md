---
title: Cloudflared/Tailscaled/NetBird/Azure-Dev tunnel detection
layout: page
date: 2025-07-27
updated: 2026-05-19
---

References: [Cloudflared](https://thedfirreport.com/2024/12/02/the-curious-case-of-an-egg-cellent-resume/#command-and-control), [Netbird](https://www.sophos.com/en-us/blog/qemu-abused-to-evade-detection-and-enable-ransomware-delivery), [Azure Dev Tunnel](https://isc.sans.edu/diary/Njrat+Campaign+Using+Microsoft+Dev+Tunnels/31724/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Web WHERE index="proxy" Web.url_domain IN ("region*.argotunnel.com", "cftunnel.com", "update.argotunnel.com", "controlplane.tailscale.com", "derp*-all.tailscale.com", "api.netbird.io", "signal.netbird.io", "stun.netbird.io", "turn.netbird.io", "*.relay.netbird.io", "*.devtunnels.ms")
BY Web.user, Web.src, Web.dest, Web.url_domain, Web.url, Web.category, Web.action, _time span=1s
| rename Web.* AS *
```
