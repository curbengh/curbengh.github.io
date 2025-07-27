---
title: EvilProxy IoC
layout: page
date: 2025-07-27
---

Description: A user has possibly visited a phishing site operated behind EvilProxy that reverse proxy to Microsoft sites.
References: [1](https://www.menlosecurity.com/blog/evilproxy-phishing-attack-strikes-indeed/)
SPL:

```spl
index="proxy" url IN ("*/ests/2.1/content/*", "*/shared/1.0/content/*", "*/officehub/bundles/*") NOT url_domain IN ("aadcdn.msftauth.net", "res.cdn.office.net", "logincdn.msftauth.net", "aadcdn.msauth.net", "lgincdnvzeuno.azureedge.net")
| lookup ldap_assets ip AS srcip OUTPUT dns AS Asset
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email, jobTitle AS Title
| eval Domain=coalesce(url_domain, site, hostname, dstname), URL=url, Category=catdesc
| table _time, Domain, URL, Category, action, referralurl, user, Name, Title, Asset, Email, Department, Company
| dedup visited_link, user
```
