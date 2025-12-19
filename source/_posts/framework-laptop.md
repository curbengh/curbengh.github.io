---
title: Linux on Framework Laptop 13 (AMD Ryzen AI 300)
excerpt: Issues and fixes
date: 2025-12-13
updated: 2025-12-20
tags:
- linux
---

TL;DR Use Linux >= 6.17 and remove xf86-video-amdgpu package

I recently bought a new Framework Laptop 13 to replace my Lenovo Thinkpad T14 G1. I cloned my existing SSD to the new one using `pv /dev/nvme0n1 -o /dev/sdb` on a Live USB. pv is nicer to use than dd as it shows progress by default (dd does offer it through `status=progress` parameter) and I didn't have to mess around with `bs=` (block size) parameter. I didn't have to resize/enlarge the partition because both SSDs are the same size.

## GRUB error "no such cryptodisk found"

The first boot didn't went well as I encountered this GRUB error "no such cryptodisk found". Since I cloned the SSD which retained the UUID, it shouldn't due to mistyped UUID in the GRUB config.

I then booted a Live USB, mount the SSD, chroot into it and [reinstall GRUB](https://wiki.manjaro.org/index.php/GRUB/Restore_the_GRUB_Bootloader#EFI_System). After reboot, I was greeted with the usual password prompt on GRUB and I could login to XFCE just fine.

## No Wifi

After login, I noticed there was no internet connection, the network applet showed no device found. I checked the installed firmware `pacman -Qs linux-firmware` and found linux-firmware-mediatek was missing. So I grabbed one from a mirror, installed it `pacman -U linux-firmware-mediatek*`, reboot and Wifi is now functional.

## XFCE randomly freeze except mouse

I experienced XFCE random freeze/hang/unresponsive at least daily. When it happened, the whole screen just froze except for the mouse, mouse icon didn't change when I hover over text.

Initially I tried [`amdgpu.dcdebugmask=0x10`](https://gitlab.freedesktop.org/drm/amd/-/issues/4141#note_2894301) kernel parameter but that didn't work for me on Linux 6.12.61 and 6.17.11.

Then, I tried removing xf86-video-amdgpu as suggested [here](https://forum.manjaro.org/t/xfce-amd-igpu-inconsistent-graphical-crashes/182695/10), along with other "xf86-video-*" packages. That worked well, but the screen still flickers 3-4 times immediately after login, probably due to launch of xiccd and redshift.

## Failed to suspend

One night I put the laptop in suspend mode without checking the power indicator (which should be flashing slowly during sleep) then went to sleep, only to discover the next day that power indicator was off. I switched it on while charging and noticed the batter was only 2%.

I checked the logs from the last boot `journalctl -b -1` and found the culprit.

```
kernel: mt7925e 0000:c0:00.0: PM: pci_pm_suspend(): mt7925_pci_suspend [mt7925e] returns -110
kernel: mt7925e 0000:c0:00.0: PM: dpm_run_callback(): pci_pm_suspend returns -110
kernel: mt7925e 0000:c0:00.0: PM: failed to suspend async: error -110
```

mt7925e refers to the Mediatek Wifi device. A web search on the suspend issue related to the device led to [this thread](https://community.frame.work/t/framework-13-ryzen-ai-350-wont-suspend-in-linux-due-to-mt7925e/70830). Initially I installed [the workaround](https://community.frame.work/t/framework-13-ryzen-ai-350-wont-suspend-in-linux-due-to-mt7925e/70830/4) but reverted after noticing it may have been fixed in Linux 6.15.

Since Linux 6.15 was already EOL at that time, I installed Linux 6.17 instead. The laptop now suspends properly with breathing power indicator.

## "Authentication is required for suspending the system" after wake

I had had "Authentication is required for suspending the system" prompt after wake even in my previous laptop, even though either laptop could suspend just fine. I previously modified "/usr/share/polkit-1/actions/org.freedesktop.login1.policy" file to allow any user to suspend: `<allow_any>yes</allow_any>` under `<action id="org.freedesktop.login1.suspend">`. But the change does not persist across updates.

While looking through the logs, I noticed these lines:

```
polkitd: Operator of unix-session:2 FAILED to authenticate to gain authorization for action org.freedesktop.login1.suspend for system-bus-name::1.48 [xfce4-power-manager] (owned by unix-user:username)
polkitd: Operator of unix-session:2 FAILED to authenticate to gain authorization for action org.xfce.power.xfce4-pm-helper for unix-process:2196:3423 [xfce4-power-manager] (owned by unix-user:username)
```

This time another web search led me to [this thread](https://forum.xfce.org/viewtopic.php?pid=43697) and then [this post](https://stijn.tintel.eu/blog/2015/09/11/polkit-requesting-root-password-to-suspend-after-updating-version-0112-to-0113) which suggested to put custom policy in the proper place "/etc/polkit-1/rules.d/".

{% codeblock /etc/polkit-1/rules.d/85-suspend.rules %}
polkit.addRule(function(action, subject) {
    if ((action.id == "org.freedesktop.login1.suspend" ||
         action.id == "org.xfce.power.xfce4-pm-helper") &&
        subject.user == "username") {
        return polkit.Result.YES;
    }
});
{% endcodeblock %}
