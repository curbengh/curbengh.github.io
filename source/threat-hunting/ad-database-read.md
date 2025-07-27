---
title: AD Database Read
layout: page
date: 2025-07-27
---

Description: ntds.dit is the AD DS database file which stores information about all objects in the domain. This information includes the password hashes for user and computer objects. Due to this, it is frequently targeted by malicious actors when compromising AD DS.
References: [1](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A105%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C202%2C0%5D), [2](https://www.netwrix.com/ntds_dit_security_active_directory.html)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode IN (4656, 4663) ObjectName="C:\\Windows\\NTDS\\Ntds.dit"
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), EventDescription=signature, User=src_user
| lookup ad_users sAMAccountName AS src_user OUTPUT displayName, description AS AccountDescription
| table Time, index, host, EventCode, EventDescription, User, displayName, AccountDescription
```
