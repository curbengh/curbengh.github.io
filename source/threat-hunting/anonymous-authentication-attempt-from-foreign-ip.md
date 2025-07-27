---
title: Anonymous Authentication Attempt from Foreign IP
layout: page
date: 2025-07-27
---

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
