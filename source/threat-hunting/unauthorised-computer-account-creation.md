---
title: Unauthorised Computer Account Creation
layout: page
date: 2025-07-27
---

Description: If the computer object is created by user objects that do not normally create computer objects, this may indicate a MachineAccountQuota compromise has occurred
References: [1](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A71%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C346%2C0%5D)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode=4741
| rename signature AS EventDescription, dest_nt_domain AS Domain, TargetUserName AS Asset
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS src_user OUTPUT displayName AS Admin_name
| eval Admin=src_user
| table Time, index, host, Domain, Asset, EventCode, EventDescription, Admin, Admin_name
```
