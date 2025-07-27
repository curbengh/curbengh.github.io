---
title: Windows JScript execution
layout: page
date: 2025-07-27
---

Description: JScript execution with unusual file extension.
References: [1](https://redcanary.com/blog/threat-intelligence/intelligence-insights-may-2025/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="(unknown)" count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name IN ("wscript.exe", "cscript.exe") Processes.process="*/e:jscript*" NOT Processes.process IN ("*.js", "*.bat", "*.cmd") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
```
