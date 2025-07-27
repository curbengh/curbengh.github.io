---
title: VSCode tunnel
layout: page
date: 2025-07-27
---

Description: Detect creation of Visual Studio Code Remote Tunnel
References: [1](https://unit42.paloaltonetworks.com/stately-taurus-abuses-vscode-southeast-asian-espionage/), [2](https://code.visualstudio.com/docs/remote/tunnels)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="code.exe" Processes.process="*tunnel*" BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```
