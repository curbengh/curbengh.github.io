---
title: Reboot to safe mode
layout: page
date: 2025-07-27
---

Description: This can be used to prevent antivirus or other preventative tools from stopping the ransom execution as many won't start when a host is booted in safe mode.
References: [1](https://thedfirreport.com/2024/09/30/nitrogen-campaign-drops-sliver-and-ends-with-blackcat-ransomware/#defense-evasion)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="bcdedit.exe" Processes.process="*default*" Processes.process="*safeboot*" Processes.process="*network*" BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```
