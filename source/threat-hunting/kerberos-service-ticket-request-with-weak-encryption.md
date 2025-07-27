---
title: Kerberos service ticket request with weak encryption
layout: page
date: 2025-07-27
---

Description: Service ticket request with DES/RC4 weak encryption, commonly abused for Kerberoasting.
References: [1](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A61%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C657%2C0%5D)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode=4769 (TicketEncryptionType IN ("0x1", "0x3", "0x17", "0x18") OR TicketOptions IN ("0x40800000", "0x40810000"))
| rename signature_id AS EventCode, signature AS EventDescription, dest_nt_domain AS Domain, dest AS Destination
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), source_ip=replace(src, "^::ffff:", "")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, description AS AccountDescription
| lookup ldap_assets ip AS source_ip OUTPUT nt_host
| lookup dhcp_lookup ip AS source_ip OUTPUT nt_host AS nt_host2
| eval source_host=coalesce(nt_host, nt_host2)
| table Time, index, host, Domain, user, EventCode, EventDescription, TicketEncryptionType, source_ip, source_host, Destination, Name, AccountDescription
```
