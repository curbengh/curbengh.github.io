---
title: RestartManager abuse
layout: page
date: 2025-07-27
---

Description: Ransomware often abuse RestartManager to force applications to release the locks they have on files so it can proceed to encrypt the files.
Caveat: Adjust the `quantity` appropriately to reduce false positive.
References: [1](https://blogs.jpcert.or.jp/en/2024/09/windows.html), [2](https://www.crowdstrike.com/en-us/blog/windows-restart-manager-part-1/)
SPL:

```spl
index="windows"  source="XmlWinEventLog:Application" EventCode IN (10000,10001) Name="'Microsoft-Windows-RestartManager'"
| eval Time=strftime(_time,"%Y-%m-%d %H:%M:%S %z"), objectSid=replace(UserID, "'", "")
| stats earliest(Time) AS first_occur, count BY index, host, objectSid
| lookup ad_users objectSid OUTPUT sAMAccountName AS Username, displayName AS Name
| table first_occur, index, host, objectSid, Username, Name
| sort -first_occur
```
