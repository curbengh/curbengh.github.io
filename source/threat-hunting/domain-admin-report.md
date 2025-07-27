---
title: Domain Admin Report
layout: page
date: 2025-07-27
---

References: [1](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/security-best-practices/appendix-b--privileged-accounts-and-groups-in-active-directory#built-in-privileged-accounts-and-groups), [2](http://www.selfadsi.org/ldap-filter.htm#BitAndOr), [3](https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/useraccountcontrol-manipulate-account-properties#list-of-property-flags), [4](https://learn.microsoft.com/en-us/windows/win32/adsi/search-filter-syntax#operators)
SPL:

```spl
| ldapsearch domain="default" search="(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=512)(memberOf:1.2.840.113556.1.4.1941:=CN=Administrators,CN=Builtin,DC=my,DC=company))" attrs="sAMAccountName,displayName,userAccountControl,memberOf,lastLogonTimestamp"
| eval Domain="MyCompany"
| eval Username=sAMAccountName, "Account Holder"=displayName, Enabled=if(isnull(mvfind(userAccountControl, "ACCOUNTDISABLE")), "True", "False"), adminGroups=mvfilter(match(memberOf, "Administrators|Admins")), "Last Login"=strftime(strptime(lastLogonTimestamp." +0000","%Y-%m-%dT%H:%M:%S.%QZ %z"),"%Y-%m-%d %H:%M:%S %z")
| rex field=adminGroups "^CN=(?<Group>[^,]+)"
| table Domain, Username, "Account Holder", Enabled, Group, "Last Login"
| sort Domain, Username
```
