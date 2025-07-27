---
title: SIDHistory compromise
layout: page
date: 2025-07-27
---

Description: Malicious actors may add a value to the 'sIDHistory' attribute of a user object they control to establish persistence. "%%1793" occurs when SidHistory value is cleared
References: [1](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A176%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C539%2C0%5D), [2](https://research.splunk.com/endpoint/5fde0b7c-df7a-40b1-9b3a-294c00f0289d/), [3](https://adsecurity.org/?p=1772)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode IN (4742, 4738) NOT SidHistory IN ("%%1793", "-")
| rename signature AS EventDescription, dest_nt_domain AS Domain
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, description AS AccountDescription
| lookup ad_users sAMAccountName AS src_user OUTPUT displayName AS Admin_name
| eval Admin=src_user
| table Time, index, host, Domain, user, EventCode, EventDescription, Name, AccountDescription, Admin, Admin_name, SidHistory
```
