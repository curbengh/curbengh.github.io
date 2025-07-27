---
title: New Interactive Logon from a Service Account
layout: page
date: 2025-07-27
---

Description: In most environments, service accounts should not log on interactively. This search finds new user/host combinations for accounts starting with "Service-"
References: [1](https://instance.splunkcloud.com/en-GB/app/Splunk_Security_Essentials/showcase_first_seen_demo?ml_toolkit.dataset=New%20Interactive%20Logon%20from%20a%20Service%20Account%20-%20Live)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Authentication WHERE index="windows" nodename=Authentication.Successful_Authentication Authentication.signature_id=4624 Authentication.authentication_signature_id IN (2, 10) Authentication.user="Service-*" BY index, host, Authentication.src, Authentication.user, Authentication.src_user, Authentication.src_nt_domain, Authentication.dest, Authentication.signature_id, Authentication.authentication_signature_id, Authentication.authentication_title, Authentication.authentication_signature, _time span=1s
| rename Authentication.* AS *, src_user AS subject_user, src AS source_ip, signature_id AS EventCode, authentication_signature AS LogonResult, authentication_signature_id AS LogonType, authentication_title AS LogonTitle, src_nt_domain AS Domain, dest AS Destination
```system logon```
| where subject_user=host."$"
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, description AS AccountDescription
| table Time, index, host, Domain, user, EventCode, LogonType, LogonTitle, LogonResult, source_ip, Destination, subject_user, Name, AccountDescription
```
