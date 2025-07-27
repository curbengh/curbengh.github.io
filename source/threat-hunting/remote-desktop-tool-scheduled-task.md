---
title: Remote Desktop tool scheduled task
layout: page
date: 2025-07-27
---

Description: Remote desktop software commonly abused by threat actor to deploy ransomware.
References: [1](https://thedfirreport.com/2024/06/10/icedid-brings-screenconnect-and-csharp-streamer-to-alphv-ransomware-deployment/#persistence), [2](https://redcanary.com/blog/threat-intelligence/intelligence-insights-june-2024/), [3](https://blog.talosintelligence.com/lilacsquid/), [4](https://redcanary.com/blog/threat-intelligence/scarlet-goldfinch/), [Ekran/Syteca](https://www.security.com/threat-intelligence/fog-ransomware-attack), [Classroom Spy](https://unit42.paloaltonetworks.com/cybercriminals-attack-financial-sector-across-africa/)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true count FROM datamodel=Change.All_Changes WHERE index="windows" All_Changes.result_id=4698 All_Changes.object_attrs IN ("*ScreenConnect*", "*NetSupport*", "*TeamViewer*", "*AnyDesk*", "*MeshAgent*", "*Splashtop*", "*AteraAgent*", "*LogMeIn*", "*RustDesk*", "*ToDesk*", "*SimpleHelp*", "*Netop*", "*Impero*", "*RealVNC*", "*Dameware*", "*TightVNC*", ""*UltraViewer*", "*Ekran*", "*Syteca*", "*ClassroomSpy*") BY host, All_Changes.command, All_Changes.object, All_Changes.object_attrs, All_Changes.result, All_Changes.result_id, All_Changes.user, _time span=1s
| rename All_Changes.* AS *, object AS TaskName, result AS EventDescription, result_id AS EventCode, object_attrs AS TaskAttributes
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, host, TaskName, command, EventCode, EventDescription, user, TaskAttributes
```
