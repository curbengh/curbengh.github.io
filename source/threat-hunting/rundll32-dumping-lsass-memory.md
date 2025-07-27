---
title: Rundll32 Dumping LSASS Memory
layout: page
date: 2025-07-27
---

Description:  Often used by attackers to access credentials stored on a system.
References: [1](https://redcanary.com/blog/credential-access/), [2](https://gist.github.com/JohnLaTwC/3e7dd4cd8520467df179e93fb44a434e), [3](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A70%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C318%2C0%5D)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process IN ("*rundll32*", "*procdump*", "*sekurlsa") Processes.process IN ("*minidump*", "*comsvcs*", "*lsass*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```
