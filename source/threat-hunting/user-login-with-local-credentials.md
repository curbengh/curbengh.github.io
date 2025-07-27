---
title: User Login with Local Credentials
layout: page
date: 2025-07-27
---

Description: Interactive logins should use domain credentials. Detect when a new user logs on with local credentials.
References: [1](https://instance.splunkcloud.com/en-GB/app/Splunk_Security_Essentials/showcase_simple_search?ml_toolkit.dataset=Login%20With%20Local%20Credentials%20-%20Live)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Authentication WHERE index="windows" nodename=Authentication.Successful_Authentication Authentication.signature_id=4624 Authentication.authentication_signature_id IN (2, 10, 11) NOT Authentication.src_nt_domain IN ("MY_COMPANY_DOMAIN", "NT AUTHORITY", "NT SERVICE") BY index, host, Authentication.src, Authentication.user, Authentication.src_user, Authentication.src_nt_domain, Authentication.dest, Authentication.signature_id, Authentication.authentication_signature_id, Authentication.authentication_title, Authentication.authentication_signature, _time span=1s
| rename Authentication.* AS *, src_user AS subject_user, src AS source_ip, signature_id AS EventCode, authentication_signature AS LogonResult, authentication_signature_id AS LogonType, authentication_title AS LogonTitle, src_nt_domain AS Domain, dest AS Destination
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, LogonType, LogonTitle, LogonResult, source_ip, Destination, Domain, user, subject_user, Name, Email
```
