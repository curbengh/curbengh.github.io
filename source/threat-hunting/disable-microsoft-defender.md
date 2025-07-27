---
title: Disable Microsoft Defender
layout: page
date: 2025-07-27
---

References: [1](https://thedfirreport.com/2023/12/18/lets-opendir-some-presents-an-analysis-of-a-persistent-actors-activity/#defense-evasion), [2](https://thedfirreport.com/2024/08/12/threat-actors-toolkit-leveraging-sliver-poshc2-batch-scripts/#c25), [3](https://thedfirreport.com/2024/08/12/threat-actors-toolkit-leveraging-sliver-poshc2-batch-scripts/#c26)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process IN ("*defender*", "*MsMpEng*", "*MpPreference*") Processes.process IN ("*disable*", "*exclusion*", "*kill*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```
