---
title: Generate list of AD users using ldapsearch
layout: page
date: 2025-07-27
---

Description: Prepare data for ad_users.csv. Excludes disabled account.
References: [1](http://www.selfadsi.org/ldap-filter.htm#BitAndOr), [2](https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/useraccountcontrol-manipulate-account-properties#list-of-property-flags), [3](https://learn.microsoft.com/en-us/windows/win32/api/lmaccess/ns-lmaccess-user_info_1008), [4](https://learn.microsoft.com/en-us/windows/win32/adschema/a-msds-user-account-control-computed), [5](https://learn.microsoft.com/en-us/windows/win32/adschema/a-lockouttime#remarks)
SPL:

```spl
| ldapsearch domain=default search="(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=512)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))" attrs="accountExpires,adminCount,adminDescription,canonicalName,company,department,description,displayName,distinguishedName,employeeType,givenName,lastLogon,lastLogonTimestamp,lockoutTime,mail,manager,mobile,msDS-User-Account-Control-Computed,msDS-UserPasswordExpiryTimeComputed,objectGUID,objectSid,physicalDeliveryOfficeName,pwdLastSet,sAMAccountName,sn,streetAddress,telephoneNumber,title,userAccountControl,userPrincipalName,whenCreated"
| eval domain="MyCompany"
| eval jobTitle=title.", ".coalesce(description,employeeType), destCsv="ad_users.csv", lastRun=strftime(now(), "%Y-%m-%d %H:%M:%S %z"), whenCreated_localtime=strftime(strptime(whenCreated,"%Y-%m-%d %H:%M:%S%z"), "%Y-%m-%d %H:%M:%S %z")
| eval accountExpires_localtime=strftime(strptime(accountExpires." +0000","%Y-%m-%dT%H:%M:%S.%QZ %z"),"%Y-%m-%d %H:%M:%S %z"), accountExpired=if(strptime(accountExpires." +0000","%Y-%m-%dT%H:%M:%S.%QZ %z")<now(), "True", "False")
| eval lastLogon_localtime=strftime(strptime(lastLogon." +0000","%Y-%m-%dT%H:%M:%S.%QZ %z"),"%Y-%m-%d %H:%M:%S %z"), lastLogonTimestamp_localtime=strftime(strptime(lastLogonTimestamp." +0000","%Y-%m-%dT%H:%M:%S.%QZ %z"),"%Y-%m-%d %H:%M:%S %z")
| eval lockedOut=if(isnotnull(mvfind('msDS-User-Account-Control-Computed', "LOCKOUT")), "True", "False"), lockoutTime_localtime=strftime(strptime(lockoutTime." +0000","%Y-%m-%dT%H:%M:%S.%QZ %z"),"%Y-%m-%d %H:%M:%S %z")
| eval passwordExpired=if(isnotnull(mvfind('msDS-User-Account-Control-Computed', "PASSWORD_EXPIRED")), "True", "False"), pwdLastSet_localtime=strftime(strptime(pwdLastSet." +0000","%Y-%m-%dT%H:%M:%S.%QZ %z"),"%Y-%m-%d %H:%M:%S %z"), passwordExpiryTime=strptime('msDS-UserPasswordExpiryTimeComputed'." +0000","%Y-%m-%dT%H:%M:%S.%QZ %z"), passwordExpiryTime_localtime=strftime(passwordExpiryTime,"%Y-%m-%d %H:%M:%S %z")
| fillnull value="(blank)" mail, department, company, lastLogonTimestamp
| table accountExpired,accountExpires,accountExpires_localtime,adminCount,adminDescription,canonicalName,company,department,description,destCsv,displayName,distinguishedName,domain,givenName,jobTitle,lastLogon,lastLogonTimestamp,lastLogonTimestamp_localtime,lastLogon_localtime,lastRun,lockedOut,lockoutTime,lockoutTime_localtime,mail,manager,mobile,msDS-User-Account-Control-Computed,physicalDeliveryOfficeName,msDS-UserPasswordExpiryTimeComputed,objectGUID,objectSid,office,passwordExpired,passwordExpiryTime,passwordExpiryTime_localtime,pwdLastSet,pwdLastSet_localtime,sAMAccountName,sn,streetAddress,telephoneNumber,title,userAccountControl,userPrincipalName,whenCreated,whenCreated_localtime
| outputlookup override_if_empty=false ad_users.csv
| collect index="ldapsearch"
```
