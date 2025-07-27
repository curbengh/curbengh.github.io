---
title: Regsvcs.exe process injection
layout: page
date: 2025-07-27
---

Description: regsvcs.exe executing without any command-line parameters
References: [1](https://redcanary.com/blog/threat-intelligence/intelligence-insights/intelligence-insights-february-2024/), [2](https://lolbas-project.github.io/lolbas/Binaries/Regsvcs/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="regsvcs.exe" Processes.process="c:\\windows\\microsoft.net\\framework*\\regsvcs.exe" BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```
