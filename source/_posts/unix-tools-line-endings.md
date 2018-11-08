---
title: Use Unix line endings in Unix tools
date: 2018-11-08 00:00:00
tags:
---

Before you use any Unix tools to process some file, make sure the file only use Unix [line endings](https://en.wikipedia.org/wiki/Newline#Representation).

<!-- more -->

Note that many text files you downloaded most probably use Windows line endings.

To [recap](https://en.wikipedia.org/wiki/Newline#Representation),

Type | Line ending | Escape sequence
---|--- | ---
Windows | CR LF | \r\n
Unix (including Linux distro, *BSD and macOS) | LF | \n
Classic Mac OS (i.e. Mac OS 9 or older) | CR | \r

Unix tools, regardless from Busy/ToyBox, GNU or BSD, only support Unix line endings. 

So, before you use any of them, make sure you convert the file to Unix line endings, especially before `grep -f`.

Use `dos2unix`  to convert from Windows to Unix line endings, e.g.

```
# STDIN to STDOUT
cat input | dos2unix
# STDIN to FILE
cat input | dos2unix > output
# Convert and replace current file
dos2unix filename
```

If your distro includes BusyBox (e.g. Ubuntu), use `busybox dos2unix`.