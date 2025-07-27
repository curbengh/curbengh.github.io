---
title: Windows Sandbox execution
layout: page
date: 2025-07-27
---

References: [1](https://www.welivesecurity.com/en/eset-research/operation-akairyu-mirrorface-invites-europe-expo-2025-revives-anel-backdoor/), [2](https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-cli)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="wsb.exe" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
```
