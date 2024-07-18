---
title: Short Posts
layout: page
date: 2024-07-15
updated: 2024-07-18
---

## 18 Jul 2024

At least 30% of `PUT` traffic in a Cloudtrail bucket is still TLS 1.2. Don't set [`minimum_tls_version=1.3`](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_s3/Bucket.html) on that bucket yet.

## 16 Jul 2024

If a scheduled task has been failing for a while and no one bats an eye, just disable it.

## 15 Jul 2024

If sssd unable to starts after upgrade/downgrade, clear its cache by deleting all files in the "/var/lib/sss/db/" folder. Encountered [this issue](https://bugzilla.redhat.com/show_bug.cgi?id=1576597) when upgrading/switching AlmaLinux 8 and CentOS Stream 9 to AlmaLinux 9.
