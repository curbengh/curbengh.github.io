---
title: LoLBin execution
layout: page
date: 2025-07-27
updated: 2026-02-07
---

References: [bitsadmin.exe](https://redcanary.com/blog/threat-intelligence/intelligence-insights-june-2024/), [cdb.exe](https://www.elastic.co/security-labs/fragile-web-ref7707), [cdb.exe](https://lolbas-project.github.io/lolbas/OtherMSBinaries/Cdb/), [cipher.exe](https://blog.talosintelligence.com/fake-ai-tool-installers/#cyberlock-the-powershell-ransomware),  [dsget.exe/dsquery.exe](https://blog.talosintelligence.com/uat-8837/#active-directory-reconnaissance), [finger.exe](https://www.huntress.com/blog/malicious-browser-extention-crashfix-kongtuke), [nltest.exe](https://blog.talosintelligence.com/when-legitimate-tools-go-rogue/), [rawcopy.exe](https://securelist.com/apt41-in-africa/116986/#rawcopy), [setspn.exe](https://redcanary.com/blog/threat-intelligence/mocha-manakin-nodejs-backdoor/), [SystemSettingsAdminFlows.exe](https://blog.talosintelligence.com/byovd-loader-deadlock-ransomware/#impair-defenses), [UevAppMonitor.exe](https://www.welivesecurity.com/en/eset-research/longnosedgoblin-tries-sniff-out-governmental-affairs-southeast-asia-japan/#nosing-around-longnosedgoblins-toolset), winrs.exe [[1]](https://www.elastic.co/security-labs/fragile-web-ref7707) [[2]](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/winrs), winsw.exe [[1]](https://www.sentinelone.com/labs/operation-digital-eye-chinese-apt-compromises-critical-digital-infrastructure-via-visual-studio-code-tunnels/) [[2]](https://github.com/winsw/winsw)

SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process_name IN ("bitsadmin.exe", "cdb.exe", "cipher.exe", "dsget.exe", "dsquery.exe", "finger.exe", "nltest.exe", "rawcopy.exe", "SystemSettingsAdminFlows.exe", "setspn.exe", "UevAppMonitor.exe", "winsw.exe", "winrs.exe", "winrshost.exe") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
```
