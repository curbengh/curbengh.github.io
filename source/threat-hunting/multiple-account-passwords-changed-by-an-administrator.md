---
title: Multiple Account Passwords changed by an Administrator
layout: page
date: 2025-07-27
---

Description: An admin had changed passwords of at least 10 accounts in a day.
References: [1](https://instance.splunkcloud.com/en-GB/app/Splunk_Security_Essentials/showcase_simple_search?ml_toolkit.dataset=Multiple%20Account%20Passwords%20changed%20by%20an%20Administrator%20-%20Live)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Change.All_Changes WHERE index="windows" nodename=All_Changes.Account_Management.Accounts_Updated All_Changes.result_id IN (4724, 628) NOT All_Changes.user IN ("*$", "unknown") BY All_Changes.user, All_Changes.Account_Management.src_user, All_Changes.Account_Management.src_nt_domain, _time span=1s
| rename All_Changes.Account_Management.* AS *, All_Changes.* AS *, src_user AS Admin, src_nt_domain AS Domain
| dedup Domain, Admin, user
| eval admin_lookup=replace(Admin,"^(\w+)_admin","\1"), normal_admin=admin_lookup, normal_user=replace(user,"^(\w+)_admin","\1"), user_time="[".strftime(_time, "%H:%M")."] ".user
```exclude admins changing their accounts```
| where normal_admin!=normal_user
| table Domain, Admin, user_time, admin_lookup
| mvcombine user_time
| eval Users=mvjoin(mvsort(user_time), ", "), user_count=mvcount(user_time)
| where user_count>=10
| lookup ad_users sAMAccountName AS admin_lookup OUTPUT displayName AS Name
| sort Domain, Admin
| eval "Password updated by"=Admin
| table Domain, "Password updated by", Name, Users
```
