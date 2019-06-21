---
title: Recommended Android apps
subtitle: Apps I'm currently using and recommend to everyone.
date: 2019-01-07
lastUpdated: 2019-04-30
tags:
- android
---

Following my switch to [microG](https://microg.org/) (an open source re-implementation of Google Play), some Google Apps stopped working ({% post_link microg-google-play-replacement 'read here' %}). During my search for replacements, I discover many open source alternatives. These are the apps I'm currently using and recommend to everyone.

Aside from the below list, check out the NanoDroid's [list](https://gitlab.com/Nanolx/NanoDroid/blob/master/doc/Applications.md) of other great open source alternatives.

Name | Previous | Comment
--- | --- | ---
[F-Droid](https://f-droid.org/) + [Aurora Store](https://f-droid.org/en/packages/com.aurora.store/) / [Yalp Store](https://github.com/yeriomin/YalpStore) | Play Store | Compatible with microG. F-Droid is an app store for open source apps. Aurora/Yalp Store is to browse and install apps listed in Google Play *without* a Google account, while offering support for Google account login to download purchased apps.
[Fennec F-Droid](https://f-droid.org/en/packages/org.mozilla.fennec_fdroid/) | Firefox | It's an official build by Mozilla for F-Droid with less proprietary components (Google Services Framework?). Particularly suitable for [microG](https://microg.org/).
[Simple Calendar](https://github.com/SimpleMobileTools/Simple-Calendar) + [DAVx⁵](https://www.davx5.com/) | Google Calendar | Google Calendar doesn't work with microG. It's part of [Simple Mobile Tools](https://simplemobiletools.github.io/), so it's open source and include dark theme. Use DAVx⁵ to sync calendar and contact. Google uses proprietary protocols instead of CalDAV and CardDAV, so data migration is required.
[Simple Gallery](https://github.com/SimpleMobileTools/Simple-Gallery) | Google Photos | The only reason I use Google Photos is the ability to view panoramas, despite having no issue with microG. Since Simple Gallery is part of Simple Mobile Tools and supports panoramas, I gladly switched.
[uNote](https://gitlab.com/Varlorg/uNote) | OI Notepad | Smallest (71KB) open source notepad app that I could find.
[KeePass DX](https://www.keepassdx.com/) / [Keepass2Android](https://play.google.com/store/apps/details?id=keepass2android.keepass2android_nonet) | [KeePassDroid](http://www.keepassdroid.com/)  | KeePass DX utilises Material theme so it looks more modern and feels lighter. Currently, it does not support database with attachment well (see [#115](https://github.com/Kunzisoft/KeePassDX/issues/115) [#183](https://github.com/Kunzisoft/KeePassDX/issues/183)); alternative is the Keepass2Android. There is an [*online*](https://play.google.com/store/apps/details?id=keepass2android.keepass2android&hl=en_US) version which supports opening database from the cloud backup.
[Lithium](https://play.google.com/store/apps/details?id=com.faultexception.reader&hl=en) | FBReader | Free but proprietary EPUB reader. The best feature is read by scrolling; each chapter is displayed as a long text and you scroll down as you read. I find this feature faster than the usual flip-by-swipe and without the accidental touch issue of flip-by-tap.
[Pdf Viewer Plus](https://github.com/JavaCafe01/PdfViewer) / [MuPDF viewer](https://f-droid.org/en/packages/com.artifex.mupdf.viewer.app/) | Google PDF Viewer | For a simple pdf viewer, I liked Google PDF Viewer due to its minimal size ([5MB](https://www.apkmirror.com/apk/google-inc/google-pdf-viewer/google-pdf-viewer-2-7-332-10-release/google-pdf-viewer-2-7-332-10-40-android-apk-download/)). An open-source alternative is Pdf Viewer Plus. It uses vertical scrolling just like the Google's (and most desktop PDF viewers) and offers themes (for dark theme users). If you prefer/don't mind horizontal scrolling, another alternative is MuPDF viewer or [MuPDF mini](https://f-droid.org/packages/com.artifex.mupdf.mini.app/) have smaller APKs and support more formats (i.e. XPS, OpenXPS, CBZ, EPUB, and FictionBook 2), but offer less customisation.
[Unit Converter Ultimate](https://github.com/physphil/UnitConverterUltimate) |  | The only unit converter app that you would ever need. Supports every practically possible units including currency.
[Aegis](https://github.com/beemdevelopment/Aegis) / [andOTP](https://github.com/andOTP/andOTP) | Google Authenticator | Open source and dark theme.
[Loyalty Card Keychain](https://f-droid.org/packages/protect.card_locker/) | Google Pay | Simply to store loyalty cards with barcode.
[OsmAnd](https://f-droid.org/en/packages/net.osmand.plus/), [*Maps*](https://f-droid.org/en/packages/com.github.axet.maps/)/MAPS.ME, Waze, HERE WeGo | Google Maps | **OsmAnd** and **MAPS.ME** are open source and utilise [OpenStreetMap](https://www.openstreetmap.org/). They do not have public transport info though. Use [**Transportr**](https://f-droid.org/en/packages/de.grobox.liberario/) for that. **Maps** is a fork of MAPS.ME without the proprietary bits and it's available on F-Droid. ~~Google Maps doesn't work with microG.~~ (Edit: Google Maps v10.6.2 works again on microG v0.2.6.13280)
