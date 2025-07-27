---
title: Excessive Account Lockout
layout: page
date: 2025-07-27
---

Description: Track regular accounts that have been locked out >=10 for the past hour.
Caveats: (1) Asset assignment is better known as the last active user. (2) password update time may not be the latest.
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="null" count FROM datamodel=Change.All_Changes WHERE index="windows" nodename=All_Changes.Account_Management.Account_Lockouts All_Changes.result_id=4740 NOT All_Changes.user IN ("Administrator", "*_admin", "Guest") BY All_Changes.Account_Management.src_nt_domain, All_Changes.Account_Management.src_nt_host, All_Changes.Account_Management.dest_nt_domain, All_Changes.user, All_Changes.result_id, All_Changes.result, _time span=1s
| rename All_Changes.Account_Management.* AS *, All_Changes.* AS *, src_nt_domain AS Domain, user AS Username, result_id AS EventCode, result AS EventName
| eval Asset=if(src_nt_host!="null", src_nt_host, dest_nt_domain)
```there are 2 "count" (tstats & stats) to dedup original events```
| stats count AS event_count BY Domain, Asset, EventCode, EventName, Username
| where event_count>=10
| sort -event_count
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), user_lookup=replace(Username,"^(\w+)_admin","\1")
| lookup ad_users sAMAccountName AS user_lookup OUTPUT displayName AS Name, mail AS Email, pwdLastSet_localtime AS "Password Last Changed"
| lookup cmdb_ci_list_lookup name AS Asset OUTPUT dv_assigned_to AS "Asset Assigned To"
| lookup cmdb_ci_list_lookup dv_assigned_to AS Name OUTPUT name AS "User-assigned Asset(s)"
| rename Asset AS "Affected Asset", event_count AS Count
| table Domain, EventCode, EventName, "Affected Asset", "Asset Assigned To", Username, "Password Last Changed", Name, "User-assigned Asset(s)", Email, BizUnit, Company, Count
```
