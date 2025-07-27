---
title: Cloudflared/Tailscaled tunnel detection
layout: page
date: 2025-07-27
---

References: [1](https://thedfirreport.com/2024/12/02/the-curious-case-of-an-egg-cellent-resume/#command-and-control), [2](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/deploy-tunnels/tunnel-with-firewall/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Web WHERE index="proxy" Web.url_domain IN ("region*.argotunnel.com", "cftunnel.com", "update.argotunnel.com", "controlplane.tailscale.com", "derp*-all.tailscale.com")
BY Web.user, Web.src, Web.dest, Web.url_domain, Web.url, Web.category, Web.action, _time span=1s
| rename Web.* AS *
```
