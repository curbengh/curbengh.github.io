---
title: AD Password Policy Modified
layout: page
date: 2025-07-27
---

Description: A modified (most probably by Group Policy) password policy was deployed to machines in a domain. Note that the users listed may not be accurate due to limitation of Event ID 5136
References: [1](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=4739), [2](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=5136)
SPL:

```spl
index="windows" EventCode="4739"
| fields - SubjectUserName
```match events EventCode="5136" earlier than events EventCode="4739" ```
| join type=inner max=10 usetime=true earlier=true host [search index="windows" EventCode="5136" | fields host, SubjectUserName]
| dedup SubjectUserName
| eval lookup_username=replace(SubjectUserName,"^(\w+)_admin","\1")
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), Domain=SubjectDomainName
| lookup ad_users sAMAccountName AS lookup_username OUTPUT displayName, mail as Email
| table Time, Domain, host, SubjectUserName, displayName, Email, DomainPolicyChanged, MinPasswordAge, MaxPasswordAge, ForceLogoff, LockoutThreshold, LockoutObversationWindow, LockoutDuration, PasswordProperties, MinPasswordLength, PasswordHistoryLength, MachineAccountQuota, MixedDomainMode, DomainBehaviorVersion, OemInformation
```
