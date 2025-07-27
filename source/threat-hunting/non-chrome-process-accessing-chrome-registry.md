---
title: Non-Chrome process accessing Chrome registry
layout: page
date: 2025-07-27
---

Description: HKEY_LOCAL_MACHINE\SOFTWARE\Classes\AppID
708860E0-F641-4611-8895-7D867DD3675B = "ChromeElevationService"
1FCBE96C-1697-43AF-9140-2897C7C69767 = "MicrosoftEdgeElevationService"

References:[1](https://www.elastic.co/security-labs/katz-and-mouse-game)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode IN (4656, 4663) ObjectName IN ("\\REGISTRY\\MACHINE\\SOFTWARE\\Classes\\CLSID\\{708860E0-F641-4611-8895-7D867DD3675B}", "\\REGISTRY\\MACHINE\\SOFTWARE\\Classes\\CLSID\\{1FCBE96C-1697-43AF-9140-2897C7C69767}")
  NOT ProcessName IN ("C:\\Program Files\\Google\\Chrome\\Application\\*", "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\*")
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), EventDescription=signature, User=src_user
| lookup ad_users sAMAccountName AS src_user OUTPUT displayName, description AS AccountDescription
| table Time, index, host, EventCode, EventDescription, ObjectName, ProcessName, User, displayName, AccountDescription
```
