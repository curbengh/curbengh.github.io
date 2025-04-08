---
title: CentOS Stream does not support dnf-automatic security updates
excerpt: The repository lacks updateinfo to provide errata
date: 2024-07-15
updated: 2025-04-08
tags:
  - centos
---

If you have configured dnf-automatic to only apply security updates on CentOS Stream, it **will not** install any updates.

```plain /etc/dnf/automatic.conf
[commands]
upgrade_type = security
```

## Background

I discovered this limitation when attempting to patch openssh against CVE-2024-6387 (regreSSHion). Here's a brief timeline of patch availability on CentOS Stream 9:

- 1 Jul 2024: CVE-2024-6387 made public
- 3 Jul 2024: Patch available for RHEL 9 through [openssh-8.7p1-38.el9_4.1](https://access.redhat.com/errata/RHSA-2024:4312).
- 4 Jul 2024: CentOS Stream 9 merged [the patch](https://gitlab.com/redhat/centos-stream/rpms/openssh/-/merge_requests/78)
- 8 Jul 2024: Patch available through [openssh-8.7p1-42.el9](https://mirror.stream.centos.org/9-stream/BaseOS/x86_64/os/Packages/)

While waiting for the patch availability, I enabled dnf-automatic and configured it to apply security updates only. When the patch `openssh-8.7p1-42.el9` was finally available, I checked whether it has been applied using `dnf info openssh`. It showed the installed version is still 8.7p1-**41** and 8.7p1-**42** is available. That did not look good. Did I forgot to enable dnf-automatic? `systemctl status dnf-automatic.timer` showed it is enabled. Did it trigger dnf-automatic.service?

```plain journalctl -r -u dnf-automatic.service
Jul 9 06:15:03 localhost dnf-automatic[12345]: No security updates needed, but 3 updates available
```

Not only dnf-automatic did not install 8.7p1-42, it also did not see the version as a security update. Before I went on to search for answer, I applied the patch first `dnf upgrade openssh`.

## updateinfo.xml

RedHat [documentation](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html-single/managing_and_monitoring_security_updates/index#displaying-security-updates-that-are-installed-on-a-host_identifying-security-updates) mentions installed security updates can be listed through `dnf updateinfo list security --installed`, however it returned empty on CentOS Stream 9. To check if the command actually works, I ran it on an AlmaLinux box and it returned similar output as the RedHat documentation.

I then learned that dnf depends on [_errata_](https://forums.rockylinux.org/t/dnf-security-updates/8327) to be able to detect whether a package version is a security update. From [this post](https://www.caseylabs.com/centos-automatic-security-updates-do-not-work/) ([archived](https://web.archive.org/web/20211011104926/https://www.caseylabs.com/centos-automatic-security-updates-do-not-work/)), I discovered errata is published on the repository in the form of updateinfo.xml, which is related to `dnf updateinfo`.

When dnf is refreshing metadata, the first thing it looks for is [/repodata/repomd.xml](https://mirror.stream.centos.org/9-stream/BaseOS/x86_64/os/repodata/repomd.xml). So, I tried to look for updateinfo.xml in [/repodata/](https://mirror.stream.centos.org/9-stream/BaseOS/x86_64/os/repodata/) but could not find it. This explained the empty output of `dnf updateinfo`. Then, I searched for it in [AlmaLinux](https://repo.almalinux.org/almalinux/9/BaseOS/x86_64/os/repodata/) and found `{sha256sum-hash}-updateinfo.xml.gz`. Since the content is updated constantly, how does dnf know which updateinfo.xml to grab? I opened up the [repomd.xml](https://repo.almalinux.org/almalinux/9/BaseOS/x86_64/os/repodata/repomd.xml) and noticed

```xml
  <data type="updateinfo">
    <location href="repodata/{sha256sum-hash}-updateinfo.xml.gz"/>
  </data>
```

I also searched and discovered updateinfo is also available on [Rocky Linux](https://download.rockylinux.org/pub/rocky/9/BaseOS/x86_64/os/repodata/), [Oracle Linux](https://yum.oracle.com/repo/OracleLinux/OL9/baseos/latest/x86_64/repodata/) and [Fedora](https://dl.fedoraproject.org/pub/fedora/linux/updates/40/Everything/x86_64/repodata/). Looking at Fedora's [repomd.xml](https://dl.fedoraproject.org/pub/fedora/linux/updates/40/Everything/x86_64/repodata/repomd.xml), I learned that the updateinfo.xml can be available in gzip, xzip and zchunk (`updateinfo_zck`) formats. Without updateinfo.xml, CentOS Stream could not discern between security and [bugfix/feature](https://access.redhat.com/articles/explaining_redhat_errata) updates.

CentOS used to have updateinfo prior to CentOS 7; after it was removed in CentOS 7, there was a [third-party repository](https://updateinfo.cefs.steve-meier.de/) that filled the gap but it never supported CentOS Stream.

## Enable automatic updates

Automatic updates only works in CentOS Stream with this config which installs _all_ available updates, regardless of security/bugfix/feature:

```plain /etc/dnf/automatic.conf
[commands]
upgrade_type = default
apply_updates = yes
```

Automatic security-only updates are available on RHEL, AlmaLinux, Rocky Linux, Oracle Linux and Fedora. Fedora's updateinfo does not include a CVE reference (e.g. `<reference href="https://access.redhat.com/security/cve/CVE-2024-6387" id="CVE-2024-6387" type="cve" title="CVE-2024-6387"/>`), thus unable to [filter](https://docs.oracle.com/en/learn/ol-dnf-security/#filter-the-list-of-security-updates) by CVE ID (`dnf updateinfo list --cve CVE-2024-6387 --installed`).

## Unattended upgrades in Debian/Ubuntu

Automatic updates is provided by the [`unattended-upgrades`](https://pkgs.org/download/unattended-upgrades) package which is installed by default, but not enabled. It can be configured through "/etc/apt/apt.conf.d/50unattended-upgrades".

```plain /etc/apt/apt.conf.d/50unattended-upgrades
Unattended-Upgrade::Allowed-Origins {
	"${distro_id}:${distro_codename}";
	"${distro_id}:${distro_codename}-security";
};
```

Each allowed origin refers to a [distribution/component](https://manpages.debian.org/bookworm/apt/sources.list.5.en.html#THE_DEB_AND_DEB-SRC_TYPES:_GENERAL_FORMAT); in Ubuntu 24.04, those two lines refer to [`24.04:noble`](https://mirrors.edge.kernel.org/ubuntu/dists/noble/) and [`24.04:noble-security`](https://mirrors.edge.kernel.org/ubuntu/dists/noble-security/). The default config effectively applies security updates only, though it is not obvious at first. `noble` is the base repository of Ubuntu 24.04 once it reached general availability. Security updates are available in `noble-security` while bugfix updates are available in `noble-updates` instead.

In Debian, the config is different.

```plain /etc/apt/apt.conf.d/50unattended-upgrades
Unattended-Upgrade::Allowed-Origins {
  "origin=Debian,codename=${distro_codename},label=Debian";
  "origin=Debian,codename=${distro_codename},label=Debian-Security";
};
```

Security updates are published to a different uri [`debian-security`](https://archive.debian.org/debian-security/) instead of the primary uri [`debian`](https://archive.debian.org/debian/). A notable implication is that not every [Debian mirror](https://www.debian.org/mirror/list) mirrors `debian-security`.

To enable unattended upgrades, `dpkg-reconfigure --priority=low unattended-upgrades` then select yes. Or in a script with:

```sh
echo "unattended-upgrades unattended-upgrades/enable_auto_updates boolean true" | debconf-set-selections
dpkg-reconfigure -f noninteractive unattended-upgrades
```

To verify, "/etc/apt/apt.conf.d/20auto-upgrades" should have

```plain
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```
