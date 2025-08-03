---
title: Unusual Scheduled Task
layout: page
date: 2025-07-27
updated: 2025-08-03
---

Description: [Minutely interval or with highest run level](https://blog.talosintelligence.com/gophish-powerrat-dcrat/#threat-actor-delivers-dcrat), [wscript/cscript](https://redcanary.com/blog/threat-intelligence/intelligence-insights-may-2024/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="schtasks.exe" (Processes.process IN ("*minute*", "*highest*") OR (Processes.process="*create*" Processes.process IN ("*wscript*", "*cscript*"))) BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```
