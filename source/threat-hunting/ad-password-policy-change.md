---
title: AD Password Policy Change
layout: page
date: 2025-07-27
---

References: [1](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=4739)
SPL:

```spl
index="windows" EventCode="4739"
| dedup SubjectUserName
| eval lookup_username=replace(SubjectUserName,"^(\w+)_admin","\1")
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), Domain=SubjectDomainName
| lookup ad_users sAMAccountName AS lookup_username OUTPUT displayName, mail as Email
| table Time, Domain, host, SubjectUserName, displayName, Email, DomainPolicyChanged, MinPasswordAge, MaxPasswordAge, ForceLogoff, LockoutThreshold, LockoutObversationWindow, LockoutDuration, PasswordProperties, MinPasswordLength, PasswordHistoryLength, MachineAccountQuota, MixedDomainMode, DomainBehaviorVersion, OemInformation
```
