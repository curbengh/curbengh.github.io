---
title: Disable Microsoft Defender (Registry)
layout: page
date: 2025-07-27
---

References: [1](https://thedfirreport.com/2025/05/19/another-confluence-bites-the-dust-falling-to-elpaco-team-ransomware/#defense-evasion), [2](https://learn.microsoft.com/en-us/windows-hardware/customize/desktop/unattend/security-malware-windows-defender-disableantispyware)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Endpoint.Registry WHERE index="windows" Registry.registry_path="*\\Microsoft\\Windows Defender*" Registry.registry_value_name IN ("DisableAntiSpyware", "DisableAntivirus") Registry.registry_value_data="1" BY Registry.dest, Registry.action, Registry.process_guid, Registry.process_id, Registry.registry_path, Registry.registry_value_name, Registry.registry_value_data, Registry.user
| rename Registry.* AS *
```
