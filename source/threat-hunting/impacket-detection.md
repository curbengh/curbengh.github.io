---
title: Impacket detection
layout: page
date: 2025-07-27
---

Description: Commonly abused by threat actor to execute commands remotely.
References: [1](https://thedfirreport.com/2024/06/10/icedid-brings-screenconnect-and-csharp-streamer-to-alphv-ransomware-deployment/#execution)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" ((Processes.process_name="cmd.exe" AND Processes.process="*\\\\127.0.0.1\\*") OR (Processes.process_name="svchost.exe" AND Processes.process="*regsvc*")) BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```
