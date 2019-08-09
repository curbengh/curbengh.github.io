---
title: How to disable Control+Alt+S shortcut in MATE
excerpt: The shortcut conflicts with Notepad++, here's how to disable it.
date: 2018-10-24
tags:
- linux
---

Control+Alt+S shortcut is used for toggling shaded state in MATE desktop environment. Once toggled, a window's content is hidden except for the title bar. It's useful for peeking at the content behind a window. I personally never use it as I usually just Alt+Tab or place two windows side by side. I prefer to disable it so I can use the 'Save As' shortcut in Notepad++.

There are two methods of disabling the shortcut. Use the [second](#Method-2) method if Compiz is enabled with CCSM (CompizConfig Settings Manager).

## Method 1

Look for `Toggle shaded state` in Keyboard Shortcuts. Disable the shortcut by clicking on the `Ctrl+Alt+S` and backspace.

## Method 2

If you use Compiz, the shortcut is not shown in Keyboard Shortcuts due to conflict with CSSM. You need to manually disable it by editing a dconf value. dconf value can be easily edited through dconf-editor which you can install through `apt` or any other package managers.

Launch dconf-editor and search (click on the search icon on top right corner or just Ctrl+F) for 'shaded'.

{% cloudinary '20181024/dconf.png' "Search for 'shaded' in dconf-editor" %}

Simply navigate into
```
/org/mate/macro/window-keybindings-toggle-shaded
/org/gnome/dekstp/wm/keybindings/toggle-shaded
```
Toggle 'Use default value' to off, and set the custom value as `disabled`.

Finally, disable the shortcut in CCSM. Go to General Options > Key bindings (tab) > Toggle Window Shaded (last value).

{% cloudinary '20181024/ccsm.png' "Disable Shaded Window in CCSM" %}
