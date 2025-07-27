---
title: Disable Microsoft Defender (Powershell Script)
layout: page
date: 2025-07-27
---

References: [1](https://thedfirreport.com/2023/12/18/lets-opendir-some-presents-an-analysis-of-a-persistent-actors-activity/#defense-evasion)
SPL:

```spl
index="windows" source IN ("XmlWinEventLog:Microsoft-Windows-PowerShell/Operational", "XmlWinEventLog:PowerShellCore/Operational") EventCode=4104 ScriptBlockText IN ("*MpPreference*", "*Windows Defender*") ScriptBlockText IN ("*disable*", "*exclusion*")
| eval Time=strftime(_time,"%Y-%m-%d %H:%M:%S %z"), sid_lookup=replace(UserID, "'", "")
| lookup ad_users objectSid AS sid_lookup OUTPUT sAMAccountName AS Username
| eval user_lookup=replace(Username,"^(\w+)_admin","\1")
| lookup ad_users sAMAccountName AS user_lookup OUTPUT displayName AS Name, mail as Email, sAMAccountName AS Username
| table Time, host, Path, Username, Name, ScriptBlockText, System_Props_Xml
```
