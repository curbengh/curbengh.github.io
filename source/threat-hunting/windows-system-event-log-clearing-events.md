---
title: Windows System Event Log Clearing Events
layout: page
date: 2025-07-27
---

Description: Looks for Windows event codes that indicate the Windows Audit Logs were tampered with.
References: [1](https://instance.splunkcloud.com/en-GB/app/Splunk_Security_Essentials/showcase_simple_search?ml_toolkit.dataset=Windows%20Event%20Log%20Clearing%20Events%20-%20Live), [2](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=1102)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Change.All_Changes WHERE index="windows" (source="XmlWinEventLog:Security" AND All_Changes.result_id=1102) OR (source="XmlWinEventLog:System" AND All_Changes.result_id=104)
  BY host, All_Changes.dest, All_Changes.object, All_Changes.object_path, All_Changes.result, All_Changes.result_id, All_Changes.user, _time span=1s
| rename All_Changes.* AS *, dest AS Computer, object_path AS Name, result AS EventDescription, result_id AS EventCode, user AS Context
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, host, EventCode, EventDescription, Name, object, Context, Computer
```
