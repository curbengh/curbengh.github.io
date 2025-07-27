---
title: Unusual Scheduled Task
layout: page
date: 2025-07-27
---

Description: A new scheduled task is created with minutely interval or with highest run level.
References: [1](https://blog.talosintelligence.com/gophish-powerrat-dcrat/#threat-actor-delivers-dcrat)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="schtasks.exe" Processes.process IN ("*minute*", "*highest*") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```
