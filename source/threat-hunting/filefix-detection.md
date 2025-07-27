---
title: FileFix detection
layout: page
date: 2025-07-27
---

References: [1](https://www.mobile-hacker.com/2025/06/24/introducing-filefix-a-new-alternative-to-clickfix-attacks/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.parent_process_name IN ("msedge.exe", "msedgewebview2.exe", "chrome.exe", "firefox.exe") Processes.process_name IN ("cmd.exe", "powershell.exe", "pwsh.exe", "sh.exe", "bash.exe", "wscript.exe", "cscript.exe", "certutil.exe", "mshta.exe", "bitsadmin.exe") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.process_name, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
```
