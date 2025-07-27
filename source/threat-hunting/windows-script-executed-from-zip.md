---
title: Windows Script Executed from ZIP
layout: page
date: 2025-07-27
---

References: [1](https://redcanary.com/blog/intelligence-insights-september-2023/), [2](https://redcanary.com/blog/threat-intelligence/scarlet-goldfinch/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="wscript.exe" Processes.process IN ("*.zip*", "*.js*") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, host, process, parent_process, EventCode, EventDescription, user, Name, Email, index
```
