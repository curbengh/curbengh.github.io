---
title: SQL Server spawning Cmd.exe
layout: page
date: 2025-07-27
---

References: [1](https://redcanary.com/blog/threat-intelligence/intelligence-insights-april-2024/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.parent_process_name="sqlservr.exe" Processes.process_name="cmd.exe" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```
