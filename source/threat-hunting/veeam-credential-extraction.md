---
title: Veeam credential extraction
layout: page
date: 2025-08-06
---

References: [1](https://thedfirreport.com/2025/08/05/from-bing-search-to-ransomware-bumblebee-and-adaptixc2-deliver-akira/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="psql.exe" Processes.process="*VeeamBackup*" Processes.process IN ("*password*", "*credentials*") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
```
