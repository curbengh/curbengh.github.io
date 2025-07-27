---
title: Account Lockout in Administrator Groups
layout: page
date: 2025-07-27
---

Description: Monitor Administrator, *_admin accounts for lockout.
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="null" count FROM datamodel=Change.All_Changes WHERE index="windows" nodename=All_Changes.Account_Management.Account_Lockouts All_Changes.result_id=4740 All_Changes.user IN ("Administrator", "*_admin") BY All_Changes.Account_Management.src_nt_domain, All_Changes.Account_Management.src_nt_host, All_Changes.Account_Management.dest_nt_domain, All_Changes.user, All_Changes.result_id, All_Changes.result, _time span=1s
| rename All_Changes.Account_Management.* AS *, All_Changes.* AS *, src_nt_domain AS Domain, user AS Username, result_id AS EventCode, result AS EventName
```src_nt_host is alias of Caller_Computer_Name in WinEventLog,
in XmlWinEventLog, TargetDomainName (alias to dest_nt_domain) is used instead Caller_Computer_Name```
| eval Asset=if(src_nt_host!="null", src_nt_host, dest_nt_domain)
| stats count, earliest(_time) AS first_lockout BY Domain, Asset, Username, EventCode, EventName
| eval "First Lockout"=strftime(first_lockout, "%Y-%m-%d %H:%M:%S %z"), user_lookup=replace(Username,"^(\w+)_admin","\1")
| lookup ad_users sAMAccountName AS user_lookup OUTPUT displayName AS Name, mail AS Email, pwdLastSet_localtime AS "Password Last Changed"
| table "First Lockout", Domain, Asset, EventCode, EventName, Username, Name, Email, BizUnit, Company, "Password Last Changed"
```
