---
title: VPN Web Traffic from Foreign IP
layout: page
date: 2025-07-27
---

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
