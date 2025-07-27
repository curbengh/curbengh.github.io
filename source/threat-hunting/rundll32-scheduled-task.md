---
title: Rundll32 Scheduled Task
layout: page
date: 2025-07-27
---

References: [1](https://thedfirreport.com/2025/01/27/cobalt-strike-and-a-pair-of-socks-lead-to-lockbit-ransomware/#persistence)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Change.All_Changes WHERE index="windows" All_Changes.result_id=4698 All_Changes.object_attrs="*rundll32*" BY host, All_Changes.command, All_Changes.object, All_Changes.object_attrs, All_Changes.result, All_Changes.result_id, All_Changes.user, _time span=1s
| rename All_Changes.* AS *, object AS TaskName, result AS EventDescription, result_id AS EventCode, object_attrs AS TaskAttributes
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, host, TaskName, command, EventCode, EventDescription, user, TaskAttributes
```
