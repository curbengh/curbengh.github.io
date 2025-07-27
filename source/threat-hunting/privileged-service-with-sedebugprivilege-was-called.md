---
title: Privileged Service with SeDebugPrivilege was called
layout: page
date: 2025-07-27
---

Description: This event is generated when a privileged service is called. This event triggers when the 'SeDebugPrivilege' privilege is enabled, which is required to successfully execute a Skeleton Key.
References: [1](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A182%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C691%2C0%5D)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode=4673 PrivilegeList="SeDebugPrivilege"
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), EventDescription=signature, User=src_user
| lookup ad_users sAMAccountName AS src_user OUTPUT displayName, description AS AccountDescription
| table Time, index, host, EventCode, EventDescription, ProcessName, User, displayName, AccountDescription
```
