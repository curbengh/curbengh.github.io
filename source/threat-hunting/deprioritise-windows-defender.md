---
title: Deprioritise Windows Defender
layout: page
date: 2025-07-27
---

Description: Identify if an unwanted application registered and enabled itself as a security provider in place of Defender.
References: [1](https://isc.sans.edu/diary/NoDefender+YesDefender/30980/)
SPL:

```spl
index="windows" source="XmlWinEventLog:Application" Name="'SecurityCenter'" EventCode=15 EventData_Xml!="<Data>Windows Defender</Data>*"
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup cmdb_ci_list_lookup name AS host OUTPUT dv_assigned_to AS "Last Active User"
| table Time, index, host, EventCode, EventData_Xml, "Last Active User"
```
