---
title: File hiding using attrib.exe observed
layout: page
date: 2025-07-27
---

Description: attrib.exe can be used to hide files from Explorer.
References: [1](https://thedfirreport.com/2025/03/31/fake-zoom-ends-in-blacksuit-ransomware/#defense-evasion), [2](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/attrib)

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="attrib.exe" Processes.process IN ("*+h", "*+s*", "*+r*") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
```
