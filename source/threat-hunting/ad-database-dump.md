---
title: AD Database Dump
layout: page
date: 2025-07-27
---

References: [1](https://redcanary.com/blog/credential-access/), [2](https://www.ired.team/offensive-security/credential-access-and-credential-dumping/ntds.dit-enumeration)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process="*ntds*" Processes.process IN ("*ifm create*", "*create full*", "*pro*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```
