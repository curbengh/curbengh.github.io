---
title: AD Account Deletion
layout: page
date: 2025-07-27
---

References: [1](https://instance.splunkcloud.com/en-GB/app/Splunk_Security_Essentials/showcase_simple_search?ml_toolkit.dataset=Multiple%20Account%20Deletion%20by%20an%20Administrator%20-%20Live)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true dc(All_Changes.user) FROM datamodel=Change.All_Changes WHERE index="windows" nodename=All_Changes.Account_Management.Accounts_Deleted All_Changes.result_id IN (4726, 630) All_Changes.user!="*$" BY All_Changes.user, All_Changes.Account_Management.src_user, All_Changes.Account_Management.src_nt_domain, _time span=1s
| rename All_Changes.Account_Management.* AS *, All_Changes.* AS *, src_user AS Admin, src_nt_domain AS Domain
| dedup Domain, Admin, user
| eval admin_lookup=replace(Admin,"^(\w+)_admin","\1"), user_time="[".strftime(_time, "%H:%M")."] ".user
| table Domain, Admin, user_time, admin_lookup
| mvcombine user_time
| eval Users=mvjoin(mvsort(user_time), ", ")
| lookup ad_users sAMAccountName AS admin_lookup OUTPUT displayName AS Name
| sort Domain, Admin
| eval "Deleted by"=Admin
| table Domain, "Deleted by", Name, Users
```
