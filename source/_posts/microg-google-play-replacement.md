---
title: microG, a replacement for the proprietary Google Play Services
date: 2019-01-12 00:00:00
lastUpdated: 2019-01-13 00:00:00
tags:
---

[microG](https://microg.org/) is an open source re-implementation of Google Play Service/Services Framework. While the core of the Android OS is still open source, much of the core apps, libraries and APIs are proprietary. Refer to [this article](https://arstechnica.com/gadgets/2018/07/googles-iron-grip-on-android-controlling-open-source-by-any-means-necessary/) for more info.

<!-- more -->

Adding to this issue is having all the APIs packaged into a single monolithic Play Services APK. So, all the APIs are loaded at all time, even though some APIs like Cast is not going to be used 24/7. This leads to memory bloat. Despite [effort](https://arstechnica.com/gadgets/2017/09/android-8-0-oreo-thoroughly-reviewed/8/#h3) to split it into separate APKs, subsequent [updates](https://www.apkmirror.com/apk/google-inc/google-play-services/) are seldom smaller. The current version (as of writing) is [40+ MB](https://www.apkmirror.com/apk/google-inc/google-play-services/google-play-services-14-7-99-release/), while microG's implementation is merely [2.6 MB](https://microg.org/download.html).

Despite the minimal size of microG, it's actually usable if you can shift away from the Google Apps (which is the goal of microG anyway). Most of us have grown to rely on services offered by Google and moving away from them is not easy. The good news is, there are pretty good alternatives out there.

microG requires Signature Spoofing to function on behalf of Google Play Services APK (com.google.android.gms). As summarised by lee.wp14 in this [XDA thread](https://forum.xda-developers.com/showpost.php?p=71042083), there are 3 options to install microG:

1. FakeGApps Xposed Module ([Xposed Repo](https://repo.xposed.info/module/com.thermatk.android.xf.fakegapps), [GitHub](https://github.com/thermatk/FakeGApps))
2. /system Patch ([NanoDroid](https://gitlab.com/Nanolx/NanoDroid), [Haystack](https://github.com/Lanchon/haystack), [Tingle](https://github.com/ale5000-git/tingle))
3. Custom ROMs. See the thread for a list of supported ROMs and more info on the above options.

Personally I use [microG-bundled LineageOS](https://lineage.microg.org/) as I'm already using LineageOS. It basically mirrors all the [upstream ROMs](https://download.lineageos.org/), so you can get similar updates as upstream's.

microG is not 100% replacement of Google Play Services, possibly will never be—it [hasn't implement](https://github.com/microg/android_packages_apps_GmsCore/wiki/Implementation-Status) all the APIs. Following are the problematic apps and their alternatives. (**Edit**: I wrote a {% post_link recommended-android-apps 'list of alternative apps' %} including the apps below plus some others which are not necessarily incompatible with microG.)

**App**: Play Store<br/>
**Issue**: No app or in-app purchase ([NanoDroid](http://nanolx.org/nanolx/nanodroid) claimed to support).<br/>
**Alternative**: F-Droid + Yalp Store<br/>
**Info**: F-Droid is an app store for open source apps. Many of the apps I'm going to recommend can be installed through it. With [privileged extension](https://f-droid.org/en/packages/org.fdroid.fdroid.privileged.ota/) (usually installed alongside with microG), it can auto update installed apps.<br/>
For proprietary apps, use Yalp Store. You can use built-in credential to install free apps or use your credential to install purchased apps. Purchase apps through Play Store's [website](https://play.google.com/store). I recommend installing it as a system app (flash the [OTA.zip](https://github.com/yeriomin/YalpStore/releases) in recovery) to automatically install once an APK is downloaded. Root is required for auto-download updates. Go to the Yalp setting, set "*Only the chosen apps will be checked for updates*" and whitelist any apps you installed via F-Droid.

---

**App**: Google Maps<br/>
**Issue**: No location, possibly due to absence of [incomplete/outdated](https://github.com/microg/android_packages_apps_GmsCore/wiki/Implementation-Status) [Maps API](https://arstechnica.com/gadgets/2018/07/googles-iron-grip-on-android-controlling-open-source-by-any-means-necessary/4/).<br/>
**Alternative**: HERE WeGo, OsmAnd, MAPS.ME<br/>
**Info**: HERE WeGo supports public transit. Despite [being funded](https://web.archive.org/web/20150816051912/http://company.nokia.com/en/news/press-releases/2015/08/03/nokia-completes-next-stage-of-transformation-with-agreement-to-sell-here-to-automotive-industry-consortium-at-an-enterprise-value-of-eur-28-billion#) by the Germany big 3 autos, the app looks dated and not as smooth as Google and iOS Maps. OsmAnd and MAPS.ME are open source and utilise [OpenStreetMap](https://www.openstreetmap.org/), but doesn't support public transit (AFAIK).<br/>

---

**App**: Google Calendar<br/>
**Issue**: Crash on boot. Depends on proprietary GoogleCalendarSyncAdapter.apk. Possibly due to incomplete [Account Authentication API](https://github.com/microg/android_packages_apps_GmsCore/wiki/Implementation-Status).<br/>
**Alternative**: [Simple Calendar](https://github.com/SimpleMobileTools/Simple-Calendar) + [DAVx⁵](https://gitlab.com/bitfireAT/davx5-ose)<br/>
**Info**: It's still problematic even with GoogleCalendarSyncAdapter.apk installed. Google Account is not well-supported in microG. While you can use DAVx⁵ to sync calendar events in Google Account, it's a hit-or-miss and reminders are not supported. This is due to the [lack](https://forums.bitfire.at/post/9235) of OAuth 2.0 support in DAVx⁵. Alternatively, you can migrate your data to free email providers that supports CalDAV/CardDav, i.e. [Disroot](https://disroot.org/en) (using [Nextcloud](https://www.davx5.com/tested-with/nextcloud)), [GMX](https://www.davx5.com/tested-with/gmx) and [Yandex](https://www.davx5.com/tested-with/yandex).

---

**App**. Google Contacts<br/>
**Issue**: Depends on proprietary GoogleContactsSyncAdapter.apk<br/>
**Alternative**: [Simple Contacts](https://github.com/SimpleMobileTools/Simple-Contacts) + DAVx⁵<br/>
**Info**: Email providers mentioned in Google Calendar section can sync contacts using CardDAV.

---

**App**. Google Pay<br/>
**Issue**: Failed SafetyNet<br/>
**Alternative**: [Loyalty Card Keychain](https://f-droid.org/packages/protect.card_locker/) (for loyalty cards only)<br/>
**Info**: SafetyNet can be bypassed through 1) DroidGuard Helper (available from microG's F-Droid [repo](https://microg.org/download.html), install as a system app) or 2) [Magisk Module](https://magiskroot.net/bypass-safetynet-issue-cts/).

---

**App**. Whatsapp, Facebook Messenger and other chatting apps<br/>
**Issue**: A delay in receiving message<br/>
**Info**: Enable "Google Cloud Messaging" in microG Settings and allow relevant apps to register.