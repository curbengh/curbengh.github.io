---
title: PowerShell Web Downloads (Operational)
layout: page
date: 2025-07-27
---

References: [1](https://redcanary.com/blog/intelligence-insights-may-2023/), [2](https://www.malwarearchaeology.com/s/Windows-PowerShell-Logging-Cheat-Sheet-ver-Sept-2018-v22.pdf), [3](https://lolbas-project.github.io/lolbas/Binaries/Certutil/), [4](https://thedfirreport.com/2023/12/18/lets-opendir-some-presents-an-analysis-of-a-persistent-actors-activity/#discovery), [5](https://redcanary.com/blog/threat-intelligence/intelligence-insights-march-2024/)
SPL:

```spl
index="windows" source IN ("XmlWinEventLog:Microsoft-Windows-PowerShell/Operational", "XmlWinEventLog:PowerShellCore/Operational") EventCode=4104 ScriptBlockText IN ("*.Download*", "*Net.WebClient*", "*certutil* -urlcache*", "*certutil* -f*", "*certutil* /f*")
| eval sid_lookup=replace(UserID, "'", "")
| lookup ad_users objectSid AS sid_lookup OUTPUT sAMAccountName AS Username
| eval user_lookup=replace(Username,"^(\w+)_admin","\1")
| lookup ad_users sAMAccountName AS user_lookup OUTPUT displayName AS Name, mail AS Email
| table _time, host, Path, Computer, ScriptBlockText, Username, Name, Company, Department, Email
```
