---
title: Basic Brute Force Detection
layout: page
date: 2025-07-27
---

References: [1](https://instance.splunkcloud.com/en-GB/app/Splunk_Security_Essentials/showcase_simple_search?ml_toolkit.dataset=Basic%20Brute%20Force%20-%20Accelerated)
SPL:

```spl
| tstats summariesonly=t allow_old_summaries=t prestats=t count(Authentication.src) FROM datamodel=Authentication WHERE Authentication.action IN ("block*", "fail*") GROUPBY _time span=1d, Authentication.src
| tstats append=t summariesonly=t allow_old_summaries=t prestats=t count FROM datamodel=Authentication WHERE Authentication.action=success GROUPBY _time span=1d, Authentication.src
| stats count, count(Authentication.src) BY Authentication.src
| rename count AS successes, count(Authentication.src) AS failures, Authentication.* as *
| where successes>0 AND failures>100
```
