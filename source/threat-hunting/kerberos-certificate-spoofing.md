---
title: Kerberos Certificate Spoofing
layout: page
date: 2025-07-27
---

Description: Before the May 10, 2022 security update, certificate-based authentication would not account for a dollar sign ($) at the end of a machine name. This allowed related certificates to be emulated (spoofed) in various ways.
References: [1](https://support.microsoft.com/en-au/topic/kb5014754-certificate-based-authentication-changes-on-windows-domain-controllers-ad2c23b0-15d8-4340-a468-4d4f3b188f16), [2](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A79%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C227%2C0%5D), [3](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A90%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C691%2C0%5D)
SPL:

```spl
index="windows" source="XmlWinEventLog:System" EventCode IN (39,41,40,48,41,49)
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, index, host, UserData_Xml
```
