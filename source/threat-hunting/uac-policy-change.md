---
title: User Account Control (UAC) policy change
layout: page
date: 2025-08-24
---

References: [1](https://blog.talosintelligence.com/uat-7237-targets-web-hosting-infra/#configuration-changes)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="reg.exe" Processes.process IN ("*disablerestrictedadmin*", "*LocalAccountTokenFilterPolicy*", "*UseLogonCredential*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
```

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Endpoint.Registry WHERE index="windows" ((Registry.registry_path="*\\Microsoft\\Windows\\CurrentVersion\\Policies\\system*" Registry.registry_value_name="LocalAccountTokenFilterPolicy") OR (Registry.registry_path="*\\CurrentControlSet\Control\SecurityProviders\WDigest*" Registry.registry_value_name="UseLogonCredential")) BY Registry.dest, Registry.registry_path, Registry.registry_value_name, Registry.registry_value_data, Registry.action, Registry.process_guid, Registry.process_id, Registry.user
| rename Registry.* AS *
```
