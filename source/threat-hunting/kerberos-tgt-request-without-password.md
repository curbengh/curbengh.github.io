---
title: Kerberos TGT request without password
layout: page
date: 2025-07-27
---

Description: Kerberos TGT request with "Pre-Authentication Type" set to 0, meaning no password is required. It might a sign of AS-REP roasting.
References: [1](https://thedfirreport.com/2024/08/26/blacksuit-ransomware/#credential-access), [2](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4768#table-5-kerberos-pre-authentication-types)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode=4768 PreAuthType=0
| rename signature AS EventDescription, dest_nt_domain AS Domain, dest AS Destination
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), source_ip=replace(src, "^::ffff:", "")
| lookup ldap_assets ip AS source_ip OUTPUT nt_host
| lookup dhcp_lookup ip AS source_ip OUTPUT nt_host AS nt_host2
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, description AS AccountDescription
| eval source_host=coalesce(nt_host, nt_host2)
| table Time, index, host, Domain, user, EventCode, EventDescription, PreAuthType, source_ip, source_host, Destination, Name, AccountDescription
```
