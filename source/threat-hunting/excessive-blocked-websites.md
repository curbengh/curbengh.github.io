---
title: Excessive Blocked Websites
layout: page
date: 2025-07-27
---

Description: Track malicious websites that have been blocked >=15 or opened by >=3 users for the past hour.
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count AS per_user_count FROM datamodel=Web WHERE index="proxy" Web.action=blocked [| inputlookup malicious_categories.csv | where malicious!="false" | fields category | rename category AS Web.category] BY Web.user, Web.src, Web.url_domain, Web.category, Web.http_referrer, _time span=1s
| rename Web.* AS *
| stats count AS per_site_count, values(user) AS users, values(src) AS src_list, values(http_referrer) AS Referrer BY url_domain, category
```count may not be accurate due to duplicate events```
| where per_site_count>=15 OR mvcount(users)>=3
| sort -per_site_count
| lookup ldap_assets ip AS src_list OUTPUT dns AS src_host
| lookup ad_users sAMAccountName as users OUTPUT displayName as Name, mail as Email
| rename per_site_count AS total_count, url_domain AS Domain
| table Domain, category, Referrer, total_count, src_list, src_host, users, Name, Email
```
