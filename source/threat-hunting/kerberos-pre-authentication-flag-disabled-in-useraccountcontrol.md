---
title: Kerberos Pre-Authentication Flag Disabled in UserAccountControl
layout: page
date: 2025-07-27
---

Description: Disabling this flag allows adversaries to perform offline brute force attacks on the user's password using the AS-REP Roasting technique.
References: [1](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A64%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C565%2C0%5D), [2](https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/useraccountcontrol-manipulate-account-properties#list-of-property-flags), [3](https://learn.microsoft.com/en-gb/windows/win32/adschema/a-useraccountcontrol#remarks)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" ((EventCode=4738 AND UserAccountControl!="-") OR (EventCode=5136 AND AttributeLDAPDisplayName="userAccountControl"))
| eval uac=coalesce(tonumber(ltrim(UserAccountControl, "%"), 16), AttributeValue), DONT_REQ_PREAUTH=floor(uac/4194304)%2, user=coalesce(user, replace(ObjectDN, "^CN=([^,]+),.+", "\1"))
| where DONT_REQ_PREAUTH="1"
| rename signature AS EventDescription, dest_nt_domain AS Domain
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, description AS AccountDescription
| lookup ad_users sAMAccountName AS src_user OUTPUT displayName AS Admin_name
| eval Admin=src_user
| table Time, index, host, Domain, user, EventCode, EventDescription, Name, AccountDescription, Admin, Admin_name, UserAccountControl, uac
```
