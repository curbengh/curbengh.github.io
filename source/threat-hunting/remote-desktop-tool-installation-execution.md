---
title: Remote Desktop tool installation/execution
layout: page
date: 2025-07-27
updated: 2025-08-03
---

Description: Remote desktop software commonly abused by threat actor to deploy ransomware.
References: [1](https://thedfirreport.com/2024/06/10/icedid-brings-screenconnect-and-csharp-streamer-to-alphv-ransomware-deployment/#execution), [2](https://redcanary.com/blog/threat-intelligence/intelligence-insights-june-2024/), [3](https://blog.talosintelligence.com/lilacsquid/), [4](https://thedfirreport.com/2024/08/12/threat-actors-toolkit-leveraging-sliver-poshc2-batch-scripts/#c18), [5](https://arcticwolf.com/resources/blog/arctic-wolf-observes-campaign-exploiting-simplehelp-rmm-software-for-initial-access/), [6](https://blog.talosintelligence.com/talos-ir-trends-q4-2024/), [7](https://www.security.com/threat-intelligence/ransomhub-betruger-backdoor), [Ekran/Syteca](https://www.security.com/threat-intelligence/fog-ransomware-attack), [Classroom Spy](https://unit42.paloaltonetworks.com/cybercriminals-attack-financial-sector-across-africa/), [AnyViewer/JumpConnect/TinyPilot](https://www.microsoft.com/en-us/security/blog/2025/06/30/jasper-sleet-north-korean-remote-it-workers-evolving-tactics-to-infiltrate-organizations/#defense-evasion-and-persistence), [OptiTune](https://blog.talosintelligence.com/new-chaos-ransomware/#persistence)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Endpoint.Processes WHERE index="windows" Processes.process IN ("*ScreenConnect*", "*NetSupport*", "*TeamViewer*", "*AnyDesk*", "*MeshAgent*", "*Splashtop*", "*AteraAgent*", "*LogMeIn*", "*RustDesk*", "*ToDesk*", "*SimpleHelp*", "*Netop*", "*Impero*", "*RealVNC*", "*Dameware*", "*TightVNC*", ""*UltraViewer*", "*Ekran*", "*Syteca*", "*ClassroomSpy*", "*JumpConnect*", "*TinyPilot*", "*AnyViewer*", "*OptiTune*") BY index, host, Processes.signature_id, Processes.signature, Processes.parent_process, Processes.process, Processes.user, _time span=1s
| rename Processes.* AS *, signature_id AS EventCode, signature AS EventDescription
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| lookup ad_users sAMAccountName AS user OUTPUT displayName AS Name, mail AS Email
| table Time, index, host, EventCode, EventDescription, parent_process, process, user, Name, Email
```
