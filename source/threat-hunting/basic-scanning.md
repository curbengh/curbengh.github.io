---
title: Basic Scanning
layout: page
date: 2025-07-27
---

References: [1](https://instance.splunkcloud.com/en-GB/app/Splunk_Security_Essentials/showcase_simple_search?ml_toolkit.dataset=Basic%20Scanning%20-%20Accelerated)
SPL:

```spl
| tstats summariesonly=t allow_old_summaries=t dc(All_Traffic.dest_port) AS num_dest_port dc(All_Traffic.dest_ip) AS num_dest_ip FROM datamodel=Network_Traffic WHERE earliest=-1h BY All_Traffic.src_ip
| where num_dest_port > 1000 OR num_dest_ip > 1000
```
