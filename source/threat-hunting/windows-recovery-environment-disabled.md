---
title: Windows Recovery Environment disabled
layout: page
date: 2025-08-03
---

References: [1](https://www.elastic.co/security-labs/maas-appeal-an-infostealer-rises-from-the-ashes#defeat-system-recovery)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="reagentc.exe" Processes.process="*/disable*" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
```
