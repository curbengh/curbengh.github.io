---
title: How to remove Windows 10 default apps
date: 2018-09-26
lastUpdated: 2019-03-01
tags:
- Microsoft
---

Windows 10 comes bundled with many unused apps. Worse, it even install third-party apps from time to time by *itself* (even after you remove it!). Here's how to get rid of these bloatware.

<!-- more -->

## Stop uninstalled games from returning
Stop included games like Candy Crush and Minecraft to reappear after you remove them.

### Windows 10 Pro
1. Right click on Start button and open Run.
2. Enter `gpedit.msc` and run.
3. Go to `Computer Configuration > Administrative Templates > Windows Components > Cloud Content`.
4. Enable `Turn off Microsoft consumer experiences`.

### Windows 10 Home
1. Open Notepad, copy and paste the following text (make sure you don't copy the line number),
	```
	Windows Registry Editor Version 5.00
	;1709 Registry Keys

	[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\CloudContent]
	"DisableWindowsConsumerFeatures"=dword:00000001
	```
2. `File > Save As`, select Desktop folder, `Save as type` as `All Files` and set file name as `cloud-content.reg`.
3. Launch the `cloud-content.reg` file from your Desktop.


## Uninstall all preinstalled apps
This is the easiest method to remove all preinstalled apps. Note: this will remove **ALL** apps listed at the next [section](#Uninstall-specific-preinstalled-app).
1. Launch PowerShell as administrator (right click `Run as administrator`).
	1.1. Windows 10 Home user might not have it, install [here](https://docs.microsoft.com/en-us/powershell/scripting/setup/installing-powershell-core-on-windows?view=powershell-6). 
2. Run the following command:
	```
	Get-AppxPackage -AllUsers | Remove-AppxPackage
	```

For more thorough removal including tracking or telemetry, use [Debloat Windows 10](https://github.com/W4RH4WK/Debloat-Windows-10) powershell script. I haven't test it myself, but it looks like it's regularly updated.

## Uninstall specific preinstalled app
1. Launch PowerShell as administrator (right click `Run as administrator`).
2. Run the following command:
	```
	Get-AppxPackage *<app-name>* | Remove-AppxPackage
	```
3. Substitute `<app-name>` with the package name listed below. Right click on PowerShell to paste.
For example to remove 3D Builder,
	```
	Get-AppxPackage *3dbuilder* | Remove-AppxPackage
	```

App name | Package name
---|---
3D Builder | 3dbuilder
3D Viewer | 3dviewer
Alarms and Clock¹ | windowsalarms
Calendar and Mail¹ | windowscommunicationsapps
Calculator | windowscalculator
Camera | windowscamera
Get Office | officehub
Get Skype | skypeapp
Get Started | getstarted
Groove Music | zunemusic
Maps | windowsmaps
Microsoft Solitaire Collection | solitairecollection
Money | bingfinance
Movies & TV | zunevideo
News | bingnews
OneNote | onenote
Paint | mspaint
People | people
Phone Companion | windowsphone
Photos² | photos
Print 3D | print3d
Store³ | windowsstore
Sports | bingsports
Voice Recorder | soundrecorder
Wallet | wallet
Weather | bingweather
Xbox | xboxapp
Your Phone | yourphone
¹ These are *not* the time and date view you get at the bottom right. Safe to remove.
² This is a full-screen/[UWP](https://en.wikipedia.org/wiki/Universal_Windows_Platform_apps) image viewer. Safe to remove.
³ You might need it. Safe to remove if you don't.



## Prevent removed default apps from returning during an update
1. No, you are not done yet. Those removed apps can return during an update.
2. To make sure they stay removed, create a registry `.reg` file ([how-to](#Windows-10-Home)). Remove any entry to keep the app.
	```
	Windows Registry Editor Version 5.00
	;1709 Registry Keys

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.BingWeather_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.Getstarted_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.Microsoft3DViewer_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.MicrosoftOfficeHub_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.MicrosoftSolitaireCollection_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.Office.OneNote_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.People_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.Print3D_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.SkypeApp_kzf8qxf38zg5c]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.Wallet_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.Windows.Photos_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.WindowsAlarms_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.WindowsCamera_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\microsoft.windowscommunicationsapps_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.WindowsFeedbackHub_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.WindowsMaps_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.WindowsSoundRecorder_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.WindowsStore_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.Xbox.TCUI_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.XboxApp_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.XboxGameOverlay_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.XboxIdentityProvider_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.XboxSpeechToTextOverlay_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.ZuneMusic_8wekyb3d8bbwe]

	[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Appx\AppxAllUserStore\Deprovisioned\Microsoft.ZuneVideo_8wekyb3d8bbwe]
	```
3. Simply open the registry file to apply.

## Restore removed default apps
1. Unfortunately you can't restore the app individually (at least not trivial).
2. To restore all removed preinstalled apps, run the following PowerShell command (as administrator):
```
Get-AppxPackage -AllUsers| Foreach {Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\AppXManifest.xml"}
```
3. Restart Windows.

**Update (*19/10/2018*):** Windows 10 version 1903 (to be released in April 2019) will include the ability to uninstall:

- 3D viewer
- Calculator
- Calendar
- Groove Music
- Mail
- Movies & TV
- Paint 3D
- Snip & Sketch
- Sticky Notes
- Voice Recorder

Above ability is introduced in Insider Preview build [18262](https://blogs.windows.com/windowsexperience/2018/10/17/announcing-windows-10-insider-preview-build-18262/).

On a side note, version 1809 (October 2018 Update) is able to uninstall:

- Microsoft Solitaire Collection
- My Office
- OneNote
- Print 3D
- Skype
- Tips
- Weather

**Update (*01/03/2019*):** Windows 10 version 1809 (released in October 2018) includes Your Phone app. [Instruction](#Uninstall-specific-preinstalled-app) has been updated.


Source: [1](https://www.howtogeek.com/224798/how-to-uninstall-windows-10s-built-in-apps-and-how-to-reinstall-them/), [2](https://www.addictivetips.com/windows-tips/remove-default-windows-10-apps-using-powershell/), [3](https://docs.microsoft.com/en-us/windows/application-management/remove-provisioned-apps-during-update), [4](https://docs.microsoft.com/en-gb/windows/privacy/manage-connections-from-windows-operating-system-components-to-microsoft-services)

