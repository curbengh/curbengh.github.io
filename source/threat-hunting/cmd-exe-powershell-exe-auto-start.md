---
title: cmd.exe/powershell.exe auto-start
layout: page
date: 2025-07-27
---

References: [1](https://thedfirreport.com/2024/08/26/blacksuit-ransomware/#execution), [2](https://thedfirreport.com/2025/01/27/cobalt-strike-and-a-pair-of-socks-lead-to-lockbit-ransomware/#lateral-movement), [3](https://www.unh4ck.com/detection-engineering-and-threat-hunting/lateral-movement/detecting-conti-cobaltstrike-lateral-movement-techniques-part-1#cobaltstrike-jump-psexec_psh)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Services WHERE index="windows" Services.signature_id="7045" Services.process IN ("*comspec*", "*cmd*", "*powershell*", "*pwsh*") BY index, host, Services.signature_id, Services.signature, Services.process, Services.service_name, _time span=1s
| rename Services.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, host, EventCode, EventDescription, service_name, process, index
```
