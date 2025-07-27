---
title: Clear-text password search
layout: page
date: 2025-07-27
---

References: [1](https://blog.talosintelligence.com/uat-5918-targets-critical-infra-in-taiwan/#credential-extraction), [2](https://thedfirreport.com/2024/08/26/blacksuit-ransomware/#collection), [3](https://thedfirreport.com/2024/04/29/from-icedid-to-dagon-locker-ransomware-in-29-days/#credential-access)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="findstr.exe" Processes.process="*password*" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
```
