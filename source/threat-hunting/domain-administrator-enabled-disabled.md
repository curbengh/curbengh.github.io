---
title: Domain Administrator enabled/disabled
layout: page
date: 2025-07-27
---

Description: Identify when the domain Administrator account is being enabled or disabled. The account must never be enabled.
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Change.All_Changes WHERE index="windows" nodename=All_Changes.Account_Management.Accounts_Updated All_Changes.result_id IN (4722, 4725) All_Changes.user="Administrator" BY All_Changes.user, All_Changes.Account_Management.src_user, All_Changes.Account_Management.src_nt_domain, All_Changes.result, All_Changes.result_id, _time span=1s
| rename All_Changes.Account_Management.* AS *, All_Changes.* AS *, src_user AS Admin, src_nt_domain AS Domain, result_id AS EventCode, result AS EventDescription
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), admin_lookup=replace(Admin,"^(\w+)_admin","\1")
| lookup ad_users sAMAccountName AS admin_lookup OUTPUT displayName AS Name, mail AS Email
| table Time, EventCode, EventDescription, user, Admin, Name, Email
```
