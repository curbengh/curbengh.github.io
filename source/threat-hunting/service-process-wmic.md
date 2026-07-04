---
title: Service Disabling/Process Termination using WMIC
layout: page
date: 2026-07-04
---

References: [1](https://thedfirreport.com/2026/06/29/from-bing-search-to-ransomware-bumblebee-and-adaptixc2-deliver-akira-3/#impact)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="wmic.exe" Processes.process IN ("*service*", "*process*") Processes.process IN ("*disabled*", "*delete*") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
```
