---
title: Possible ShareFinder/Netscan/Sharphound/CobaltStrike Usage
layout: page
date: 2025-07-27
---

Description: SharedFinder/Netscan/Sharphound/Netscan/CobaltStrike is commonly used to discover shares in a network.
References: [1](https://thedfirreport.com/2023/01/23/sharefinder-how-threat-actors-discover-file-shares/#htoc-file-share-access), [2](https://thedfirreport.com/2024/01/29/buzzing-on-christmas-eve-trigona-ransomware-in-3-hours/#discovery), [3](https://thedfirreport.com/2024/08/26/blacksuit-ransomware/#credential-access), [4](https://www.unh4ck.com/detection-engineering-and-threat-hunting/lateral-movement/detecting-conti-cobaltstrike-lateral-movement-techniques-part-1#cobaltstrike-jump-psexec_psh)
SPL:

```spl
index="windows" source="XmlWinEventLog:Security" EventCode=5145 (ShareName IN ("\\\\*\\C$", "\\\\*\\ADMIN$", "\\\\*\\IPC$") OR RelativeTargetName IN ("delete.me", "MSSE-*", "status_*", "postex_ssh_*", "msagent_*", "postex_*", "mojo*", "wkssvc*", "ntsvcs*", "DserNamePipe*", "SearchTextHarvester*", "scerpc*", "mypipe-*", "windows.update.manager*"))
| rex field=SubjectUserName "(?<lookup_username>[^\d+]+)"
| eval dst_asset=Computer, lookup_username=upper(lookup_username)
| lookup ldap_assets ip AS IpAddress OUTPUT dns AS src_asset
| lookup ad_users sAMAccountName AS lookup_username OUTPUT displayName
| table _time, src_asset, dst_asset, ShareName, SubjectUserName, displayName
```

With [additional mapping](https://gitlab.com/curben/splunk-scripts/-/commit/cc3e156a75519dbb3a23e0fb833c87b46c0b9409) to Endpoint Filesystem data model:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Endpoint.Filesystem WHERE index="windows" Filesystem.signature_id=5145 (Filesystem.file_name IN ("\\\\*\\C$", "\\\\*\\ADMIN$", "\\\\*\\IPC$") OR Filesystem.file_target IN ("delete.me", "MSSE-*", "status_*", "postex_ssh_*", "msagent_*", "postex_*", "mojo*", "wkssvc*", "ntsvcs*", "DserNamePipe*", "SearchTextHarvester*", "scerpc*", "mypipe-*", "windows.update.manager*")) BY index, host, Filesystem.file_target, Filesystem.file_name, Filesystem.file_path, Filesystem.signature_id, Filesystem.signature, Filesystem.src, Filesystem.user, _time span=1s
| rename Filesystem.* AS *, signature_id AS EventCode, signature AS EventDescription, file_name AS ShareName, file_path AS ShareLocalPath, file_target AS RelativeTargetName
```
