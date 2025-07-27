---
title: Chrome spawned from user profile
layout: page
date: 2025-07-27
---

References: [1](https://www.elastic.co/security-labs/katz-and-mouse-game)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name IN ("chrome.exe", "msedge.exe") Processes.parent_process_path="C:\\Users\\*" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.parent_process_path, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, parent_process_path, process, user, Name, Email
```
