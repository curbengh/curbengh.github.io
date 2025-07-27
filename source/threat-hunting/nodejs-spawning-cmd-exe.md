---
title: NodeJS spawning cmd.exe
layout: page
date: 2025-07-27
---

References: [1](https://redcanary.com/blog/threat-intelligence/intelligence-insights-june-2025/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.parent_process_name="node.exe" Processes.process_name IN ("cmd.exe", "powershell.exe", "pwsh.exe") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
```
