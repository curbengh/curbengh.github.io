---
title: Generate list of AD computers using ldapsearch
layout: page
date: 2025-07-27
---

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
