---
title: Hide folders of Caja side pane
excerpt: How to hide them.
date: 2018-10-02
tags:
- linux
---

Caja is a file manager originally forked from Nautilus. It's used in MATE desktop environment, found in Ubuntu MATE or Linux Mint. Since it shares similar base with Nautilus, following guide also applies to Nautilus too (I haven't tested it though).

The side pane of Caja shows many media folders by default. You might not have all the media types or not important enough to bookmark it.

{% image '20181002/caja-side-pane.png' 'Side pane view of Caja file manager' %}
*from github [issue](https://github.com/mate-desktop/caja/issues/480).*

You can hide some folder through `~/.config/user-dirs.dirs` or `/home/your-username/.config/user-dirs.dirs` (you need to show hidden file/folder if you're going to browse through Caja).

Default config:
```
XDG_DESKTOP_DIR="$HOME/Desktop"
XDG_DOWNLOAD_DIR="$HOME/Downloads"
XDG_TEMPLATES_DIR="$HOME/Templates"
XDG_PUBLICSHARE_DIR="$HOME/Public"
XDG_DOCUMENTS_DIR="$HOME/Documents"
XDG_MUSIC_DIR="$HOME/Music"
XDG_PICTURES_DIR="$HOME/Pictures"
XDG_VIDEOS_DIR="$HOME/Videos"
```

To hide the Videos folder, simply edit the line to `XDG_VIDEOS_DIR="$HOME"`. Repeat this for other folders, **except** for the Desktop folder. If you hide the Desktop folder, all folders in Home will show up on the desktop.

Re-launch Caja. Those folders will show up under Bookmarks, instead of Computer. Hide them by right click > Remove.
