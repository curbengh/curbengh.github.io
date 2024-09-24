---
title: Short Posts
layout: page
date: 2024-07-15
updated: 2024-09-24
---

## 24 Sep 2024

In Splunk Connect for Syslog ([SC4S](https://splunk.github.io/splunk-connect-for-syslog/main/)), [`SC4S_DEST_GLOBAL_ALTERNATES`](https://splunk.github.io/splunk-connect-for-syslog/1.110.1/configuration/#configuration-of-alternate-destinations) has been deprecated since version 2. Instead, enable [`SC4S_ARCHIVE_GLOBAL`](https://splunk.github.io/splunk-connect-for-syslog/3.30.1/configuration/#archive-file-configuration) which stores a copy of events locally, not only for archiving (if that's what you intend) but also useful for troubleshooting dropped events.

If [`compliance_meta_by_source.conf`](https://splunk.github.io/splunk-connect-for-syslog/3.30.1/configuration/#override-index-or-metadata-based-on-host-ip-or-subnet-compliance-overrides) is not working, you may have to create a [custom post-filter](https://splunk.github.io/splunk-connect-for-syslog/3.30.1/create-parser/#create-a-parser_1) in "/opt/sc4s/local/config/filters/" instead.

## 15 Sep 2024

If you are using any of these [removable eSIMs](https://euicc-manual.osmocom.org/docs/lpa/known-card/#product), when adding a new profile, check the SM-DP+ address has `81370f5125d0b1d408d4c3b232e6d25e795bebfb` (GSM Association - RSP2 Root CI1) as one of its issuer(s) in the [registry.csv](https://github.com/CursedHardware/gsma-rsp-certificates/blob/main/registry.csv) and does not contain an [ARA-M applet](https://osmocom.org/projects/sim-card-related/wiki/ESIM_profile_database) (which [complicates things](https://sysmocom.de/manuals/sysmoeuicc-manual.pdf) p. 26).

## 8 Sep 2024

After converting from CentOS to AlmaLinux, uninstall CentOS kernels which would otherwise prevent dnf from installing newer Alma kernel due to higher version of CentOS kernel.

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
