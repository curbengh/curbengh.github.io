---
title: WinRAR Spawning Shell Application
layout: page
date: 2025-07-27
---

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