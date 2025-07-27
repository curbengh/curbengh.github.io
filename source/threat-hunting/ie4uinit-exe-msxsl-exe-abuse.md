---
title: ie4uinit.exe/msxsl.exe abuse
layout: page
date: 2025-07-27
---

Description: Abused by threat actor to execute COM scriptlets (SCT) from remote servers.
References: [1](https://thedfirreport.com/2024/12/02/the-curious-case-of-an-egg-cellent-resume/#execution), [2](https://lolbas-project.github.io/lolbas/Binaries/Ie4uinit/), [3](https://lolbas-project.github.io/lolbas/OtherMSBinaries/Msxsl/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" ((Processes.process_name="ie4uinit.exe" AND Processes.process="*basesetting*") OR Processes.process_name="msxsl.exe") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```
