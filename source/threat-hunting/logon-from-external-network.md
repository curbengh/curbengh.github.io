---
title: Logon from External Network
layout: page
date: 2025-07-27
---

References: [1](https://thedfirreport.com/2024/01/29/buzzing-on-christmas-eve-trigona-ransomware-in-3-hours/#initial-access)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Authentication WHERE index="windows" nodename=Authentication.Successful_Authentication Authentication.signature_id=4624 NOT Authentication.src IN (-,unknown,10.*,192.168.*,fd*,fe80:*,127.*,::1,2002:*,MYCOMPANY*) BY index, host, Authentication.src, Authentication.user, Authentication.signature_id, Authentication.signature, Authentication.authentication_signature_id, Authentication.authentication_title, _time span=1s
| rename Authentication.* AS *, src AS source_ip, signature_id AS EventCode, signature AS EventDescription, authentication_signature_id AS LogonType, authentication_title AS LogonTitle
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, source_ip, LogonType, LogonTitle, user, Name, Email
```
