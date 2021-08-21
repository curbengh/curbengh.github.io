---
title: Using AWS Config to query security compliance of resources on organisation-level
excerpt: Query across all accounts and regions of an organisation
date: 2021-08-15
tags:
- aws
- security
- aws-config
---

> How do I check the patch level of my EC2 instances?

AWS Config is introduced as the answer to the above question, in addition to other compliance requirements. This feature enables a security analyst to query across all accounts (of an organisation) and regions through a single interface. Prior to this feature, you would use [SSM](https://aws.amazon.com/systems-manager/) to query each and every account and region, which is not efficient.

It includes a comprehensive list of AWS-managed rules, which should meet most compliance requirements, though you can also create a [custom rule](https://docs.aws.amazon.com/config/latest/developerguide/evaluate-config_develop-rules.html) using a Lambda function. Depending on a company's industry and regulatory requirements, you could also utilise [Conformance Pack](https://docs.aws.amazon.com/config/latest/developerguide/conformancepack-sample-templates.html) which is a set of AWS-managed rules designed to meet certain requirement, e.g. FDA, HIPAA, NIST, PCI DSS.

Compliance report is downloaded using SQL statement. There are two scopes to choose from: either a chosen combination of account and region or organisation level (also known as Configuration Aggregator). To query resource compliance, use `AWS::Config::ResourceCompliance` resource type. There are many examples included in the Console, you could also run a custom SQL statement using [Advanced Query](https://docs.aws.amazon.com/config/latest/developerguide/querying-AWS-resources.html).

In addition to resource compliance, you can also use it to build inventories. For example, you can use `AWS::EC2::Instance` resource type to list all EC2 instances. So, it can functions as a compliance tool and also an inventory tool.

A major limitation (as listed in the [docs](https://docs.aws.amazon.com/config/latest/developerguide/querying-AWS-resources.html#query-limitations)) is that you cannot query compliant-only (or non-compliant-only) resources of a compliance rule, e.g. `AND` operator may return result of `OR` instead.

To get the actual result, you still need some post-processing to filter out irrelevant entries. I wrote a script to list all enabled rules in an organisation ([aws-config-rules.py](https://gitlab.com/curben/aws-scripts/-/blob/main/aws-config-rules.py)) and another script to query the output of some of those rules ([aws-config.py](https://gitlab.com/curben/aws-scripts/-/blob/main/aws-config.py)).
