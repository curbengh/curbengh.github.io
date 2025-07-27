---
title: Protected Group Monitoring
layout: page
date: 2025-07-27
---

Description: Monitor new account with adminCount=1.
References: [1](https://learn.microsoft.com/en-us/windows/win32/adschema/a-admincount), [2](https://blog.netwrix.com/2022/09/30/admincount_attribute/), [3](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/security-best-practices/appendix-c--protected-accounts-and-groups-in-active-directory)
SPL:

```spl
index="ldapsearch" destCsv="hourly_adminCount.csv" adminCount=1
| join type=left sAMAccountName domain
  [ | inputlookup ad_users.csv
  | search adminCount=1
  | rename adminCount AS wasAdmin
  | table sAMAccountName domain wasAdmin]
| search NOT wasAdmin=1
| rename domain AS Domain, sAMAccountName AS User, displayName AS Name, mail AS Email
| table Domain, User, Name, Email
```
