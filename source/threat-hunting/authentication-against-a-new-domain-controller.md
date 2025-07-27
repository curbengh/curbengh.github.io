---
title: Authentication Against a New Domain Controller
layout: page
date: 2025-07-27
---

Description: A common indicator for lateral movement is when a user starts logging into new domain controllers.
References: [1](https://instance.splunkcloud.com/en-GB/app/Splunk_Security_Essentials/showcase_first_seen_demo?ml_toolkit.dataset=First%20Connection%20to%20Domain%20Controller%20-%20Live)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Authentication WHERE index="windows" Authentication.signature_id=4776 NOT Authentication.dest IN ("ad.domain.fqdn") BY index, host, Authentication.src, Authentication.dest, Authentication.user, Authentication.signature_id, Authentication.signature, Authentication.authentication_signature, _time span=1s
| rename Authentication.* AS *, src AS SourceName, dest AS DomainControllerName, signature_id AS EventCode, signature AS EventDescription, authentication_signature AS LogonDescription
```exclude local logons```
| where DomainControllerName!=host.".ad.domain.fqdn"
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, LogonDescription, SourceName, DomainControllerName, user, Name, Email
```
