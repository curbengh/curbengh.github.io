---
title: Malicious Host Threat Intelligence
layout: page
date: 2025-07-27
---

Description: This alert monitors for connection to known malicious hosts.
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Web WHERE index="proxy" Web.action!="blocked"
BY Web.user, Web.src, Web.dest, Web.url_domain, Web.url, Web.category, Web.action, _time span=1s
| rename Web.* AS *
```[](https://splunkbase.splunk.com/app/6970```)
| lookup urlhaus-filter-splunk-online host AS url_domain, host AS dest OUTPUT message AS description, updated
| lookup urlhaus-filter-splunk-online path_wildcard_prefix AS url, host AS url_domain, host AS dest OUTPUT message AS description2, updated AS updated2
| lookup phishing-filter-splunk host AS url_domain, host AS dest OUTPUT message AS description3, updated AS updated3
| lookup phishing-filter-splunk path_wildcard_prefix AS url, host AS url_domain, host AS dest OUTPUT message AS description4, updated AS updated4
| lookup pup-filter-splunk host AS url_domain, host AS dest OUTPUT message AS description5, updated AS updated5
| lookup vn-badsite-filter-splunk host AS url_domain, host AS dest OUTPUT message AS description6, updated AS updated6
| lookup botnet_ip dst_ip AS dest OUTPUT malware AS description7, updated AS updated7
| eval Description=coalesce(description, description2, description3, description4, description5, description6, description7)
| search Description=*
| lookup ldap_assets ip AS src OUTPUT nt_host
| lookup dhcp_lookup ip AS src OUTPUT nt_host AS nt_host2
| lookup ad_users sAMAccountName as user OUTPUT displayName as Name, mail as Email
| eval updated=coalesce(updated, updated2, updated3, updated4, updated5, updated6, updated7), "Signature Last Updated"=strftime(strptime(updated." +0000","%Y-%m-%dT%H:%M:%SZ %z"),"%Y-%m-%d %H:%M:%S %z"), Asset=coalesce(nt_host, nt_host2), Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), "Source IP"=src, Username=user, Domain=url_domain, "Destination IP"=dest, URL=url, Action=action
| table Time, "Signature Last Updated", "Source IP", Asset, Username, Name, Email, Domain, "Destination IP", Description, Action, URL
```
