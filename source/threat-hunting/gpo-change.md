---
title: Group Policy Object change
layout: page
date: 2026-10-10
---

References: [1](https://securelist.com/tr/payload-ransomware-via-group-policy/121335/#detection-engineering), [2](https://sdmsoftware.com/group-policy-change-auditing-group-policy-blog/understanding-group-policy-change-auditing/), [3](https://www.windows-active-directory.com/how-to-detect-abuse-of-gpo-permissions.html), [4](https://research.splunk.com/endpoint/fe6a6cc4-9e0d-4d66-bcf4-2c7f44860876/)
Caveat: Requires [custom patch](https://gitlab.com/curben/splunk-scripts/-/commit/deddaf1b32968d9df9568e78a8880d0b74ce03e0) to [Splunk_TA_windows](https://gitlab.com/curben/splunk-scripts/-/tree/main/Splunk_TA_windows) and [Splunk_SA_CIM](https://gitlab.com/curben/splunk-scripts/-/tree/main/Splunk_SA_CIM)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Change.All_Changes WHERE index="windows" nodename=All_Changes.Account_Management.Accounts_Updated All_Changes.result_id IN ("5136", "5137", "5141") All_Changes.object_category IN ("groupPolicyContainer", "organizationalUnit") (All_Changes.object IN ("gPLink", "gPOptions", "nTSecurityDescriptor") OR (All_Changes.object="versionNumber" All_Changes.object_id IN ("*31B2F340-016D-11D2-945F-00C04FB984F9*", "*6AC1786C-016F-11D2-945F-00C04fB984F9*"))) BY All_Changes.Account_Management.src_user, All_Changes.Account_Management.src_nt_domain, All_Changes.object, All_Changes.object_attrs, All_Changes.object_category, All_Changes.object_id, All_Changes.result_id, All_Changes.result, _time span=1s
| rename All_Changes.Account_Management.* AS *, All_Changes.* AS *, src_user AS Admin, src_nt_domain AS Domain, object AS Attribute, object_attrs AS AttributeValue, object_category AS ObjectClass, object_id AS ObjectDN, result_id AS EventCode, result AS EventName
```
