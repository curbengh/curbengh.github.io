---
title: Remote Desktop tool scheduled task
layout: page
date: 2025-07-27
updated: 2025-12-16
---

Description: Remote desktop software commonly abused by threat actor to deploy ransomware.
References: [1](https://thedfirreport.com/2024/06/10/icedid-brings-screenconnect-and-csharp-streamer-to-alphv-ransomware-deployment/#persistence), [2](https://redcanary.com/blog/threat-intelligence/intelligence-insights-june-2024/), [3](https://blog.talosintelligence.com/lilacsquid/), [4](https://redcanary.com/blog/threat-intelligence/scarlet-goldfinch/), [Ekran/Syteca](https://www.security.com/threat-intelligence/fog-ransomware-attack), [Classroom Spy](https://unit42.paloaltonetworks.com/cybercriminals-attack-financial-sector-across-africa/), [AnyViewer/JumpConnect/TinyPilot](https://www.microsoft.com/en-us/security/blog/2025/06/30/jasper-sleet-north-korean-remote-it-workers-evolving-tactics-to-infiltrate-organizations/#defense-evasion-and-persistence), [OptiTune](https://blog.talosintelligence.com/new-chaos-ransomware/#persistence), [PDQ](https://thedfirreport.com/2025/02/24/confluence-exploit-leads-to-lockbit-ransomware/#impact), [ITarian](https://redcanary.com/blog/threat-intelligence/phishing-rmm-tools/), [AWRC/Atelier](https://cloud.google.com/blog/topics/threat-intelligence/analysis-of-unc1549-ttps-targeting-aerospace-defense)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Change.All_Changes WHERE index="windows" All_Changes.result_id=4698 All_Changes.object_attrs IN ("*ScreenConnect*", "*NetSupport*", "*TeamViewer*", "*AnyDesk*", "*MeshAgent*", "*Splashtop*", "*AteraAgent*", "*LogMeIn*", "*RustDesk*", "*ToDesk*", "*SimpleHelp*", "*Netop*", "*Impero*", "*RealVNC*", "*Dameware*", "*TightVNC*", ""*UltraViewer*", "*Ekran*", "*Syteca*", "*ClassroomSpy*", "*JumpConnect*", "*TinyPilot*", "*AnyViewer*", "*OptiTune*", "*PDQ*", "*ITarian*", "*AWRC*", "*Atelier*", "*FleetDeck*") BY host, All_Changes.command, All_Changes.object, All_Changes.object_attrs, All_Changes.result, All_Changes.result_id, All_Changes.user, _time span=1s
| rename All_Changes.* AS *, object AS TaskName, result AS EventDescription, result_id AS EventCode, object_attrs AS TaskAttributes
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, host, TaskName, command, EventCode, EventDescription, user, TaskAttributes
```
