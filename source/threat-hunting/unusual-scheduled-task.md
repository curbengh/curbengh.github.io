---
title: Unusual Scheduled Task
layout: page
date: 2025-07-27
updated: 2026-06-08
---

Description: [Minutely interval or with highest run level](https://blog.talosintelligence.com/gophish-powerrat-dcrat/#threat-actor-delivers-dcrat), [wscript/cscript](https://redcanary.com/blog/threat-intelligence/intelligence-insights-may-2024/), [rundll32 (1)](https://thedfirreport.com/2025/01/27/cobalt-strike-and-a-pair-of-socks-lead-to-lockbit-ransomware/#persistence), [rundll32 (2)](https://redcanary.com/blog/threat-intelligence/intelligence-insights-july-2025/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="schtasks.exe" (Processes.process IN ("*minute*", "*highest*") OR (Processes.process="*create*" Processes.process IN ("*wscript*", "*cscript*", "*rundll32*"))) BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Change.All_Changes WHERE index="windows" All_Changes.result_id=4698 All_Changes.object_attrs IN ("*wscript*", "*cscript*", "*rundll32*") BY host, All_Changes.command, All_Changes.object, All_Changes.object_attrs, All_Changes.result, All_Changes.result_id, All_Changes.user, _time span=1s
| rename All_Changes.* AS *, object AS TaskName, result AS EventDescription, result_id AS EventCode, object_attrs AS TaskAttributes
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, host, TaskName, command, EventCode, EventDescription, user, TaskAttributes
```
