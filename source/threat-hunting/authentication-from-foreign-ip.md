---
title: Authentication from Foreign IP
layout: page
date: 2025-07-27
---

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
