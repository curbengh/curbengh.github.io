---
title: Account Discovery Using DIR, WHOAMI, and NET
layout: page
date: 2025-07-27
---

References: [1](https://thedfirreport.com/2025/05/19/another-confluence-bites-the-dust-falling-to-elpaco-team-ransomware/#discovery)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="cmd.exe" Processes.process IN ("*whoami*", "*dir C:\\Users*", "*net localgroup administrators*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
```
