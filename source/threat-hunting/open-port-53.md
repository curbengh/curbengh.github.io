---
title: Open Port 53
layout: page
date: 2025-07-27
---

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
