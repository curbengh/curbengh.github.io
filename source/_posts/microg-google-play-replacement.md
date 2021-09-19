---
title: microG, a replacement for the proprietary Google Play Services
excerpt: The core of the Android OS is open source, but much of the core apps, libraries and APIs are proprietary.
date: 2019-01-12
updated: 2021-09-18
tags:
- android
---

[microG](https://microg.org/) is an open source re-implementation of Google Play Service/Services Framework. While the core of the Android OS is still open source, much of the core apps, libraries and APIs are proprietary. Refer to [this article](https://arstechnica.com/gadgets/2018/07/googles-iron-grip-on-android-controlling-open-source-by-any-means-necessary/) for more info.

Adding to this issue is having all the APIs packaged into a single monolithic Play Services APK. So, all the APIs are loaded at all time, even though some APIs like Cast is not going to be used 24/7. This leads to memory bloat. Despite [effort](https://arstechnica.com/gadgets/2017/09/android-8-0-oreo-thoroughly-reviewed/8/#h3) to split it into separate APKs, subsequent [updates](https://www.apkmirror.com/apk/google-inc/google-play-services/) are seldom smaller. The current version (as of writing) is [40+ MB](https://www.apkmirror.com/apk/google-inc/google-play-services/google-play-services-14-7-99-release/), while microG's implementation is merely [2.6 MB](https://microg.org/download.html).

Despite the minimal size of microG, it's actually usable if you can shift away from the Google Apps (which is the goal of microG anyway). Most of us have grown to rely on services offered by Google and moving away from them is not easy. The good news is, there are plenty of great alternatives out there.

microG requires Signature Spoofing to function on behalf of Google Play Services APK (com.google.android.gms). The best way to get signature spoofing is to use ROMs ([list](https://forum.xda-developers.com/showpost.php?p=71042083)) that have built-in support, though you could also [manually patch](https://forum.xda-developers.com/showpost.php?p=71042083) a ROM.

Once you have signature spoofing enabled, there are 2 options of installing microG:

1. Flash OTA zip ([instruction](https://forum.xda-developers.com/t/index-how-to-get-signature-spoofing-support.3557047/post-79171994)).
2. [Magisk module](https://github.com/Magisk-Modules-Repo/microG_installer).

Personally I use [microG-bundled LineageOS](https://lineage.microg.org/) as I'm already using LineageOS. It basically mirrors all the [upstream ROMs](https://download.lineageos.org/), so you can get similar updates as upstream's. There's also a [GSI ROM](https://forum.xda-developers.com/t/aosp-11-0_r40-all-in-one-microg-ufofficial-cve-august-2021-arm32-64-vndklite.4281231/) with built-in microG.

(Edit: 18 Sep 2021) I'm currently using [LineageOS GSI](https://forum.xda-developers.com/t/gsi-11-lineageos-18-x-gsi-all-archs.4205461/) in my new phone, which is not yet officially supported by LineageOS. I use a [Magisk module](https://github.com/Magisk-Modules-Repo/microG_installer) (installable via Magisk repo) to install microG, which works better for me than flashing an OTA zip. Even with vndklite (which makes system partition writeable), OTA zip installation may fails sometimes because I can't reliably switch the A/B partition (TWRP is not supported in my phone). microG's data will be wiped (due to missing app) if an installation fails; when that happens, I'll need to re-apply [this workaround](https://teddit.net/r/MicroG/comments/kuhgse/device_registration_and_push_notifications/girx53t) to get cloud messaging to work every time I update the ROM. With a Magisk module, both microG's app and data are stored in the user partition instead of system partition.

microG is not an 100% replacement of the Google Play Services, possibly will never be—it [hasn't implement](https://github.com/microg/android_packages_apps_GmsCore/wiki/Implementation-Status) all the APIs. Following are the problematic apps and their alternatives. (**Edit**: I wrote a {% post_link recommended-android-apps 'list of alternative apps' %} which includes the apps below plus some others which are not necessarily incompatible with microG.)

**App**: Play Store
**Issue**: No app or in-app purchase ([NanoDroid](http://nanolx.org/nanolx/nanodroid) claimed to support).
**Alternative**: [F-Droid](https://f-droid.org)/[Aurora Droid](https://f-droid.org/en/packages/com.aurora.adroid/) + [Aurora Store](https://f-droid.org/en/packages/com.aurora.store/)
**Info**: F-Droid is an app store for open source apps. Many of the apps I'm going to recommend can be installed through it. With [privileged extension](https://f-droid.org/en/packages/org.fdroid.fdroid.privileged.ota/) (usually installed alongside with microG), it can auto update installed apps.
I use Aurora Droid, an alternative app to access F-Droid repository. I find it easier to use and pairs well with Aurora Store.
For proprietary apps, use Aurora Store. You can use built-in credential to install free apps or use your credential to install purchased apps. Purchase apps through Play Store's [website](https://play.google.com/store). I recommend installing [Aurora Services](https://gitlab.com/AuroraOSS/AuroraServices) to enable auto-installation of downloaded apps in Aurora Droid/Store, essentially making them a privileged app.

---

**App**: Google Maps
**Issue**: ~~No location, possibly due to absence of [incomplete/outdated](https://github.com/microg/android_packages_apps_GmsCore/wiki/Implementation-Status) [Maps API](https://arstechnica.com/gadgets/2018/07/googles-iron-grip-on-android-controlling-open-source-by-any-means-necessary/4/).~~ Edit: Google Maps v10.6.2 works again on microG v0.2.6.13280
**Alternative**: [Organic Maps](https://f-droid.org/en/packages/app.organicmaps/), [OsmAnd](https://f-droid.org/en/packages/net.osmand.plus/), HERE WeGo
**Info**: HERE WeGo supports public transit and offline maps. Despite [being funded](https://web.archive.org/web/20150816051912/http://company.nokia.com/en/news/press-releases/2015/08/03/nokia-completes-next-stage-of-transformation-with-agreement-to-sell-here-to-automotive-industry-consortium-at-an-enterprise-value-of-eur-28-billion#) by the Germany big 3 autos, the app looks dated and not as smooth as Google and iOS Maps. Organic Maps and OsmAnd are open source and utilise [OpenStreetMap](https://www.openstreetmap.org/). They do not have public transport info though. Use [**Transportr**](https://f-droid.org/en/packages/de.grobox.liberario/) for that. Organic Maps is a fork of MAPS.ME without the proprietary bits and it's available on F-Droid.

---

**App**: Google Calendar
**Issue**: Crash on boot. Depends on the proprietary GoogleCalendarSyncAdapter.apk. Possibly due to incomplete [Account Authentication API](https://github.com/microg/android_packages_apps_GmsCore/wiki/Implementation-Status).
**Alternative**: [Simple Calendar](https://github.com/SimpleMobileTools/Simple-Calendar) + [DAVx⁵](https://gitlab.com/bitfireAT/davx5-ose)
**Info**: It's still problematic even with GoogleCalendarSyncAdapter.apk installed. Google Account is not well-supported in microG. While you can use DAVx⁵ to sync calendar events in Google Account, it's a hit-or-miss and reminders are not supported. This is due to the [lack](https://forums.bitfire.at/post/9235) of OAuth 2.0 support in DAVx⁵. Alternatively, you can migrate your data to free email providers that supports CalDAV/CardDav, i.e. [Disroot](https://disroot.org/en) (using [Nextcloud](https://www.davx5.com/tested-with/nextcloud)), [GMX](https://www.davx5.com/tested-with/gmx) and [Yandex](https://www.davx5.com/tested-with/yandex).

---

**App**. Google Contacts
**Issue**: Depends on the proprietary GoogleContactsSyncAdapter.apk
**Alternative**: [Simple Contacts](https://github.com/SimpleMobileTools/Simple-Contacts) + DAVx⁵
**Info**: Email providers mentioned in Google Calendar section can sync contacts using CardDAV.

---

**App**. Google Pay
**Issue**: Failed SafetyNet
**Alternative**: [Catima](https://f-droid.org/en/packages/me.hackerchick.catima/), [Loyalty Card Keychain](https://f-droid.org/packages/protect.card_locker/)
**Info**: SafetyNet can be bypassed through 1) DroidGuard Helper (available from microG's F-Droid [repo](https://microg.org/download.html), install as a system app) or 2) [Magisk Module](https://magiskroot.net/bypass-safetynet-issue-cts/).

---

**App**. Whatsapp, Facebook Messenger and other chatting apps
**Issue**: A delay in receiving message
**Info**: Enable "Google Cloud Messaging" in microG Settings and allow relevant apps to register.
