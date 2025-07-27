---
title: PowerShell Web Downloads
layout: page
date: 2025-07-27
---

References: [1](https://redcanary.com/blog/intelligence-insights-may-2023/), [2](https://www.malwarearchaeology.com/s/Windows-PowerShell-Logging-Cheat-Sheet-ver-Sept-2018-v22.pdf), [3](https://lolbas-project.github.io/lolbas/Binaries/Certutil/), [4](https://thedfirreport.com/2023/12/18/lets-opendir-some-presents-an-analysis-of-a-persistent-actors-activity/#discovery), [5](https://redcanary.com/blog/threat-intelligence/intelligence-insights-march-2024/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 ((Processes.process_name="powershell.exe" Processes.process IN ("*.download*", "*net.webclient*")) OR (Processes.process_name="certutil.exe" Processes.process IN ("*-urlcache*", "*-verifyctl*", "*-f*", "*/f*"))) BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```
