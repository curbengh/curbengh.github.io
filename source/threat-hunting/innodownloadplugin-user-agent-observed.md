---
title: InnoDownloadPlugin user-agent observed
layout: page
date: 2025-07-27
---

Description: Inno Setup, a free installer for Windows programs. Inno Download Plugin is a component of Inno Setup.
References: [1](https://thedfirreport.com/2025/03/31/fake-zoom-ends-in-blacksuit-ransomware/#execution), [2](https://jrsoftware.org/isinfo.php)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Web WHERE index="proxy" Web.http_user_agent="*InnoDownloadPlugin*"
BY Web.user, Web.src, Web.dest, Web.url_domain, Web.url, Web.category, Web.action, _time span=1s
| rename Web.* AS *
```
