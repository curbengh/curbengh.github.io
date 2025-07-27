---
title: AppLocker Audit
layout: page
date: 2025-07-27
---

Description: Check if AppLocker is in audit mode. See [TA-applocker](https://gitlab.com/curben/splunk-scripts/-/tree/main/TA-Applocker) for more details.
SPL:

```spl
index="windows" source="XmlWinEventLog:Microsoft-Windows-AppLocker/*"
| dedup Channel, Computer, EventCode
| eval Time=strftime(_time,"%Y-%m-%d %H:%M:%S %z"), Username=user
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, Channel, Computer, EventCode, EventDescription, FilePath, UserID, Username, Name, Company, Department, Email
```
