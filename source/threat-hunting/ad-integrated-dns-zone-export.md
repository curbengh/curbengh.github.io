---
title: AD integrated DNS zone export
layout: page
date: 2025-08-09
---

References: [1](https://thedfirreport.com/2025/08/05/from-bing-search-to-ransomware-bumblebee-and-adaptixc2-deliver-akira/)
SPL:

```spl
index="windows" source IN ("XmlWinEventLog:Microsoft-Windows-PowerShell/Operational", "XmlWinEventLog:PowerShellCore/Operational") EventCode=4104 ScriptBlockText="*export-dnsserverzone*" ScriptBlockText="*_msdcs*"
```
