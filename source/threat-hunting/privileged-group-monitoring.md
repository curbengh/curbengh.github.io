---
title: Privileged Group Monitoring
layout: page
date: 2025-07-27
---

Description: Monitor AD Domain, NetworkAdmins, WorkstationAdmins and local Administrators groups for changes.
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count AS event_count FROM datamodel=Change.All_Changes WHERE index="windows" nodename=All_Changes.Account_Management.Accounts_Updated All_Changes.result_id IN (4728, 4729, 4732, 4733, 4746, 4747, 4751, 4752, 4756, 4757, 4761, 4762)
  [| inputlookup privileged_group_monitoring.csv | search exclude!="true" | fields group | rename group AS All_Changes.object_attrs]
  BY host, All_Changes.Account_Management.dest_nt_domain, All_Changes.Account_Management.src_user, All_Changes.object_attrs, All_Changes.object, All_Changes.result_id, All_Changes.result, _time span=1s
| rename All_Changes.Account_Management.* AS *, All_Changes.* AS *, dest_nt_domain AS Domain, src_user AS Admin, result_id AS EventCode, result AS EventName, object_attrs AS Group, object AS Member
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), admin_lookup=replace(Admin,"^(\w+)_admin","\1"), member_lookup=replace(Member,"^(\w+)_admin","\1"), memberUsername=Member
| lookup ad_users sAMAccountName AS admin_lookup OUTPUT displayName AS adminName, jobTitle AS adminJob, company AS adminCompany, department AS adminDepartment, mail AS adminEmail
| lookup ad_users sAMAccountName AS member_lookup OUTPUT displayName AS memberName, jobTitle AS memberJob, company AS memberCompany, department AS memberDepartment, mail AS memberEmail
| table Time, host, Domain, EventCode, EventName, Admin, adminName, adminJob, adminEmail, adminDepartment, adminCompany, Group, memberUsername, memberName, memberEmail, memberJob, memberDepartment, memberCompany
```
