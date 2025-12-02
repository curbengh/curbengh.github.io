---
title: Veeam backup job deleted
layout: page
date: 2025-12-02
---

References: [1](https://thedfirreport.com/2025/11/17/cats-got-your-files-lynx-ransomware/#impact), [2](https://helpcenter.veeam.com/docs/vbr/events/event_23090.html?ver=13)
SPL:

```spl
index="windows" source="XmlWinEventLog:Veeam-Backup" EventID="23090"
```
