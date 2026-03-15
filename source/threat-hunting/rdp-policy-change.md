---
title: Remote Desktop Protocol (RDP) policy change
layout: page
date: 2026-03-15
---

References: [1](https://thedfirreport.com/2026/02/23/apache-activemq-exploit-leads-to-lockbit-ransomware/#defense-evasion), [2](https://learn.microsoft.com/en-us/troubleshoot/windows-server/remote/rdp-error-general-troubleshooting), [3](https://learn.microsoft.com/en-us/windows-server/remote/remote-desktop-services/remotepc/change-listening-port)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="reg.exe" Processes.process="*SYSTEM\\CurrentControlSet\\Control\\Terminal Server*" BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
```

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Endpoint.Registry WHERE index="windows" Registry.registry_path="*SYSTEM\\CurrentControlSet\\Control\Terminal Server*" BY Registry.dest, Registry.registry_path, Registry.registry_value_name, Registry.registry_value_data, Registry.action, Registry.process_guid, Registry.process_id, Registry.user
| rename Registry.* AS *
```
