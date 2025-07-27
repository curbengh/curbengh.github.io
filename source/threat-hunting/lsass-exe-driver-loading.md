---
title: LSASS.exe driver loading
layout: page
date: 2025-07-27
---

Description: This event is generated when a driver fails to load because it does not meet Microsoft's signing requirements. This indicates that a code integrity check determined that a process, usually LSASS.exe, attempted to load a driver that did not meet the Microsoft signing level requirements..
References: [1](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A182%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C691%2C0%5D)
SPL:

```spl
index="windows" source="XmlWinEventLog:Microsoft-Windows-CodeIntegrity/Operational" EventCode IN (3033,3063) ProcessNameBuffer="*lsass.exe"
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, index, host, user, EventCode, Name, RequestedPolicy, ProcessNameBuffer, FileNameBuffer
```
