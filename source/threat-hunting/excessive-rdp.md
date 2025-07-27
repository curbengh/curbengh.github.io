---
title: Excessive RDP
layout: page
date: 2025-07-27
---

Description: Alert when a user+host RDP to at least 5 targets.
Refernces: [1](https://thedfirreport.com/2025/02/24/confluence-exploit-leads-to-lockbit-ransomware/#lateral-movement)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.signature_id=4688 Processes.process_name="mstsc.exe" BY index, host, Processes.signature_id, Processes.signature, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *
| dedup host, process, user
| eval rdp_time="[".strftime(_time, "%H:%M")."] ".process
| table host, user, rdp_time
| mvcombine rdp_time
| eval RDPs=mvjoin(mvsort(rdp_time), "^"), counts=mvcount(rdp_time)
| where counts>=5
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name
| sort host, user
| table host, user, Name, RDPs
```display multivalue separated by newline```
| makemv delim="^" RDPs
```
