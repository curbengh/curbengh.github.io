---
title: Microsoft Public Symbol download
layout: page
date: 2025-07-27
---

References: [1](https://blog.talosintelligence.com/blackbyte-blends-tried-and-true-tradecraft-with-newly-disclosed-vulnerabilities-to-support-ongoing-attacks/#novel-observations)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Web WHERE index="proxy" Web.url_domain="msdl.microsoft.com"
BY Web.user, Web.src, Web.dest, Web.url_domain, Web.url, Web.category, Web.action, _time span=1s
| rename Web.* AS *
| lookup ldap_assets ip AS src OUTPUT nt_host
| lookup dhcp_lookup ip AS src OUTPUT nt_host AS nt_host2
| lookup ad_users sAMAccountName as user OUTPUT displayName as Name, mail as Email
| eval Asset=coalesce(nt_host, nt_host2), Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), "Source IP"=src, Username=user, Domain=url_domain, "Destination IP"=dest, URL=url, Action=action
| table Time, "Source IP", Asset, Username, Name, Email, Domain, "Destination IP", Action, URL
```
