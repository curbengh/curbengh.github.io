---
title: UAC Change
layout: page
date: 2025-11-30
---

References: [1](https://www.elastic.co/security-labs/roningloader#batch-scripts-to-bypass-uac-and-av-networking)
SPL:

```spl
index="windows" source IN ("XmlWinEventLog:Microsoft-Windows-PowerShell/Operational", "XmlWinEventLog:PowerShellCore/Operational") EventCode=4104 ScriptBlockText="*EnableLUA*"
```
