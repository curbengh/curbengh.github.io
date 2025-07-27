---
title: DCSync detection
layout: page
date: 2025-07-27
---

Description: The DCSync attack methodology takes advantage of the Directory Replication Service Remote (DRSR) protocol to obtain sensitive information from a domain controller.
References: [1](https://blog.blacklanternsecurity.com/p/detecting-dcsync), [2](https://thedfirreport.com/2024/06/10/icedid-brings-screenconnect-and-csharp-streamer-to-alphv-ransomware-deployment/#credential-access), [3](https://threathunterplaybook.com/library/windows/active_directory_replication.html), [4](https://learn.microsoft.com/en-us/windows/win32/adschema/r-ds-replication-get-changes-all), [5](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A96%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C627%2C0%5D)
SPL:

```spl
index="windows" EventCode=4662 Properties IN ("*{1131f6ad-9c07-11d1-f79f-00c04fc2dcd2}*", "*{19195a5b-6da0-11d0-afd3-00c04fd930c9}*", "*{89e95b76-444d-4c62-991a-0facbeda640c}*") NOT SubjectUserName IN ("*$", "AADSync-Service")
| rename signature AS EventDescription
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), admin_lookup=replace(SubjectUserName,"^(\w+)_admin","\1")
| lookup ad_users sAMAccountName AS admin_lookup OUTPUT displayName AS Name, mail AS Email
| table Time, host, SubjectUserName, EventCode, EventDescription, ObjectName, Properties, Name, Email
```
