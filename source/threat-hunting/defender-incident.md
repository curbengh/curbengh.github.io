---
title: Defender Incident
layout: page
date: 2025-07-27
---

Description: Alert Defender incidents queried using Graph API.
References: [1](https://splunkbase.splunk.com/app/6207)
SPL:

```spl
index="defender" sourcetype="ms365:defender:incident:alerts"
| dedup incidentId sortby -_time
| eval created=strptime(createdDateTime." +0000", "%Y-%m-%dT%H:%M:%S.%QZ %z")
```today```
| where created>=relative_time(now(), "@d")
| rename evidence{}.* AS *, fileDetails.* AS *, userAccount.* AS *, loggedOnUsers{}.accountName AS loggedOnUser
| eval accountName=coalesce(accountName, loggedOnUser)
| lookup ad_users sAMAccountName AS accountName OUTPUT displayName AS accountUser
| lookup cmdb_ci_list_lookup dv_name AS hostName OUTPUT dv_assigned_to AS lastActiveUser
| eval Time=strftime(created, "%Y-%m-%d %H:%M:%S %z"), "Last Updated"=strftime(_time, "%Y-%m-%d %H:%M:%S %z"), evidence=if(isnotnull(sha1), mvindex(filePath,0)."\\".mvindex(fileName,0), coalesce(url, processCommandLine, "")), hostName=if(hostName=="null", deviceDnsName, hostName), evidenceType=if(isnotnull(url), "#microsoft.graph.security.urlEvidence", "#microsoft.graph.security.fileEvidence"), remediationStatus=mvindex(remediationStatus, mvfind('@odata.type', evidenceType))
| table Time, "Last Updated", status, severity, remediationStatus, incidentId, title, threatDisplayName, accountUser, hostName, lastActiveUser, evidence, sha1, incidentWebUrl
```
