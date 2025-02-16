---
title: Splunk Threat Hunting
layout: page
date: 2025-01-15
updated: 2025-02-08
---

Some searches utilise [cmdb_ci_list_lookup](https://gitlab.com/curben/splunk-scripts/-/tree/main/Splunk_TA_snow) lookup.

## Generate ad_users.csv

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

## Generate ldap_assets.csv

Description: Prepare data for ldap_assets.csv. Excludes disabled account.
References: [1](http://www.selfadsi.org/ldap-filter.htm#BitAndOr), [2](https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/useraccountcontrol-manipulate-account-properties#list-of-property-flags)
SPL:

```spl
| ldapsearch domain="default" search="(&(objectClass=computer)(|(userAccountControl:1.2.840.113556.1.4.803:=4096)(userAccountControl:1.2.840.113556.1.4.803:=8192))(!(userAccountControl:1.2.840.113556.1.4.803:=2)))" attrs="sAMAccountName,distinguishedName,dNSHostName,description,operatingSystem,operatingSystemVersion,whenCreated, memberOf,userAccountControl,lastLogon,lastLogonTimestamp,department,objectSid,objectGUID"
| eval domain="MyCompany"
| rex max_match=5 field=distinguishedName "OU=(?<dn_parsed>[^,]+)"
| eval category=lower(replace(mvjoin(dn_parsed, "|"), " ", "_"))
| eval priority=case(match(category, "domain_controller|exchange|citrix"), "critical",match(category, "server"), "high",match(category,"workstation|desktop|mobile|laptop"), "medium",match(category, "staging|test"), "low", 1==1, "unknown")
| eval nt_host=replace(sAMAccountName, "\$", "")
| eval lastLogon_localtime=strftime(strptime(lastLogon." +0000","%Y-%m-%dT%H:%M:%S.%QZ %z"),"%Y-%m-%d %H:%M:%S %z"), lastLogonTimestamp_localtime=strftime(strptime(lastLogonTimestamp." +0000","%Y-%m-%dT%H:%M:%S.%QZ %z"),"%Y-%m-%d %H:%M:%S %z"), whenCreated_localtime=strftime(strptime(whenCreated,"%Y-%m-%d %H:%M:%S%z"), "%Y-%m-%d %H:%M:%S %z")
| rename dNSHostName AS dns, operatingSystem AS OS, operatingSystemVersion AS OSver, department AS bizUnit
| eval val2lookup=coalesce(dns, nt_host), destCsv="ldap_assets.csv", lastRun=strftime(now(), "%Y-%m-%d %H:%M:%S %z")
| lookup dnslookup clienthost AS val2lookup OUTPUT clientip AS ip
| fillnull value="unknown" category, priority, bizUnit
| table OS,OSver,bizUnit,category,description,destCsv,dns,domain,ip,lastLogon,lastLogonTimestamp,lastLogonTimestamp_localtime,lastLogon_localtime,lastRun,nt_host,objectGUID,objectSid,priority,userAccountControl,whenCreated,whenCreated_localtime
| outputlookup override_if_empty=false ldap_assets.csv
| collect index="ldapsearch"
```

## Monthly Domain Admins Report

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

## Protected Group Monitoring

Description: Monitor new account with adminCount=1.
References: [1](https://learn.microsoft.com/en-us/windows/win32/adschema/a-admincount), [2](https://blog.netwrix.com/2022/09/30/admincount_attribute/), [3](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/security-best-practices/appendix-c--protected-accounts-and-groups-in-active-directory)
SPL:

```spl
| ldapsearch domain=default search="(&(objectClass=user)(adminCount=1)(userAccountControl:1.2.840.113556.1.4.803:=512)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))" attrs="adminCount,company,department,description,displayName,distinguishedName,mail,employeeType,sAMAccountName,title"
| eval domain="MyCompany"
| eval destCsv="hourly_adminCount.csv", jobTitle=title.", ".coalesce(description,employeeType)
| fillnull value="(blank)" mail, department, company
| table adminCount,company,department,description,destCsv,displayName,distinguishedName,domain,jobTitle,mail,employeeType,sAMAccountName,title
| outputlookup override_if_empty=false hourly_adminCount.csv
| collect index="ldapsearch"
```

## 3LOSH IoC

References: [1](https://redcanary.com/blog/threat-intelligence/intelligence-insights/intelligence-insights-february-2024/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.parent_process_name="wscript.exe" Processes.process_name="powershell.exe" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## AD Account Deletion

References: [1](https://instance.splunkcloud.com/en-GB/app/Splunk_Security_Essentials/showcase_simple_search?ml_toolkit.dataset=Multiple%20Account%20Deletion%20by%20an%20Administrator%20-%20Live)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true dc(All_Changes.user) FROM datamodel=Change.All_Changes WHERE index="windows" nodename=All_Changes.Account_Management.Accounts_Deleted All_Changes.result_id IN (4726, 630) All_Changes.user!="*$" BY All_Changes.user, All_Changes.Account_Management.src_user, All_Changes.Account_Management.src_nt_domain, _time span=1s
| rename All_Changes.Account_Management.* AS *, All_Changes.* AS *, src_user AS Admin, src_nt_domain AS Domain
| dedup Domain, Admin, user
| eval admin_lookup=replace(Admin,"^(\w+)_admin","\1"), user_time="[".strftime(_time, "%H:%M")."] ".user
| table Domain, Admin, user_time, admin_lookup
| mvcombine user_time
| eval Users=mvjoin(mvsort(user_time), ", ")
| lookup ad_users sAMAccountName AS admin_lookup OUTPUT displayName AS Name
| sort Domain, Admin
| eval "Deleted by"=Admin
| table Domain, "Deleted by", Name, Users
```

## AD Database Dump

References: [1](https://redcanary.com/blog/credential-access/), [2](https://www.ired.team/offensive-security/credential-access-and-credential-dumping/ntds.dit-enumeration)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process="*ntds*" Processes.process IN ("*ifm create*", "*create full*", "*pro*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## AD Database Read

Description: ntds.dit is the AD DS database file which stores information about all objects in the domain. This information includes the password hashes for user and computer objects. Due to this, it is frequently targeted by malicious actors when compromising AD DS.
References: [1](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A105%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C202%2C0%5D), [2](https://www.netwrix.com/ntds_dit_security_active_directory.html)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode IN (4656, 4663) ObjectName="C:\\Windows\\NTDS\\Ntds.dit"
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), EventDescription=signature, User=src_user
| lookup ad_users sAMAccountName AS src_user OUTPUT displayName, description AS AccountDescription
| table Time, index, host, EventCode, EventDescription, User, displayName, AccountDescription
```

## AD Password Policy Change

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

## AD Password Policy Modified

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

## AWS AssumeRoot API operation

Description: Grant root-level privileges in a member account to a privileged user in the management account.
References: [1](https://www.elastic.co/security-labs/exploring-aws-sts-assumeroot)
SPL:

```spl
index="aws" sourcetype="aws:cloudtrail" eventSource="sts.amazonaws.com" eventName="AssumeRoot"
| eval Time=strftime(_time,"%Y-%m-%d %H:%M:%S %z")
| table Time, region, requestParameters.roleArn, sourceIPAddress, userAgent, userIdentity.invokedBy, userIdentity.type
```

## Account Lockout in Administrator Groups

Description: Monitor Administrator, *_admin accounts for lockout.
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="null" count FROM datamodel=Change.All_Changes WHERE index="windows" nodename=All_Changes.Account_Management.Account_Lockouts All_Changes.result_id=4740 All_Changes.user IN ("Administrator", "*_admin") BY All_Changes.Account_Management.src_nt_domain, All_Changes.Account_Management.src_nt_host, All_Changes.Account_Management.dest_nt_domain, All_Changes.user, All_Changes.result_id, All_Changes.result, _time span=1s
| rename All_Changes.Account_Management.* AS *, All_Changes.* AS *, src_nt_domain AS Domain, user AS Username, result_id AS EventCode, result AS EventName
```src_nt_host is alias of Caller_Computer_Name in WinEventLog,
in XmlWinEventLog, TargetDomainName (alias to dest_nt_domain) is used instead Caller_Computer_Name```
| eval Asset=if(src_nt_host!="null", src_nt_host, dest_nt_domain)
| stats count, earliest(_time) AS first_lockout BY Domain, Asset, Username, EventCode, EventName
| eval "First Lockout"=strftime(first_lockout, "%Y-%m-%d %H:%M:%S %z"), user_lookup=replace(Username,"^(\w+)_admin","\1")
| lookup ad_users sAMAccountName AS user_lookup OUTPUT displayName AS Name, mail AS Email, pwdLastSet_localtime AS "Password Last Changed"
| table "First Lockout", Domain, Asset, EventCode, EventName, Username, Name, Email, BizUnit, Company, "Password Last Changed"
```

## AppLocker Audit

Description: Check if AppLocker is in audit mode. See [TA-applocker](https://gitlab.com/curben/splunk-scripts/-/tree/main/TA-Applocker) for more details.
SPL:

```spl
index="windows" source="XmlWinEventLog:Microsoft-Windows-AppLocker/*"
| dedup Channel, Computer, EventCode
| eval Time=strftime(_time,"%Y-%m-%d %H:%M:%S %z"), Username=user
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, Channel, Computer, EventCode, EventDescription, FilePath, UserID, Username, Name, Company, Department, Email
```

## Anonymous Authentication Attempt from Foreign IP

Description: This alert alerts on authentication using nonexistent account from outside of country_name.
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Authentication.Authentication WHERE index="vpn" NOT Authentication.src IN (-,unknown,10.*,192.168.*,fd*,fe80:*,127.*,::1,2002:*) BY index, Authentication.user, Authentication.src, Authentication.vserver, Authentication.dest, Authentication.app, _time span=1s
| rename "Authentication.*" as "*"
| iplocation src
| where Country!="country_name"
| stats count AS Count, earliest(_time) AS first_attempt, values(dest) AS dests BY index, user, src, vserver, app, City, Country
| sort -first_attempt
| rex field=user "(?<asset_lookup>^\w+)"
| lookup ad_users sAMAccountName AS user OUTPUT displayName
```VPN login uses email instead of sAMAccountName```
| lookup ad_users mail AS user OUTPUT sAMAccountName, displayName AS displayName2
```machine tunnel uses hostname instead sAMAccountName/email```
| lookup cmdb_ci_list_lookup name AS asset_lookup OUTPUT dv_assigned_to AS displayName3
| eval Name=coalesce(displayName, displayName2, displayName3), vpn_ip=replace(vserver, ":\d{1,5}$", "")
| lookup netscaler-servers ip AS vpn_ip OUTPUT server AS "VPN Server"
| lookup ad_users displayName AS Name OUTPUT sAMAccountName AS sAMAccountName2
| eval "First Attempt"=strftime(first_attempt,"%Y-%m-%d %H:%M:%S %z"), Username=user, "Source IP"=src, "Source Index"=index, "VPN Server IP"=vpn_ip, "Destination IP"=dests, Username=user, "AD Username"=coalesce(sAMAccountName, sAMAccountName2)
```Name field can be an empty string (not null) when it matches a software in cmdb_ci_list_lookup, e.g. "git"```
| where isnull('AD Username')
| table "First Attempt", "Source Index", "VPN Server IP", "VPN Server", "Destination IP", app, Username, "Source IP", City, Country, Count
```

## Authentication Against a New Domain Controller

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

## Authentication from Foreign IP

Description: Authentication attempt using existing AD account/asset from outside of country_name was detected. The geolocation database used by Splunk Cloud may be outdated, please verify on [Maxmind](https://www.maxmind.com/en/geoip-demo) and [IPLocation](https://www.iplocation.net/ip-lookup)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Authentication.Authentication WHERE index IN ("vpn") NOT Authentication.src IN (-,unknown,10.*,192.168.*,fd*,fe80:*,127.*,::1,2002:*,MY_COMPANY) BY index, Authentication.user, Authentication.src, Authentication.vserver, Authentication.dest, Authentication.app, _time span=1s
| rename "Authentication.*" as "*"
| iplocation src
| where Country!="country_name"
| stats count AS Count, earliest(_time) AS first_attempt BY index, user, src, vserver, dest, app, City, Country
| sort -first_attempt
| rex field=user "(?<asset_lookup>^\w+)"
| lookup ad_users sAMAccountName AS user OUTPUT displayName, company, department, mail, jobTitle, managerMail
```VPN login uses email instead of sAMAccountName```
| lookup ad_users mail AS user OUTPUT sAMAccountName, displayName AS displayName2, company AS company2, department AS department2, mail AS mail2, jobTitle AS jobTitle2, managerMail AS managerMail2
```machine tunnel uses hostname instead sAMAccountName/email```
| lookup cmdb_ci_list_lookup name AS asset_lookup OUTPUT dv_assigned_to AS displayName3
| eval Name=coalesce(displayName, displayName2, displayName3), vpn_ip=replace(vserver, ":\d{1,5}$", "")
| lookup ad_users displayName AS Name OUTPUT sAMAccountName AS sAMAccountName2, company AS company3, department AS department3, mail AS mail3, jobTitle AS jobTitle3, managerMail AS managerMail3
| lookup netscaler-servers ip AS vpn_ip OUTPUT server AS "VPN Server"
| eval "First Attempt"=strftime(first_attempt,"%Y-%m-%d %H:%M:%S %z"), "VPN Server IP"=vpn_ip, "Destination IP"=dest, Username=user, "Source IP"=src, "Source Index"=index
| eval Company=coalesce(company, company2, company3), Department=coalesce(department, department2, department3), Email=coalesce(mail, mail2, mail3)=coalesce(jobTitle, jobTitle2, jobTitle3), "AD Username"=coalesce(sAMAccountName, sAMAccountName2), Manager=coalesce(managerMail, managerMail2, managerMail3)
| lookup cmdb_ci_list_lookup dv_assigned_to AS Name OUTPUT name AS "Assigned Asset"
| where isnotnull('AD Username')
| dedup "AD Username", Country SORTBY -first_attempt
| table "First Attempt", Username, Name, "Source Index", "VPN Server IP", "VPN Server", "Destination IP", app, "Source IP", City, Country, "AD Username", "Assigned Asset", Email, Department, Company, Manager, Count
```

## VPN Web Traffic from Foreign IP

Description: Web traffic via authentication VPN using existing AD account/asset from outside of country_name was detected. The geolocation database used by Splunk Cloud may be outdated, please verify on [Maxmind](https://www.maxmind.com/en/geoip-demo) and [IPLocation](https://www.iplocation.net/ip-lookup)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="(null)" count FROM datamodel=Web WHERE index=vpn BY Web.src, Web.dest, Web.category, Web.site, Web.uri_path, Web.user, _time span=1s
| rename "Web.*" AS "*"
| iplocation src
| where Country!="country_name"
| rex field=user "(?<asset_lookup>^\w+)"
| dedup src, user
| lookup ad_users sAMAccountName AS user OUTPUT displayName, company, department, mail, jobTitle, domain, managerMail
```VPN login uses email instead of sAMAccountName```
| lookup ad_users mail AS user OUTPUT sAMAccountName AS sAMAccountName2, displayName AS displayName2, company AS company2, department AS department2, mail AS mail2, jobTitle AS jobTitle2, domain AS domain2, managerMail AS managerMail2
```machine tunnel uses hostname instead sAMAccountName/email```
| lookup cmdb_ci_list_lookup name AS asset_lookup OUTPUT dv_assigned_to AS displayName3
| lookup ad_users displayName AS displayName3 OUTPUT sAMAccountName AS sAMAccountName3, company AS company3, department AS department3, mail AS mail3, jobTitle AS jobTitle3, domain AS domain3, managerMail AS managerMail3
| eval Time=strftime(_time,"%Y-%m-%d %H:%M:%S %z"), Username=user, "Source IP"=src, vpn_ip=replace(dest, ":\d{1,5}$", ""), "VPN Server IP"=vpn_ip, "VPN Type"=category, "Destination Host"=site, "URL Path"=uri_path
| lookup netscaler-servers ip AS vpn_ip OUTPUT server AS "VPN Server"
| eval Name=coalesce(displayName, displayName2, displayName3), Company=coalesce(company, company2, company3), Department=coalesce(department, department2, department3), Email=coalesce(mail, mail2, mail3)=coalesce(jobTitle, jobTitle2, jobTitle3), "AD Username"=coalesce(sAMAccountName2, sAMAccountName3, user), Domain=coalesce(domain, domain2, domain3), Manager=coalesce(managerMail, managerMail2, managerMail3)
| lookup cmdb_ci_list_lookup dv_assigned_to AS Name OUTPUT name AS "Assigned Asset"
| table Time, Username, Name, "Source IP", "VPN Server IP", "VPN Server", "VPN Type", "Destination Host", "URL Path", City, Country, "AD Username", Domain, "Assigned Asset", Email, Department, Company, Manager
```

## BadRabbit IoC

References: [1](https://blogs.jpcert.or.jp/en/2024/09/windows.html)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Services WHERE index="windows" Services.signature_id="7045" Services.service_name="Windows Client Side Caching DDriver" BY index, host, Services.signature_id, Services.signature, Services.process, Services.service_name, _time span=1s
| rename Services.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, host, EventCode, EventDescription, service_name, process, index
```

## Basic Brute Force Detection

References: [1](https://instance.splunkcloud.com/en-GB/app/Splunk_Security_Essentials/showcase_simple_search?ml_toolkit.dataset=Basic%20Brute%20Force%20-%20Accelerated)
SPL:

```spl
| tstats summariesonly=t allow_old_summaries=t prestats=t count(Authentication.src) FROM datamodel=Authentication WHERE Authentication.action IN ("block*", "fail*") GROUPBY _time span=1d, Authentication.src
| tstats append=t summariesonly=t allow_old_summaries=t prestats=t count FROM datamodel=Authentication WHERE Authentication.action=success GROUPBY _time span=1d, Authentication.src
| stats count, count(Authentication.src) BY Authentication.src
| rename count AS successes, count(Authentication.src) AS failures, Authentication.* as *
| where successes>0 AND failures>100
```

## Basic Scanning

References: [1](https://instance.splunkcloud.com/en-GB/app/Splunk_Security_Essentials/showcase_simple_search?ml_toolkit.dataset=Basic%20Scanning%20-%20Accelerated)
SPL:

```spl
| tstats summariesonly=t allow_old_summaries=t dc(All_Traffic.dest_port) AS num_dest_port dc(All_Traffic.dest_ip) AS num_dest_ip FROM datamodel=Network_Traffic WHERE earliest=-1h BY All_Traffic.src_ip
| where num_dest_port > 1000 OR num_dest_ip > 1000
```

## bitsadmin.exe execution

References: [1](https://redcanary.com/blog/threat-intelligence/intelligence-insights-june-2024/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="bitsadmin.exe" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## Non-Chrome process accessing Chrome registry

Description: HKEY_LOCAL_MACHINE\SOFTWARE\Classes\AppID
708860E0-F641-4611-8895-7D867DD3675B = "ChromeElevationService"
1FCBE96C-1697-43AF-9140-2897C7C69767 = "MicrosoftEdgeElevationService"

References:[1](https://www.elastic.co/security-labs/katz-and-mouse-game)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode IN (4656, 4663) ObjectName IN ("\\REGISTRY\\MACHINE\\SOFTWARE\\Classes\\CLSID\\{708860E0-F641-4611-8895-7D867DD3675B}", "\\REGISTRY\\MACHINE\\SOFTWARE\\Classes\\CLSID\\{1FCBE96C-1697-43AF-9140-2897C7C69767}")
  NOT ProcessName IN ("C:\\Program Files\\Google\\Chrome\\Application\\*", "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\*")
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), EventDescription=signature, User=src_user
| lookup ad_users sAMAccountName AS src_user OUTPUT displayName, description AS AccountDescription
| table Time, index, host, EventCode, EventDescription, ObjectName, ProcessName, User, displayName, AccountDescription
```

## Chrome spawned from user profile

References: [1](https://www.elastic.co/security-labs/katz-and-mouse-game)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name IN ("chrome.exe", "msedge.exe") Processes.parent_process_path="C:\\Users\\*" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.parent_process_path, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, parent_process_path, process, user, Name, Email
```

## dllFake IoC

References: [1](https://redcanary.com/blog/threat-intelligence/intelligence-insights-july-2024/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="curl.exe" Processes.process="*sftp*" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## Internal Proxies Creation

References: [1](https://github.com/Azure/Azure-Sentinel/blob/master/Solutions/Windows%20Security%20Events/Hunting%20Queries/InternalProxies.yaml)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process="*netsh*" Processes.process IN ("*portproxy*", "*v4tov4*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## CDB.exe execution

References: [1](https://www.elastic.co/security-labs/fragile-web-ref7707), [2](https://lolbas-project.github.io/lolbas/OtherMSBinaries/Cdb/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="cdb.exe" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## CVE-2023-23397 Outlook SMB

References: [1](https://www.microsoft.com/en-us/security/blog/2023/03/24/guidance-for-investigating-attacks-using-cve-2023-23397/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process IN ("c:\\windows\\system32\\svchost.exe -k localservice -p -s webclient*", "c:\\windows\\system32\\rundll32.exe c:\\windows\\system32\\davclnt.dll*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## Cloudflared tunnel detection

References: [1](https://thedfirreport.com/2024/12/02/the-curious-case-of-an-egg-cellent-resume/#command-and-control), [2](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/deploy-tunnels/tunnel-with-firewall/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Web WHERE index="proxy" Web.url_domain IN ("region*.argotunnel.com", "cftunnel.com", "update.argotunnel.com")
BY Web.user, Web.src, Web.dest, Web.url_domain, Web.url, Web.category, Web.action, _time span=1s
| rename Web.* AS *
```

## Cobalt Strike IOC

References: [1](https://thedfirreport.com/2024/04/01/from-onenote-to-ransomnote-an-ice-cold-intrusion/#defense-evasion)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.parent_process_name="svchost.exe" Processes.process_name="cmd.exe" Processes.process!="C:\\Windows\\System32\\cmd.exe" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## cmd.exe auto-start

References: [1](https://thedfirreport.com/2024/08/26/blacksuit-ransomware/#execution), [2](https://thedfirreport.com/2025/01/27/cobalt-strike-and-a-pair-of-socks-lead-to-lockbit-ransomware/#lateral-movement)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Services WHERE index="windows" Services.signature_id="7045" Services.process IN ("*comspec*", "*cmd*") BY index, host, Services.signature_id, Services.signature, Services.process, Services.service_name, _time span=1s
| rename Services.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, host, EventCode, EventDescription, service_name, process, index
```

## Credential Manager Dump

References: [1](https://redcanary.com/blog/credential-access/), [2](https://gist.github.com/JohnLaTwC/3e7dd4cd8520467df179e93fb44a434e)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 (Processes.process_name="rundll32.exe" Processes.process IN ("*keymdr.dll*", "*krshowkeymgr*")) OR (Processes.process_name="credwiz.exe" Processes.process="*.crd*") OR (Processes.process_name="vaultcmd.exe" Processes.process="*/list*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## DCSync detection

Description: The DCSync attack methodology takes advantage of the Directory Replication Service Remote (DRSR) protocol to obtain sensitive information from a domain controller.
References: [1](https://blog.blacklanternsecurity.com/p/detecting-dcsync), [2](https://thedfirreport.com/2024/06/10/icedid-brings-screenconnect-and-csharp-streamer-to-alphv-ransomware-deployment/#credential-access), [3](https://threathunterplaybook.com/library/windows/active_directory_replication.html), [4](https://learn.microsoft.com/en-us/windows/win32/adschema/r-ds-replication-get-changes-all), [5](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A96%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C627%2C0%5D)
SPL:

```spl
index="windows" EventCode=4662 Properties IN ("*{1131f6ad-9c07-11d1-f79f-00c04fc2dcd2}*", "*{19195a5b-6da0-11d0-afd3-00c04fd930c9}*", "*{89e95b76-444d-4c62-991a-0facbeda640c}*") NOT SubjectUserName IN ("*$", "AADSync-Service")
| rename signature AS EventDescription
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), admin_lookup=replace(SubjectUserName,"^(\w+)_admin","\1")
| lookup ad_users sAMAccountName AS admin_lookup OUTPUT displayName AS Name, mail AS Email
| table Time, host, SubjectUserName, EventCode, EventDescription, ObjectName, Properties, Name, Email
```

## Defender traffic blocked by Windows Firewall

References: [1](https://github.com/netero1010/EDRSilencer), [2](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-5157), [3](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=5157)
SPL:

```spl
index="windows" EventCode="5157" Application IN ("*MsMpEng.exe", "*MsSense.exe", "*SenseIR.exe", "*SenseNdr.exe", "*SenseCncProxy.exe", "*SenseSampleUploader.exe")
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), EventDescription=signature
| table Time, host, EventCode, EventDescription, Application, SourceAddress, DestAddress, DestPort, Protocol, transport
```

## Domain Administrator enabled/disabled

Description: Identify when the domain Administrator account is being enabled or disabled. The account must never be enabled.
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Change.All_Changes WHERE index="windows" nodename=All_Changes.Account_Management.Accounts_Updated All_Changes.result_id IN (4722, 4725) All_Changes.user="Administrator" BY All_Changes.user, All_Changes.Account_Management.src_user, All_Changes.Account_Management.src_nt_domain, All_Changes.result, All_Changes.result_id, _time span=1s
| rename All_Changes.Account_Management.* AS *, All_Changes.* AS *, src_user AS Admin, src_nt_domain AS Domain, result_id AS EventCode, result AS EventDescription
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), admin_lookup=replace(Admin,"^(\w+)_admin","\1")
| lookup ad_users sAMAccountName AS admin_lookup OUTPUT displayName AS Name, mail AS Email
| table Time, EventCode, EventDescription, user, Admin, Name, Email
```

## Deprioritise Windows Defender

Description: Identify if an unwanted application registered and enabled itself as a security provider in place of Defender.
References: [1](https://isc.sans.edu/diary/NoDefender+YesDefender/30980/)
SPL:

```spl
index="windows" source="XmlWinEventLog:Application" Name="'SecurityCenter'" EventCode=15 EventData_Xml!="<Data>Windows Defender</Data>*"
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup cmdb_ci_list_lookup name AS host OUTPUT dv_assigned_to AS "Last Active User"
| table Time, index, host, EventCode, EventData_Xml, "Last Active User"
```

## Disable Microsoft Defender

References: [1](https://thedfirreport.com/2023/12/18/lets-opendir-some-presents-an-analysis-of-a-persistent-actors-activity/#defense-evasion), [2](https://thedfirreport.com/2024/08/12/threat-actors-toolkit-leveraging-sliver-poshc2-batch-scripts/#c25), [3](https://thedfirreport.com/2024/08/12/threat-actors-toolkit-leveraging-sliver-poshc2-batch-scripts/#c26)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process IN ("*defender*", "*MsMpEng*", "*MpPreference*") Processes.process IN ("*disable*", "*exclusion*", "*kill*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## Disable Microsoft Defender (Powershell Script)

References: [1](https://thedfirreport.com/2023/12/18/lets-opendir-some-presents-an-analysis-of-a-persistent-actors-activity/#defense-evasion)
SPL:

```spl
index="windows" source IN ("XmlWinEventLog:Microsoft-Windows-PowerShell/Operational", "XmlWinEventLog:PowerShellCore/Operational") EventCode=4104 ScriptBlockText IN ("*MpPreference*", "*Windows Defender*") ScriptBlockText IN ("*disable*", "*exclusion*")
| eval Time=strftime(_time,"%Y-%m-%d %H:%M:%S %z"), sid_lookup=replace(UserID, "'", "")
| lookup ad_users objectSid AS sid_lookup OUTPUT sAMAccountName AS Username
| eval user_lookup=replace(Username,"^(\w+)_admin","\1")
| lookup ad_users sAMAccountName AS user_lookup OUTPUT displayName AS Name, mail as Email, sAMAccountName AS Username
| table Time, host, Path, Username, Name, ScriptBlockText, System_Props_Xml
```

## EvilProxy IoC

Description: A user has possibly visited a phishing site operated behind EvilProxy that reverse proxy to Microsoft sites.
References: [1](https://www.menlosecurity.com/blog/evilproxy-phishing-attack-strikes-indeed/)
SPL:

```spl
index="proxy" url IN ("*/ests/2.1/content/*", "*/shared/1.0/content/*", "*/officehub/bundles/*") NOT url_domain IN ("aadcdn.msftauth.net", "res.cdn.office.net", "logincdn.msftauth.net", "aadcdn.msauth.net", "lgincdnvzeuno.azureedge.net")
| lookup ldap_assets ip AS srcip OUTPUT dns AS Asset
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email, jobTitle AS Title
| eval Domain=coalesce(url_domain, site, hostname, dstname), URL=url, Category=catdesc
| table _time, Domain, URL, Category, action, referralurl, user, Name, Title, Asset, Email, Department, Company
| dedup visited_link, user
```

## Excessive Account Lockout

Description: Track regular accounts that have been locked out >=10 for the past hour.
Caveats: (1) Asset assignment is better known as the last active user. (2) password update time may not be the latest.
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="null" count FROM datamodel=Change.All_Changes WHERE index="windows" nodename=All_Changes.Account_Management.Account_Lockouts All_Changes.result_id=4740 NOT All_Changes.user IN ("Administrator", "*_admin", "Guest") BY All_Changes.Account_Management.src_nt_domain, All_Changes.Account_Management.src_nt_host, All_Changes.Account_Management.dest_nt_domain, All_Changes.user, All_Changes.result_id, All_Changes.result, _time span=1s
| rename All_Changes.Account_Management.* AS *, All_Changes.* AS *, src_nt_domain AS Domain, user AS Username, result_id AS EventCode, result AS EventName
| eval Asset=if(src_nt_host!="null", src_nt_host, dest_nt_domain)
```there are 2 "count" (tstats & stats) to dedup original events```
| stats count AS event_count BY Domain, Asset, EventCode, EventName, Username
| where event_count>=10
| sort -event_count
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), user_lookup=replace(Username,"^(\w+)_admin","\1")
| lookup ad_users sAMAccountName AS user_lookup OUTPUT displayName AS Name, mail AS Email, pwdLastSet_localtime AS "Password Last Changed"
| lookup cmdb_ci_list_lookup name AS Asset OUTPUT dv_assigned_to AS "Asset Assigned To"
| lookup cmdb_ci_list_lookup dv_assigned_to AS Name OUTPUT name AS "User-assigned Asset(s)"
| rename Asset AS "Affected Asset", event_count AS Count
| table Domain, EventCode, EventName, "Affected Asset", "Asset Assigned To", Username, "Password Last Changed", Name, "User-assigned Asset(s)", Email, BizUnit, Company, Count
```

## Excessive Blocked Websites

Description: Track malicious websites that have been blocked >=15 or opened by >=3 users for the past hour.
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count AS per_user_count FROM datamodel=Web WHERE index="proxy" Web.action=blocked [| inputlookup malicious_categories.csv | where malicious!="false" | fields category | rename category AS Web.category] BY Web.user, Web.src, Web.url_domain, Web.category, Web.http_referrer, _time span=1s
| rename Web.* AS *
| stats count AS per_site_count, values(user) AS users, values(src) AS src_list, values(http_referrer) AS Referrer BY url_domain, category
```count may not be accurate due to duplicate events```
| where per_site_count>=15 OR mvcount(users)>=3
| sort -per_site_count
| lookup ldap_assets ip AS src_list OUTPUT dns AS src_host
| lookup ad_users sAMAccountName as users OUTPUT displayName as Name, mail as Email
| rename per_site_count AS total_count, url_domain AS Domain
| table Domain, category, Referrer, total_count, src_list, src_host, users, Name, Email
```

## Gootloader IOC

References: [1](https://redcanary.com/blog/gootloader/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 (Processes.parent_process_name="wscript.exe" Processes.process_name="cscript.exe") OR (Processes.parent_process_name="cscript.exe" Processes.process_name="powershell.exe") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## Headless Browser

References: [1](https://redcanary.com/blog/intelligence-insights-june-2023/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name ("msedge.exe", "chrome.exe") Processes.process IN ("*--headless*", "*--dump-dom*", "*--enable-automation*", "*--remote-debugging-port*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## ie4uinit.exe/msxsl.exe abuse

Description: Abused by threat actor to execute COM scriptlets (SCT) from remote servers.
References: [1](https://thedfirreport.com/2024/12/02/the-curious-case-of-an-egg-cellent-resume/#execution), [2](https://lolbas-project.github.io/lolbas/Binaries/Ie4uinit/), [3](https://lolbas-project.github.io/lolbas/OtherMSBinaries/Msxsl/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" ((Processes.process_name="ie4uinit.exe" AND Processes.process="*basesetting*") OR Processes.process_name="msxsl.exe") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## Impacket detection

Description: Commonly abused by threat actor to execute commands remotely.
References: [1](https://thedfirreport.com/2024/06/10/icedid-brings-screenconnect-and-csharp-streamer-to-alphv-ransomware-deployment/#execution)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" ((Processes.process_name="cmd.exe" AND Processes.process="*\\\\127.0.0.1\\*") OR (Processes.process_name="svchost.exe" AND Processes.process="*regsvc*")) BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## Kerberos Certificate Spoofing

Description: Before the May 10, 2022 security update, certificate-based authentication would not account for a dollar sign ($) at the end of a machine name. This allowed related certificates to be emulated (spoofed) in various ways.
References: [1](https://support.microsoft.com/en-au/topic/kb5014754-certificate-based-authentication-changes-on-windows-domain-controllers-ad2c23b0-15d8-4340-a468-4d4f3b188f16), [2](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A79%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C227%2C0%5D), [3](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A90%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C691%2C0%5D)
SPL:

```spl
index="windows" source="XmlWinEventLog:System" EventCode IN (39,41,40,48,41,49)
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, index, host, UserData_Xml
```

## Kerberos TGT request without password

Description: Kerberos TGT request with "Pre-Authentication Type" set to 0, meaning no password is required. It might a sign of AS-REP roasting.
References: [1](https://thedfirreport.com/2024/08/26/blacksuit-ransomware/#credential-access), [2](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4768#table-5-kerberos-pre-authentication-types)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode=4768 PreAuthType=0
| rename signature AS EventDescription, dest_nt_domain AS Domain, dest AS Destination
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), source_ip=replace(src, "^::ffff:", "")
| lookup ldap_assets ip AS source_ip OUTPUT nt_host
| lookup dhcp_lookup ip AS source_ip OUTPUT nt_host AS nt_host2
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, description AS AccountDescription
| eval source_host=coalesce(nt_host, nt_host2)
| table Time, index, host, Domain, user, EventCode, EventDescription, PreAuthType, source_ip, source_host, Destination, Name, AccountDescription
```

## Kerberos Pre-Authentication Flag Disabled in UserAccountControl

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

## Kerberos TGT request with weak encryption

Description: TGT request with DES/RC4 weak encryption, commonly abused for Kerberoasting.
References: [1](https://thedfirreport.com/2024/08/26/blacksuit-ransomware/#credential-access), [2](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4768#table-4-kerberos-encryption-types)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode=4768 TicketEncryptionType IN ("0x1", "0x3", "0x17", "0x18")
| rename signature_id AS EventCode, signature AS EventDescription, dest_nt_domain AS Domain, dest AS Destination
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), source_ip=replace(src, "^::ffff:", "")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, description AS AccountDescription
| lookup ldap_assets ip AS source_ip OUTPUT nt_host
| lookup dhcp_lookup ip AS source_ip OUTPUT nt_host AS nt_host2
| eval source_host=coalesce(nt_host, nt_host2)
| table Time, index, host, Domain, user, EventCode, EventDescription, TicketEncryptionType, source_ip, source_host, Destination, Name, AccountDescription
```

## Kerberos service ticket request with weak encryption

Description: Service ticket request with DES/RC4 weak encryption, commonly abused for Kerberoasting.
References: [1](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A61%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C657%2C0%5D)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode=4769 (TicketEncryptionType IN ("0x1", "0x3", "0x17", "0x18") OR TicketOptions IN ("0x40800000", "0x40810000"))
| rename signature_id AS EventCode, signature AS EventDescription, dest_nt_domain AS Domain, dest AS Destination
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), source_ip=replace(src, "^::ffff:", "")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, description AS AccountDescription
| lookup ldap_assets ip AS source_ip OUTPUT nt_host
| lookup dhcp_lookup ip AS source_ip OUTPUT nt_host AS nt_host2
| eval source_host=coalesce(nt_host, nt_host2)
| table Time, index, host, Domain, user, EventCode, EventDescription, TicketEncryptionType, source_ip, source_host, Destination, Name, AccountDescription
```

## Kernel driver service was installed

Description: If this is an unknown kernel mode driver it may indicate a malicious or vulnerable driver being leveraged for exploitation, such as to bypass LSA protection. A service type field of ‘0x1’ or ‘0x2’ can indicate kernel driver services.
References: [1](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A182%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C691%2C0%5D)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode=4697 ServiceType IN ("0x1", "0x2")
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), EventDescription=signature, ServiceTypeName=case(ServiceType=="0x1", "SERVICE_KERNEL_DRIVER", ServiceType=="0x2", "SERVICE_FILE_SYSTEM_DRIVER"), ServiceDescription=case(ServiceType=="0x1", "Driver service", ServiceType=="0x2", "File system driver service")
| table Time, index, host, EventCode, EventDescription, SubjectUserName, ServiceFileName, ServiceTypeName, ServiceDescription
```

## LSASS.exe Read

Description: Skeleton Key is malware that overrides the NTLM and Kerberos authentication process and sets a password - called the Skeleton Key - to authenticate as any user object in a domain. This compromises the LSASS process on a Domain Controller and requires administrative privileges to execute. This malware is used by malicious actors to establish persistence and evade detection.
References: [1](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A182%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C691%2C0%5D)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode IN (4656, 4663) ObjectName="C:\\Windows\\System32\\lsass.exe"
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), EventDescription=signature, User=src_user
| lookup ad_users sAMAccountName AS src_user OUTPUT displayName, description AS AccountDescription
| table Time, index, host, EventCode, EventDescription, ProcessName, User, displayName, AccountDescription
```

## LSASS.exe driver loading

Description: This event is generated when a driver fails to load because it does not meet Microsoft's signing requirements. This indicates that a code integrity check determined that a process, usually LSASS.exe, attempted to load a driver that did not meet the Microsoft signing level requirements..
References: [1](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A182%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C691%2C0%5D)
SPL:

```spl
index="windows" source="XmlWinEventLog:Microsoft-Windows-CodeIntegrity/Operational" EventCode IN (3033,3063) ProcessNameBuffer="*lsass.exe"
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, index, host, user, EventCode, Name, RequestedPolicy, ProcessNameBuffer, FileNameBuffer
```

## Large Powershell Module

References: [1](https://www.malwarearchaeology.com/s/Windows-PowerShell-Logging-Cheat-Sheet-ver-Sept-2018-v22.pdf)
SPL:

```spl
index="windows" source IN ("XmlWinEventLog:Microsoft-Windows-PowerShell/Operational", "XmlWinEventLog:PowerShellCore/Operational") EventCode=4104
| eval Script_Length=len(ScriptBlockText), Time=strftime(_time,"%Y-%m-%d %H:%M:%S %z")
| where Script_Length > 1000
| eval sid_lookup=replace(UserID, "'", "")
| lookup ad_users objectSid AS sid_lookup OUTPUT sAMAccountName AS Username
| eval user_lookup=replace(Username,"^(\w+)_admin","\1")
| lookup ad_users sAMAccountName AS user_lookup OUTPUT displayName AS Name, mail as Email, sAMAccountName AS Username
| table Time, host, Path, Username, Name, Script_Length, ScriptBlockText, System_Props_Xml
```

## LockBit 3.0

References: [1](https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-075a)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="dllhost.exe" Processes.process="*3e5fc7f9-9a51-4367-9063-a120244fbec*" BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## Logon from External Network

References: [1](https://thedfirreport.com/2024/01/29/buzzing-on-christmas-eve-trigona-ransomware-in-3-hours/#initial-access)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Authentication WHERE index="windows" nodename=Authentication.Successful_Authentication Authentication.signature_id=4624 NOT Authentication.src IN (-,unknown,10.*,192.168.*,fd*,fe80:*,127.*,::1,2002:*,MYCOMPANY*) BY index, host, Authentication.src, Authentication.user, Authentication.signature_id, Authentication.signature, Authentication.authentication_signature_id, Authentication.authentication_title, _time span=1s
| rename Authentication.* AS *, src AS source_ip, signature_id AS EventCode, signature AS EventDescription, authentication_signature_id AS LogonType, authentication_title AS LogonTitle
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, source_ip, LogonType, LogonTitle, user, Name, Email
```

## Logon with NewCredentials type

Description: These events are normally generated by service accounts during AD sync. Unusual events may be indicator of pass-the-hash.
References: [1](https://thedfirreport.com/2024/08/26/blacksuit-ransomware/#lateral-movement), [2](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4624#logon-types-and-descriptions)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Authentication WHERE index="windows" nodename=Authentication.Successful_Authentication Authentication.signature_id=4624 Authentication.authentication_signature_id=9 BY index, host, Authentication.src, Authentication.user, Authentication.src_user, Authentication.src_nt_domain, Authentication.dest, Authentication.signature_id, Authentication.authentication_signature_id, Authentication.authentication_title, Authentication.authentication_signature, _time span=1s
| rename Authentication.* AS *, src_user AS subject_user, src AS source_ip, signature_id AS EventCode, authentication_signature AS LogonResult, authentication_signature_id AS LogonType, authentication_title AS LogonTitle, src_nt_domain AS Domain, dest AS Destination
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, description AS AccountDescription
| table Time, index, host, Domain, user, EventCode, LogonType, LogonTitle, LogonResult, source_ip, Destination, subject_user, Name, AccountDescription
```

## Malicious Host Threat Intelligence

Description: This alert monitors for connection to known malicious hosts.
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Web WHERE index="proxy" Web.action!="blocked"
BY Web.user, Web.src, Web.dest, Web.url_domain, Web.url, Web.category, Web.action, _time span=1s
| rename Web.* AS *
```[](https://splunkbase.splunk.com/app/6970```)
| lookup urlhaus-filter-splunk-online host AS url_domain, host AS dest OUTPUT message AS description, updated
| lookup urlhaus-filter-splunk-online path_wildcard_prefix AS url, host AS url_domain, host AS dest OUTPUT message AS description2, updated AS updated2
| lookup phishing-filter-splunk host AS url_domain, host AS dest OUTPUT message AS description3, updated AS updated3
| lookup phishing-filter-splunk path_wildcard_prefix AS url, host AS url_domain, host AS dest OUTPUT message AS description4, updated AS updated4
| lookup pup-filter-splunk host AS url_domain, host AS dest OUTPUT message AS description5, updated AS updated5
| lookup vn-badsite-filter-splunk host AS url_domain, host AS dest OUTPUT message AS description6, updated AS updated6
| lookup botnet_ip dst_ip AS dest OUTPUT malware AS description7, updated AS updated7
| eval Description=coalesce(description, description2, description3, description4, description5, description6, description7)
| search Description=*
| lookup ldap_assets ip AS src OUTPUT nt_host
| lookup dhcp_lookup ip AS src OUTPUT nt_host AS nt_host2
| lookup ad_users sAMAccountName as user OUTPUT displayName as Name, mail as Email
| eval updated=coalesce(updated, updated2, updated3, updated4, updated5, updated6, updated7), "Signature Last Updated"=strftime(strptime(updated." +0000","%Y-%m-%dT%H:%M:%SZ %z"),"%Y-%m-%d %H:%M:%S %z"), Asset=coalesce(nt_host, nt_host2), Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), "Source IP"=src, Username=user, Domain=url_domain, "Destination IP"=dest, URL=url, Action=action
| table Time, "Signature Last Updated", "Source IP", Asset, Username, Name, Email, Domain, "Destination IP", Description, Action, URL
```

## Microsoft Public Symbol download

References: [1](https://blog.talosintelligence.com/blackbyte-blends-tried-and-true-tradecraft-with-newly-disclosed-vulnerabilities-to-support-ongoing-attacks/#novel-observations)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Web WHERE index="proxy" Web.url_domain="msdl.microsoft.com"
BY Web.user, Web.src, Web.dest, Web.url_domain, Web.url, Web.category, Web.action, _time span=1s
| rename Web.* AS *
| lookup ldap_assets ip AS src OUTPUT nt_host
| lookup dhcp_lookup ip AS src OUTPUT nt_host AS nt_host2
| lookup ad_users sAMAccountName as user OUTPUT displayName as Name, mail as Email
| eval Asset=coalesce(nt_host, nt_host2), Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), "Source IP"=src, Username=user, Domain=url_domain, "Destination IP"=dest, URL=url, Action=action
| table Time, "Source IP", Asset, Username, Name, Email, Domain, "Destination IP", Action, URL
```

## Monthly Inactive Accounts Report

Description: List all inactive users have not logged on for 90 days or more.
SPL:

```spl
| inputlookup ad_users.csv
| eval last_logon=strptime(lastLogonTimestamp." +0000","%Y-%m-%dT%H:%M:%S.%QZ %z"), "Days Since Last Logon"=round((now()-last_logon)/86400), creation_time=strptime(whenCreated,"%Y-%m-%d %H:%M:%S%z"), "Days Since Account Created"=round((now()-creation_time)/86400)
| where 'Days Since Last Logon'>90 OR (lastLogonTimestamp=="(blank)" AND 'Days Since Account Created'>90)
| eval "Last Login Date"=strftime(last_logon, "%d/%m/%Y"), Created=strftime(creation_time, "%d/%m/%Y %I:%M:%S %p"), "Password Never Expires"=if(isnotnull(mvfind(userAccountControl, "DONT_EXPIRE_PASSWD")), "True", "False")
| rename domain AS Domain, displayName AS "Display Name", sAMAccountName AS UserName, mail AS eMail
| sort Domain, UserName
| table Domain, "Display Name", UserName, eMail, "Last Login Date", "Days Since Last Logon", Created, "Days Since Account Created", "Password Never Expires"
```

## Multiple Account Passwords changed by an Administrator

Description: An admin had changed passwords of at least 10 accounts in a day.
References: [1](https://instance.splunkcloud.com/en-GB/app/Splunk_Security_Essentials/showcase_simple_search?ml_toolkit.dataset=Multiple%20Account%20Passwords%20changed%20by%20an%20Administrator%20-%20Live)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Change.All_Changes WHERE index="windows" nodename=All_Changes.Account_Management.Accounts_Updated All_Changes.result_id IN (4724, 628) NOT All_Changes.user IN ("*$", "unknown") BY All_Changes.user, All_Changes.Account_Management.src_user, All_Changes.Account_Management.src_nt_domain, _time span=1s
| rename All_Changes.Account_Management.* AS *, All_Changes.* AS *, src_user AS Admin, src_nt_domain AS Domain
| dedup Domain, Admin, user
| eval admin_lookup=replace(Admin,"^(\w+)_admin","\1"), normal_admin=admin_lookup, normal_user=replace(user,"^(\w+)_admin","\1"), user_time="[".strftime(_time, "%H:%M")."] ".user
```exclude admins changing their accounts```
| where normal_admin!=normal_user
| table Domain, Admin, user_time, admin_lookup
| mvcombine user_time
| eval Users=mvjoin(mvsort(user_time), ", "), user_count=mvcount(user_time)
| where user_count>=10
| lookup ad_users sAMAccountName AS admin_lookup OUTPUT displayName AS Name
| sort Domain, Admin
| eval "Password updated by"=Admin
| table Domain, "Password updated by", Name, Users
```

## Named pipe usage

References: [1](https://thedfirreport.com/2024/08/26/blacksuit-ransomware/#privilege-escalation)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process="*\\pipe*" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## New Interactive Logon from a Service Account

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

## OneNote IOC

References: [1](https://redcanary.com/blog/intelligence-insights-february-2023/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.parent_process_path="c:\\program files (x86)\\microsoft office\\root\\office16\\onenote.exe" NOT Processes.process IN ("c:\\program files (x86)\\microsoft office\\root\\office16\\*.exe", "c:\\program files (x86)\\microsoft\\edge\\application\\msedge.exe") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
```excludes onenote quick launch & edge```
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## Open Port 53

Description: Monitor for open port 53
SPL:

```spl
index="nmap" state="open" portid=53
  NOT [| inputlookup Port53_Excludelist.csv
    | fields ip
    | rename ip AS addr]
| lookup ldap_assets ip AS addr OUTPUT dns AS dns2
| lookup dhcp_lookup ip AS addr OUTPUT dns AS dns3
| eval dns=coalesce(hostname, dns2, dns3)
| rex field=dns "(?<asset_lookup>^\w+)"
| lookup cmdb_ci_list_lookup name AS asset_lookup OUTPUT dv_assigned_to AS displayName
| lookup ad_users displayName OUTPUT sAMAccountName, mail
| lookup nmap-targets Target AS addr OUTPUT Comment AS subnet
| table addr, protocol, portid, hostname, dns, product, version, ostype, devicetype, extrainfo, state, subnet
| eval product=coalesce(product, state), version=coalesce(version, " "), comment=trim(product." ".version), host=coalesce(hostname, dns, "")
| table host, addr, subnet, portid, comment
| sort addr, portid
```

## Plaintext credential

References: [1](https://thedfirreport.com/2024/04/29/from-icedid-to-dagon-locker-ransomware-in-29-days/#credential-access)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="notepad.exe" Processes.proces="*password*" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## Possible ShareFinder/Sharphound Usage

Description: SharedFinder/Netscan/Sharphound is commonly used to discover shares in a network.
References: [1](https://thedfirreport.com/2023/01/23/sharefinder-how-threat-actors-discover-file-shares/#htoc-file-share-access), [2](https://thedfirreport.com/2024/01/29/buzzing-on-christmas-eve-trigona-ransomware-in-3-hours/#discovery), [3](https://thedfirreport.com/2024/08/26/blacksuit-ransomware/#credential-access)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode=5145 (ShareName IN ("\\\\*\\C", "\\\\*\\ADMIN", "\\\\*\\IPC") OR RelativeTargetName="delete.me")
| rex field=SubjectUserName "(?<lookup_username>[^\d+]+)"
| eval dst_asset=Computer, lookup_username=upper(lookup_username)
| lookup ldap_assets ip AS IpAddress OUTPUT dns AS src_asset
| lookup ad_users sAMAccountName AS lookup_username OUTPUT displayName, company, department, mail, telephoneNumber, mobile
| table _time, src_asset, dst_asset, ShareName, SubjectUserName, displayName, mail, department, company
```

## PowerShell Web Downloads

References: [1](https://redcanary.com/blog/intelligence-insights-may-2023/), [2](https://www.malwarearchaeology.com/s/Windows-PowerShell-Logging-Cheat-Sheet-ver-Sept-2018-v22.pdf), [3](https://lolbas-project.github.io/lolbas/Binaries/Certutil/), [4](https://thedfirreport.com/2023/12/18/lets-opendir-some-presents-an-analysis-of-a-persistent-actors-activity/#discovery), [5](https://redcanary.com/blog/threat-intelligence/intelligence-insights-march-2024/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 ((Processes.process_name="powershell.exe" Processes.process IN ("*.download*", "*net.webclient*")) OR (Processes.process_name="certutil.exe" Processes.process IN ("*-urlcache*", "*-verifyctl*", "*-f*", "*/f*"))) BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## PowerShell Web Downloads (Operational)

References: [1](https://redcanary.com/blog/intelligence-insights-may-2023/), [2](https://www.malwarearchaeology.com/s/Windows-PowerShell-Logging-Cheat-Sheet-ver-Sept-2018-v22.pdf), [3](https://lolbas-project.github.io/lolbas/Binaries/Certutil/), [4](https://thedfirreport.com/2023/12/18/lets-opendir-some-presents-an-analysis-of-a-persistent-actors-activity/#discovery), [5](https://redcanary.com/blog/threat-intelligence/intelligence-insights-march-2024/)
SPL:

```spl
index="windows" source IN ("XmlWinEventLog:Microsoft-Windows-PowerShell/Operational", "XmlWinEventLog:PowerShellCore/Operational") EventCode=4104 ScriptBlockText IN ("*.Download*", "*Net.WebClient*", "*certutil* -urlcache*", "*certutil* -f*", "*certutil* /f*")
| eval sid_lookup=replace(UserID, "'", "")
| lookup ad_users objectSid AS sid_lookup OUTPUT sAMAccountName AS Username
| eval user_lookup=replace(Username,"^(\w+)_admin","\1")
| lookup ad_users sAMAccountName AS user_lookup OUTPUT displayName AS Name, mail AS Email
| table _time, host, Path, Computer, ScriptBlockText, Username, Name, Company, Department, Email
```

## Protected Group Monitoring

Description: Monitor new account with adminCount=1.
References: [1](https://learn.microsoft.com/en-us/windows/win32/adschema/a-admincount), [2](https://blog.netwrix.com/2022/09/30/admincount_attribute/), [3](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/security-best-practices/appendix-c--protected-accounts-and-groups-in-active-directory)
SPL:

```spl
index="ldapsearch" destCsv="hourly_adminCount.csv" adminCount=1
| join type=left sAMAccountName domain
  [ | inputlookup ad_users.csv
  | search adminCount=1
  | rename adminCount AS wasAdmin
  | table sAMAccountName domain wasAdmin]
| search NOT wasAdmin=1
| rename domain AS Domain, sAMAccountName AS User, displayName AS Name, mail AS Email
| table Domain, User, Name, Email
```

## Privileged Group Monitoring

Description: Monitor AD Domain, NetworkAdmins, WorkstationAdmins and local Administrators groups for changes.
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count AS event_count FROM datamodel=Change.All_Changes WHERE index="windows" nodename=All_Changes.Account_Management.Accounts_Updated All_Changes.result_id IN (4728, 4729, 4732, 4733, 4746, 4747, 4751, 4752, 4756, 4757, 4761, 4762)
  [| inputlookup privileged_group_monitoring.csv | search exclude!="true" | fields group | rename group AS All_Changes.object_attrs]
  BY host, All_Changes.Account_Management.dest_nt_domain, All_Changes.Account_Management.src_user, All_Changes.object_attrs, All_Changes.object, All_Changes.result_id, All_Changes.result, _time span=1s
| rename All_Changes.Account_Management.* AS *, All_Changes.* AS *, dest_nt_domain AS Domain, src_user AS Admin, result_id AS EventCode, result AS EventName, object_attrs AS Group, object AS Member
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), admin_lookup=replace(Admin,"^(\w+)_admin","\1"), member_lookup=replace(Member,"^(\w+)_admin","\1"), memberUsername=Member
| lookup ad_users sAMAccountName AS admin_lookup OUTPUT displayName AS adminName, jobTitle AS adminJob, company AS adminCompany, department AS adminDepartment, mail AS adminEmail
| lookup ad_users sAMAccountName AS member_lookup OUTPUT displayName AS memberName, jobTitle AS memberJob, company AS memberCompany, department AS memberDepartment, mail AS memberEmail
| table Time, host, Domain, EventCode, EventName, Admin, adminName, adminJob, adminEmail, adminDepartment, adminCompany, Group, memberUsername, memberName, memberEmail, memberJob, memberDepartment, memberCompany
```

## Privileged Service with SeDebugPrivilege was called

Description: This event is generated when a privileged service is called. This event triggers when the 'SeDebugPrivilege' privilege is enabled, which is required to successfully execute a Skeleton Key.
References: [1](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A182%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C691%2C0%5D)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode=4673 PrivilegeList="SeDebugPrivilege"
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), EventDescription=signature, User=src_user
| lookup ad_users sAMAccountName AS src_user OUTPUT displayName, description AS AccountDescription
| table Time, index, host, EventCode, EventDescription, ProcessName, User, displayName, AccountDescription
```

## Qbot IoC

References: [1](https://redcanary.com/blog/threat-intelligence/intelligence-insights/intelligence-insights-november-2023/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="regsvr32.exe" Processes.process="*appdata\\roaming*" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## Rclone/Restic Exfiltration

References: [1](https://thedfirreport.com/2024/04/29/from-icedid-to-dagon-locker-ransomware-in-29-days/#exfiltration), [2](https://thedfirreport.com/2024/09/30/nitrogen-campaign-drops-sliver-and-ends-with-blackcat-ransomware/#exfiltration)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name IN ("rclone.exe", "restic.exe") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## Reboot to safe mode

Description: This can be used to prevent antivirus or other preventative tools from stopping the ransom execution as many won't start when a host is booted in safe mode.
References: [1](https://thedfirreport.com/2024/09/30/nitrogen-campaign-drops-sliver-and-ends-with-blackcat-ransomware/#defense-evasion)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="bcdedit.exe" Processes.process="*default*" Processes.process="*safeboot*" Processes.process="*network*" BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## Regsvcs.exe process injection

Description: regsvcs.exe executing without any command-line parameters
References: [1](https://redcanary.com/blog/threat-intelligence/intelligence-insights/intelligence-insights-february-2024/), [2](https://lolbas-project.github.io/lolbas/Binaries/Regsvcs/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="regsvcs.exe" Processes.process="c:\\windows\\microsoft.net\\framework*\\regsvcs.exe" BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## Remote Desktop tool installation/execution

Description: Remote desktop software commonly abused by threat actor to deploy ransomware.
References: [1](https://thedfirreport.com/2024/06/10/icedid-brings-screenconnect-and-csharp-streamer-to-alphv-ransomware-deployment/#execution), [2](https://redcanary.com/blog/threat-intelligence/intelligence-insights-june-2024/), [3](https://blog.talosintelligence.com/lilacsquid/), [4](https://thedfirreport.com/2024/08/12/threat-actors-toolkit-leveraging-sliver-poshc2-batch-scripts/#c18), [5](https://arcticwolf.com/resources/blog/arctic-wolf-observes-campaign-exploiting-simplehelp-rmm-software-for-initial-access/), [6](https://blog.talosintelligence.com/talos-ir-trends-q4-2024/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process IN ("*ScreenConnect*", "*NetSupport*", "*TeamViewer*", "*AnyDesk*", "*MeshAgent*", "*Splashtop*", "*AteraAgent*", "*LogMeIn*", "*RustDesk*", "*ToDesk*", "*SimpleHelp*", "*Netop*", "*Impero*", "*RealVNC*", "*Dameware*") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## Remote Desktop tool auto-start

Description: Remote desktop software commonly abused by threat actor to deploy ransomware.
References: [1](https://thedfirreport.com/2024/06/10/icedid-brings-screenconnect-and-csharp-streamer-to-alphv-ransomware-deployment/#persistence), [2](https://redcanary.com/blog/threat-intelligence/intelligence-insights-june-2024/), [3](https://blog.talosintelligence.com/lilacsquid/), [4](https://thedfirreport.com/2024/08/12/threat-actors-toolkit-leveraging-sliver-poshc2-batch-scripts/#c18), [5](https://arcticwolf.com/resources/blog/arctic-wolf-observes-campaign-exploiting-simplehelp-rmm-software-for-initial-access/), [6](https://blog.talosintelligence.com/talos-ir-trends-q4-2024/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Services WHERE index="windows" Services.signature_id="7045" Services.process IN ("*ScreenConnect*", "*NetSupport*", "*TeamViewer*", "*AnyDesk*", "*MeshAgent*", "*Splashtop*", "*AteraAgent*", "*LogMeIn*", "*RustDesk*", "*ToDesk*", "*SimpleHelp*", "*Netop*", "*Impero*", "*RealVNC*", "*Dameware*") BY index, host, Services.signature_id, Services.signature, Services.process, Services.service_name, _time span=1s
| rename Services.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, host, EventCode, EventDescription, service_name, process, index
```

## Remote Desktop tool scheduled task

Description: Remote desktop software commonly abused by threat actor to deploy ransomware.
References: [1](https://thedfirreport.com/2024/06/10/icedid-brings-screenconnect-and-csharp-streamer-to-alphv-ransomware-deployment/#persistence), [2](https://redcanary.com/blog/threat-intelligence/intelligence-insights-june-2024/), [3](https://blog.talosintelligence.com/lilacsquid/), [4](https://redcanary.com/blog/threat-intelligence/scarlet-goldfinch/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Change.All_Changes WHERE index="windows" All_Changes.result_id=4698 All_Changes.object_attrs IN ("*ScreenConnect*", "*NetSupport*", "*TeamViewer*", "*AnyDesk*", "*MeshAgent*", "*Splashtop*", "*AteraAgent*", "*LogMeIn*", "*RustDesk*", "*ToDesk*", "*SimpleHelp*", "*Netop*", "*Impero*", "*RealVNC*", "*Dameware*") BY host, All_Changes.command, All_Changes.object, All_Changes.object_attrs, All_Changes.result, All_Changes.result_id, All_Changes.user, _time span=1s
| rename All_Changes.* AS *, object AS TaskName, result AS EventDescription, result_id AS EventCode, object_attrs AS TaskAttributes
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, host, TaskName, command, EventCode, EventDescription, user, TaskAttributes
```

## RestartManager abuse

Description: Ransomware often abuse RestartManager to force applications to release the locks they have on files so it can proceed to encrypt the files.
Caveat: Adjust the `quantity` appropriately to reduce false positive.
References: [1](https://blogs.jpcert.or.jp/en/2024/09/windows.html), [2](https://www.crowdstrike.com/en-us/blog/windows-restart-manager-part-1/)
SPL:

```spl
index="windows"  source="XmlWinEventLog:Application" EventCode IN (10000,10001) Name="'Microsoft-Windows-RestartManager'"
| eval Time=strftime(_time,"%Y-%m-%d %H:%M:%S %z"), objectSid=replace(UserID, "'", "")
| stats earliest(Time) AS first_occur, count BY index, host, objectSid
| lookup ad_users objectSid OUTPUT sAMAccountName AS Username, displayName AS Name
| table first_occur, index, host, objectSid, Username, Name
| sort -first_occur
```

## Restricted Admin Mode Detection

Description: Restricted Admin Mode is commonly abused by Gootloader to use collected hashes to login instead of a password.
References: [1](https://github.com/GhostPack/RestrictedAdmin), [2](https://thedfirreport.com/2024/02/26/seo-poisoning-to-domain-control-the-gootloader-saga-continues/#defense-evasion)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="reg.exe" Processes.process="*disablerestrictedadmin*" BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## Rundll32 Dumping LSASS Memory

Description:  Often used by attackers to access credentials stored on a system.
References: [1](https://redcanary.com/blog/credential-access/), [2](https://gist.github.com/JohnLaTwC/3e7dd4cd8520467df179e93fb44a434e), [3](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A70%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C318%2C0%5D)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process IN ("*rundll32*", "*procdump*", "*sekurlsa") Processes.process IN ("*minidump*", "*comsvcs*", "*lsass*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## Rundll32 Scheduled Task

References: [1](https://thedfirreport.com/2025/01/27/cobalt-strike-and-a-pair-of-socks-lead-to-lockbit-ransomware/#persistence)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Change.All_Changes WHERE index="windows" All_Changes.result_id=4698 All_Changes.object_attrs="*rundll32*" BY host, All_Changes.command, All_Changes.object, All_Changes.object_attrs, All_Changes.result, All_Changes.result_id, All_Changes.user, _time span=1s
| rename All_Changes.* AS *, object AS TaskName, result AS EventDescription, result_id AS EventCode, object_attrs AS TaskAttributes
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, host, TaskName, command, EventCode, EventDescription, user, TaskAttributes
```

## SAM Credential Dump

References: [1](https://redcanary.com/blog/credential-access/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="reg.exe" Processes.process IN ("c:\\windows\\system32\\reg.exe*save*", "c:\\windows\\system32\\reg.exe*export*") Processes.process IN ("c:\\windows\\system32\\reg.exe*sam*", "c:\\windows\\system32\\reg.exe*security*", "c:\\windows\\system32\\reg.exe*system*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## SIDHistory compromise

Description: Malicious actors may add a value to the 'sIDHistory' attribute of a user object they control to establish persistence. "%%1793" occurs when SidHistory value is cleared
References: [1](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A176%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C539%2C0%5D), [2](https://research.splunk.com/endpoint/5fde0b7c-df7a-40b1-9b3a-294c00f0289d/), [3](https://adsecurity.org/?p=1772)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode IN (4742, 4738) NOT SidHistory IN ("%%1793", "-")
| rename signature AS EventDescription, dest_nt_domain AS Domain
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, description AS AccountDescription
| lookup ad_users sAMAccountName AS src_user OUTPUT displayName AS Admin_name
| eval Admin=src_user
| table Time, index, host, Domain, user, EventCode, EventDescription, Name, AccountDescription, Admin, Admin_name, SidHistory
```

## SQL Server spawning Cmd.exe

References: [1](https://redcanary.com/blog/threat-intelligence/intelligence-insights-april-2024/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.parent_process_name="sqlservr.exe" Processes.process_name="cmd.exe" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## Splunk Events Deletion

Description: Detect deletion of Splunk events
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="(null)" count FROM datamodel=Splunk_Audit.Search_Activity WHERE index=_audit Search_Activity.search!="*index=test*" Search_Activity.app!="itsi" BY Search_Activity.info, Search_Activity.user, Search_Activity.search, Search_Activity.search_type, Search_Activity.savedsearch_name, Search_Activity.app, _time span=1s
| rename Search_Activity.* AS *
| regex search="\|\s*delete"
| eval Time=strftime(_time,"%Y-%m-%d %H:%M:%S %z")
| table Time, info, user, search_type, savedsearch_name, app, search
```

## SafeDllSearchMode is modified

References: [1](https://car.mitre.org/analytics/CAR-2021-11-001/), [2](https://learn.microsoft.com/en-us/windows/win32/dlls/dynamic-link-library-search-order#standard-search-order-for-unpackaged-apps)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process="*safedllsearchmode*" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## Suspicious Logon/Logoff Events

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

## Suspicious Netscaler CLI

References: [1](https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-201a)
SPL:

```spl
index=netscaler (citrix_netscaler_event_name="CMD_EXECUTED" OR event_source="CLI") Command IN ("*database.php*", "*ns_gui/vpn*", "*/flash/nsconfig/keys/updated*", "*LDAPTLS_REQCERT*", "*ldapsearch*", "*openssl*", "*salt*")
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, user, host, Command
```

## Suspicious Network Settings

Description: Midas ransomware is characterized in that it leaves traces in the event logs regarding changes to network settings, which are considered to be aimed to spread the infection, at the time of execution..
References: [1](https://blogs.jpcert.or.jp/en/2024/09/windows.html)
SPL:

```spl
index="windows" EventCode=7040 ServiceName IN ("Function Discovery Resource Publication", "SSDP Discovery", "Secure Socket Tunneling Protocol Service", "UPnP Device Host")
| eval Time=strftime(_time,"%Y-%m-%d %H:%M:%S %z")
| stats earliest(Time) AS first_occur, values(ServiceName) AS Services BY index, host, source, EventCode
| where mvcount(Services)=4
| table first_occur, index, host, source, EventCode, Services
| sort -first_occur
```

## Suspicious WMI

References: [1](https://redcanary.com/blog/intelligence-insights-august-2023/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="wmiprvse.exe" Processes.process="*appdata\\roaming*" BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## UPnP enablement

References: [1](https://thedfirreport.com/2024/08/12/threat-actors-toolkit-leveraging-sliver-poshc2-batch-scripts/#c15)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="sc.exe" Processes.process IN ("*SSDPSRV*", "*upnphost*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## Unauthorised Reverse Proxy Tunnel

References: [1](https://thedfirreport.com/2024/08/12/threat-actors-toolkit-leveraging-sliver-poshc2-batch-scripts/#c14)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name IN ("ngrok.exe", "cloudflared.exe") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## Unauthorised Computer Account Creation

Description: If the computer object is created by user objects that do not normally create computer objects, this may indicate a MachineAccountQuota compromise has occurred
References: [1](https://media.defense.gov/2024/Sep/25/2003553985/-1/-1/0/CTR-DETECTING-AND-MITIGATING-AD-COMPROMISES.PDF?is=33b30d991586f22c130c22b8ad5f62e4392bfc8d8483153841c8c4698a6076f4#%5B%7B%22num%22%3A71%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C54%2C346%2C0%5D)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode=4741
| rename signature AS EventDescription, dest_nt_domain AS Domain, TargetUserName AS Asset
| eval Time=strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS src_user OUTPUT displayName AS Admin_name
| eval Admin=src_user
| table Time, index, host, Domain, Asset, EventCode, EventDescription, Admin, Admin_name
```

## Unusual Scheduled Task

Description: A new scheduled task is created with minutely interval or with highest run level.
References: [1](https://blog.talosintelligence.com/gophish-powerrat-dcrat/#threat-actor-delivers-dcrat)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="schtasks.exe" Processes.process IN ("*minute*", "*highest*") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## Unusual printui.exe path

References: [1](https://redcanary.com/blog/threat-intelligence/tangerine-turkey/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="printui.exe" Processes.process_path!="C:\\Windows\\System32\\printui.exe" BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## User Login with Local Credentials

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

## VSCode tunnel

Description: Detect creation of Visual Studio Code Remote Tunnel
References: [1](https://unit42.paloaltonetworks.com/stately-taurus-abuses-vscode-southeast-asian-espionage/), [2](https://code.visualstudio.com/docs/remote/tunnels)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="code.exe" Processes.process="*tunnel*" BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## Volt Typhoon IOC

References: [1](https://www.cyber.gov.au/about-us/advisories/prc-state-sponsored-cyber-actor-living-off-the-land-to-evade-detection)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 (Processes.process_name="powershell.exe" Processes.process="*start-process*") OR (Processes.process_name="cmd.exe" Processes.process="*/c \"wmic path win32_logicaldisk get caption,filesystem,freespace,size,volumename\"*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## Volume Shadow Copy

References: [1](https://www.ired.team/offensive-security/credential-access-and-credential-dumping/dumping-domain-controller-hashes-via-wmic-and-shadow-copy-using-vssadmin)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name IN ("diskshadow.exe", "vssadmin.exe") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## Volume Shadow Delete

References: [1](https://thedfirreport.com/2024/08/12/threat-actors-toolkit-leveraging-sliver-poshc2-batch-scripts/#c02)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name IN ("wbadmin.exe", "cmd.exe", "vssadmin.exe", "wmic.exe") Processes.process IN ("*delete systemstatebackup*", "*delete backup*", "*disable backup*", "*delete shadows*", "*shadowcopy delete*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## Windows Event Log Clearing Events

Description: Looks for Windows event codes that indicate the Windows Audit Logs were tampered with.
References: [1](https://thedfirreport.com/2024/09/30/nitrogen-campaign-drops-sliver-and-ends-with-blackcat-ransomware/#defense-evasion)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="wevtutil.exe" Processes.process IN ("* clear-log *", "* cl *") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## Windows System Event Log Clearing Events

Description: Looks for Windows event codes that indicate the Windows Audit Logs were tampered with.
References: [1](https://instance.splunkcloud.com/en-GB/app/Splunk_Security_Essentials/showcase_simple_search?ml_toolkit.dataset=Windows%20Event%20Log%20Clearing%20Events%20-%20Live), [2](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=1102)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Change.All_Changes WHERE index="windows" (source="XmlWinEventLog:Security" AND All_Changes.result_id=1102) OR (source="XmlWinEventLog:System" AND All_Changes.result_id=104)
  BY host, All_Changes.dest, All_Changes.object, All_Changes.object_path, All_Changes.result, All_Changes.result_id, All_Changes.user, _time span=1s
| rename All_Changes.* AS *, dest AS Computer, object_path AS Name, result AS EventDescription, result_id AS EventCode, user AS Context
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, host, EventCode, EventDescription, Name, object, Context, Computer
```

## Windows Firewall Modification

References: [1](https://thedfirreport.com/2024/08/12/threat-actors-toolkit-leveraging-sliver-poshc2-batch-scripts/#adversary)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="netsh.exe" Processes.process="*firewall*" NOT Processes.process IN ("*advfirewall export*", "*Microsoft.Tri.Sensor.exe*") BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, process, user, Name, Email
```

## Windows Script Executed from Scheduled Task

References: [1](https://redcanary.com/blog/threat-intelligence/intelligence-insights-may-2024/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="schtasks.exe" Processes.process="*create*" Processes.process IN ("*wscript*", "*cscript*") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```

## Windows Script Executed from ZIP

References: [1](https://redcanary.com/blog/intelligence-insights-september-2023/), [2](https://redcanary.com/blog/threat-intelligence/scarlet-goldfinch/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name="wscript.exe" Processes.process IN ("*.zip*", "*.js*") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, host, process, parent_process, EventCode, EventDescription, user, Name, Email, index
```

## WinRAR Spawning Shell Application

Description: This activity may indicate exploitation of the WinRAR CVE-2023-38831 vulnerability, where malicious scripts are executed from spoofed ZIP archives.
References: [1](https://www.cloudflare.com/en-gb/threat-intelligence/research/report/disrupting-flyingyetis-campaign-targeting-ukrainev/#splunk), [2](https://research.splunk.com/endpoint/d2f36034-37fa-4bd4-8801-26807c15540f/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.parent_process_name="winrar.exe" Processes.process_name IN ("cmd.exe", "powershell.exe", "pwsh.exe", "sh.exe", "bash.exe", "wscript.exe", "cscript.exe", "certutil.exe","mshta.exe","bitsadmin.exe") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, host, process, parent_process, EventCode, EventDescription, user, Name, Email, index
```

## WinrsHost.exe execution

References: [1](https://www.elastic.co/security-labs/fragile-web-ref7707), [2](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/winrs)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 (Processes.parent_process_name="winrshost.exe" OR Processes.process_name="winrs.exe") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```
