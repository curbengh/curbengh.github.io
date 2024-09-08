---
title: Short Posts
layout: page
date: 2024-07-15
updated: 2024-09-08
---

## 8 Sep 2024

After converting from CentOS 9 to AlmaLinux 9, uninstall CentOS kernels (> kernel-5.14.0-427.x). Otherwise, the higher version of CentOS kernels (5.14.0-x) will prevent dnf from installing newer Alma kernels (5.14.0-427.x).

## 23 Aug 2024

Huawei USB 4G modem E3372h-608 firmware 10.0.5.1 works out-of-the-box as a tethering connection with GL.iNet Creta AR750 firmware 4.3.17 running OpenWrt 22.03.4 r20123-38ccc47687.

## 22 Jul 2024

In OpenAI ChatGPT, it is now possible to disable [model training](https://help.openai.com/en/articles/7730893-data-controls-faq) while still keeping the chat history. [Previously](https://openai.com/index/new-ways-to-manage-your-data-in-chatgpt/), both had to be disabled together.

## 18 Jul 2024

At least 30% of `PUT` traffic in a Cloudtrail bucket is still TLS 1.2. Don't set [`minimum_tls_version=1.3`](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_s3/Bucket.html) on that bucket yet.

## 16 Jul 2024

If a scheduled task has been failing for a while and no one bats an eye, just disable it.

## 15 Jul 2024

If sssd unable to starts after upgrade/downgrade, clear its cache by deleting all files in the "/var/lib/sss/db/" folder. Encountered [this issue](https://bugzilla.redhat.com/show_bug.cgi?id=1576597) when upgrading/switching AlmaLinux 8 and CentOS Stream 9 to AlmaLinux 9.
