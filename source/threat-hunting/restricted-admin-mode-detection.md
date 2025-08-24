---
title: Restricted Admin Mode Detection
layout: page
date: 2025-07-27
updated: 2025-08-24
---

Description: Restricted Admin Mode is commonly abused by Gootloader to use collected hashes to login instead of a password.
References: [1](https://github.com/GhostPack/RestrictedAdmin), [2](https://thedfirreport.com/2024/02/26/seo-poisoning-to-domain-control-the-gootloader-saga-continues/#defense-evasion)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="reg.exe" Processes.process="*disablerestrictedadmin*" BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Endpoint.Registry WHERE index="windows" Registry.registry_path="*\\CurrentControlSet\\Control\\Lsa*" Registry.registry_value_name="DisableRestrictedAdmin" BY Registry.dest, Registry.registry_path, Registry.registry_value_name, Registry.registry_value_data, Registry.action, Registry.process_guid, Registry.process_id, Registry.user
| rename Registry.* AS *
```
