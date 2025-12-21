---
title: Unusual User Agent
layout: page
date: 2025-07-27
updated: 2025-12-21
---

References: [1](https://www.security.com/threat-intelligence/shuckworm-ukraine-gammasteel), [2](https://blog.talosintelligence.com/new-persistent-attacks-japan/#initial-access), [NanoRemote](https://www.elastic.co/security-labs/nanoremote#network-communication)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="(null)" count FROM datamodel=Web WHERE index="proxy" NOT Web.http_user_agent IN ("*Chrome*", "*Safari*", "*Firefox*") BY Web.user, Web.src, Web.url, Web.url_domain, Web.category, Web.http_user_agent, Web.http_referrer, _time span=1s
| append
  [| tstats summariesonly=true allow_old_summaries=true fillnull_value="(null)" count FROM datamodel=Web WHERE index="proxy" BY Web.user, Web.src, Web.url, Web.url_domain, Web.category, Web.http_user_agent, Web.http_referrer, _time span=1s
  | where len(Web.http_user_agent) > 130]
| rename Web.* AS *, http_user_agent AS user_agent, http_referrer AS referrer
```
