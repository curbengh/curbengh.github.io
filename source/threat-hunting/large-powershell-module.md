---
title: Large Powershell Module
layout: page
date: 2025-07-27
---

References: [1](https://www.malwarearchaeology.com/s/Windows-PowerShell-Logging-Cheat-Sheet-ver-Sept-2018-v22.pdf)
SPL:

```spl
index="windows" source IN ("XmlWinEventLog:Microsoft-Windows-PowerShell/Operational", "XmlWinEventLog:PowerShellCore/Operational") EventCode=4104
| eval Script_Length=len(ScriptBlockText), Time=strftime(_time,"%Y-%m-%d %H:%M:%S %z")
| where Script_Length > 1000
| eval sid_lookup=replace(UserID, "'", "")
| lookup ad_users objectSid AS sid_lookup OUTPUT sAMAccountName AS Username
| eval user_lookup=replace(Username,"^(\w+)_admin","\1")
| lookup ad_users sAMAccountName AS user_lookup OUTPUT displayName AS Name, mail as Email, sAMAccountName AS Username
| table Time, host, Path, Username, Name, Script_Length, ScriptBlockText, System_Props_Xml
```
