---
title: Suspicious Network Settings
layout: page
date: 2025-07-27
---

Description: Midas ransomware is characterized in that it leaves traces in the event logs regarding changes to network settings, which are considered to be aimed to spread the infection, at the time of execution..
References: [1](https://blogs.jpcert.or.jp/en/2024/09/windows.html)
SPL:

```spl
index="windows" EventCode=7040 ServiceName IN ("Function Discovery Resource Publication", "SSDP Discovery", "Secure Socket Tunneling Protocol Service", "UPnP Device Host")
| eval Time=strftime(_time,"%Y-%m-%d %H:%M:%S %z")
| stats earliest(Time) AS first_occur, values(ServiceName) AS Services BY index, host, source, EventCode
| where mvcount(Services)=4
| table first_occur, index, host, source, EventCode, Services
| sort -first_occur
```
