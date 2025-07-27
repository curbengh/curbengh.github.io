---
title: AWS AssumeRoot API operation
layout: page
date: 2025-07-27
---

Description: Grant root-level privileges in a member account to a privileged user in the management account.
References: [1](https://www.elastic.co/security-labs/exploring-aws-sts-assumeroot)
SPL:

```spl
index="aws" sourcetype="aws:cloudtrail" eventSource="sts.amazonaws.com" eventName="AssumeRoot"
| eval Time=strftime(_time,"%Y-%m-%d %H:%M:%S %z")
| table Time, region, requestParameters.roleArn, sourceIPAddress, userAgent, userIdentity.invokedBy, userIdentity.type
```
