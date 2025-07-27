---
title: Excessive AWS WAF Blocked Events
layout: page
date: 2025-07-27
---

Description: Track source IP with >=100 blocked events for the past hour.
Caveats: Requires custom patch to [Splunk_TA_aws](https://gitlab.com/curben/splunk-scripts/-/tree/main/Splunk_TA_aws) and [Splunk_SA_CIM](https://gitlab.com/curben/splunk-scripts/-/tree/main/Splunk_SA_CIM)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Web WHERE index="aws" source="aws:firehose:waf" Web.action="block" BY Web.src, Web.url_domain, _time span=1s
| rename "Web.*" as "*"
| eval Time=strftime(_time,"%Y-%m-%d %H:%M:%S %z")
| stats earliest(Time) AS first_occur, sum(count) AS event_count BY src, url_domain
| where event_count>=100
```sample 20 events from each IP```
| join type=inner max=20 src
  [| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Web WHERE index="aws" source="aws:firehose:waf" Web.action="block" NOT Web.uri_path IN ("/", "/favicon.ico") BY Web.src, Web.uri_path
  | rename "Web.*" as "*"
  | table uri_path, src]
| mvcombine uri_path
| rename uri_path AS sample_20_paths, url_domain AS Domain, src AS source_ip
| iplocation source_ip
| sort -event_count
| table first_occur, Domain, source_ip, Country, sample_20_paths, event_count
```
