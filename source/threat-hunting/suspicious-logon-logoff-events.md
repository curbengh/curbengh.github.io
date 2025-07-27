---
title: Suspicious Logon/Logoff Events
layout: page
date: 2025-07-27
---

Description: A forged Kerberos ticket may use FQDN instead of short domain name.
References: [1](https://adsecurity.org/?p=1515)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Authentication WHERE index="windows" Authentication.signature_id IN (4624, 4634, 4672) Authentication.src_nt_domain IN ("my.company.fqdn") BY index, host, Authentication.src, Authentication.user, Authentication.src_user, Authentication.src_nt_domain, Authentication.dest, Authentication.signature_id, Authentication.authentication_signature_id, Authentication.authentication_title, Authentication.authentication_signature, _time span=1s
| rename Authentication.* AS *, src_user AS subject_user, src AS source_ip, signature_id AS EventCode, authentication_signature AS LogonResult, authentication_signature_id AS LogonType, authentication_title AS LogonTitle, src_nt_domain AS Domain, dest AS Destination
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, LogonType, LogonTitle, LogonResult, source_ip, Destination, Domain, user, subject_user, Name, Email
```
