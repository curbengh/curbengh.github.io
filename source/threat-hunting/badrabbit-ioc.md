---
title: BadRabbit IoC
layout: page
date: 2025-07-27
---

References: [1](https://blogs.jpcert.or.jp/en/2024/09/windows.html)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Services WHERE index="windows" Services.signature_id="7045" Services.service_name="Windows Client Side Caching DDriver" BY index, host, Services.signature_id, Services.signature, Services.process, Services.service_name, _time span=1s
| rename Services.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, host, EventCode, EventDescription, service_name, process, index
```
