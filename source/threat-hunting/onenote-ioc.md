---
title: OneNote IOC
layout: page
date: 2025-07-27
---

References: [1](https://redcanary.com/blog/intelligence-insights-february-2023/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.parent_process_path="c:\\program files (x86)\\microsoft office\\root\\office16\\onenote.exe" NOT Processes.process IN ("c:\\program files (x86)\\microsoft office\\root\\office16\\*.exe", "c:\\program files (x86)\\microsoft\\edge\\application\\msedge.exe") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
```excludes onenote quick launch & edge```
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```
