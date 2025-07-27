---
title: Kerberos TGT request with weak encryption
layout: page
date: 2025-07-27
---

Description: TGT request with DES/RC4 weak encryption, commonly abused for Kerberoasting.
References: [1](https://thedfirreport.com/2024/08/26/blacksuit-ransomware/#credential-access), [2](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4768#table-4-kerberos-encryption-types)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode=4768 TicketEncryptionType IN ("0x1", "0x3", "0x17", "0x18")
| rename signature_id AS EventCode, signature AS EventDescription, dest_nt_domain AS Domain, dest AS Destination
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), source_ip=replace(src, "^::ffff:", "")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, description AS AccountDescription
| lookup ldap_assets ip AS source_ip OUTPUT nt_host
| lookup dhcp_lookup ip AS source_ip OUTPUT nt_host AS nt_host2
| eval source_host=coalesce(nt_host, nt_host2)
| table Time, index, host, Domain, user, EventCode, EventDescription, TicketEncryptionType, source_ip, source_host, Destination, Name, AccountDescription
```
