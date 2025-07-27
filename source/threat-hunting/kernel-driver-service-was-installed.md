---
title: Kernel driver service was installed
layout: page
date: 2025-07-27
---

Description: If this is an unknown kernel mode driver it may indicate a malicious or vulnerable driver being leveraged for exploitation, such as to bypass LSA protection. A service type field of ‘0x1’ or ‘0x2’ can indicate kernel driver services.
References: [1](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A182%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C691%2C0%5D)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode=4697 ServiceType IN ("0x1", "0x2")
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), EventDescription=signature, ServiceTypeName=case(ServiceType=="0x1", "SERVICE_KERNEL_DRIVER", ServiceType=="0x2", "SERVICE_FILE_SYSTEM_DRIVER"), ServiceDescription=case(ServiceType=="0x1", "Driver service", ServiceType=="0x2", "File system driver service")
| table Time, index, host, EventCode, EventDescription, SubjectUserName, ServiceFileName, ServiceTypeName, ServiceDescription
```
