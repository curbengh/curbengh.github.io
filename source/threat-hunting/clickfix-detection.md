---
title: ClickFix detection
layout: page
date: 2025-07-27
---

Description: Detecting ClickFix execution via the Windows Run dialog.
References: [1](https://detect.fyi/hunting-clickfix-initial-access-techniques-8c1b38d5ef9b), [2](https://www.proofpoint.com/us/blog/threat-insight/clipboard-compromise-powershell-self-pwn), [3](https://www.mcafee.com/blogs/other-blogs/mcafee-labs/clickfix-deception-a-social-engineering-tactic-to-deploy-malware/), [4](https://research.splunk.com/endpoint/a15aa1ab-2b79-467f-8201-65e0f32d5b1a/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Endpoint.Registry WHERE index="windows" Registry.registry_path="*\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RunMRU*" Registry.registry_value_data IN ("*powershell*", "*pwsh*", "*cmd*", "*mshta*") (Registry.registry_value_data IN ("*start-process*", "*hidden*", "*command*", "*bypass*", "*new-object*", "*http*", "*invoke*", "*iex*", "*-exec*", "*verification*", "*classname*", "*cimmethod*", "*methodname*", "*win32_process*", "*system.diagnostics.process*", "*system.management.automation*", "*Reflection.Assembly*", "*FromBase64String*", "*import-module*", "*add-type*", "*webclient*") OR Registry.registry_value_data IN ("*http*", "*javascript:*", "*verification*", "*eval*", "*.js*", "*.vbs*", "*.hta*", "*.bat*")) NOT Registry.registry_value_name="MRUList" BY Registry.dest, Registry.registry_path, Registry.registry_value_name, Registry.registry_value_data, Registry.action,  Registry.process_guid, Registry.process_id, Registry.user
| rename Registry.* AS *
| where len(registry_value_data) >= 50
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
```
