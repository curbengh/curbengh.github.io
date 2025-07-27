---
title: Credential Manager/SAM Dump
layout: page
date: 2025-07-27
---

References: [1](https://redcanary.com/blog/credential-access/), [2](https://gist.github.com/JohnLaTwC/3e7dd4cd8520467df179e93fb44a434e), [DonPAPI](https://blog.talosintelligence.com/when-legitimate-tools-go-rogue/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 (Processes.process_name="rundll32.exe" Processes.process IN ("*keymdr.dll*", "*krshowkeymgr*")) OR (Processes.process_name="credwiz.exe" Processes.process="*.crd*") OR (Processes.process_name="vaultcmd.exe" Processes.process="*/list*") OR Processes.process IN ("*donpapi*", "*dpp*") OR (Processes.process_name="reg.exe" Processes.process IN ("c:\\windows\\system32\\reg.exe*save*", "c:\\windows\\system32\\reg.exe*export*") Processes.process IN ("c:\\windows\\system32\\reg.exe*sam*", "c:\\windows\\system32\\reg.exe*security*", "c:\\windows\\system32\\reg.exe*system*")) BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```
