---
title: Defender traffic blocked by Windows Firewall
layout: page
date: 2025-07-27
---

References: [1](https://github.com/netero1010/EDRSilencer), [2](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-5157), [3](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=5157)
SPL:

```spl
index="windows" EventCode="5157" Application IN ("*MsMpEng.exe", "*MsSense.exe", "*SenseIR.exe", "*SenseNdr.exe", "*SenseCncProxy.exe", "*SenseSampleUploader.exe")
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), EventDescription=signature
| table Time, host, EventCode, EventDescription, Application, SourceAddress, DestAddress, DestPort, Protocol, transport
```
