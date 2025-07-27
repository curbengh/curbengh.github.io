---
title: Splunk Events Deletion
layout: page
date: 2025-07-27
---

Description: Detect deletion of Splunk events
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="(null)" count FROM datamodel=Splunk_Audit.Search_Activity WHERE index=_audit Search_Activity.search!="*index=test*" Search_Activity.app!="itsi" BY Search_Activity.info, Search_Activity.user, Search_Activity.search, Search_Activity.search_type, Search_Activity.savedsearch_name, Search_Activity.app, _time span=1s
| rename Search_Activity.* AS *
| regex search="\|\s*delete"
| eval Time=strftime(_time,"%Y-%m-%d %H:%M:%S %z")
| table Time, info, user, search_type, savedsearch_name, app, search
```
