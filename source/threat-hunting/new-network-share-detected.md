---
title: New Network Share detected
layout: page
date: 2025-07-27
---

Description: Requires additional data model [mapping](https://gitlab.com/curben/splunk-scripts/-/commit/cc3e156a75519dbb3a23e0fb833c87b46c0b9409).
References: [1](https://thedfirreport.com/2025/03/31/fake-zoom-ends-in-blacksuit-ransomware/#impact)
SPL:

```spl
| tstats summariesonly=true allow_old_summaries=true fillnull_value="unknown" count FROM datamodel=Endpoint.Filesystem WHERE index="windows" Filesystem.signature_id=5142 BY index, host, Filesystem.file_target, Filesystem.file_name, Filesystem.file_path, Filesystem.signature_id, Filesystem.signature, Filesystem.src, Filesystem.user, _time span=1s
| rename Filesystem.* AS *, signature_id AS EventCode, signature AS EventDescription, file_name AS ShareName, file_path AS ShareLocalPath, file_target AS RelativeTargetName
```
