---
title: GNU vs BusyBox Unix tools
excerpt: Alpine uses BusyBox while Ubuntu uses GNU tools, and they behave differently.
date: 2018-10-13
updated: 2021-04-19
tags:
- linux
- alpine
- busybox
---

## Intro

> Skip to the [list](#list).

Alpine Linux is known for its minimal size. The '[mini root filesystem](https://www.alpinelinux.org/downloads/)' flavour is only 2MB. This size makes it suitable as a Docker image, so CI job can start running script sooner instead of downloading larger image like Ubuntu.

I use it in my [urlhaus-filter](https://gitlab.com/curben/urlhaus-filter) repo to run the [scripts](https://gitlab.com/curben/urlhaus-filter/tree/master/utils) (that update the filter twice a day). When I first started using it on gitlab ci (I only knew about it a week ago), my first impression was that it somehow ships with [more Unix tools](https://mdleom.com/2018/10/10/binaries-alpine-docker/) than Ubuntu (not technically correct which I explain later), despite its minimal size. during the setup of the repo, there were many job failure due to incorrect command options or syntax.

## Exit with code 1

While setting up GitLab CI for urlhaus-filter, I encountered many issues despite tested fine on my workstation. Sifting through the error messages, I noticed the Alpine's Unix tools behave differently than mine. I investigated further by testing the script on an Alpine VM.

I compared the `--version` of those tools in Ubuntu and Alpine, and noticed the outputs are totally different. The Alpine tools output `BusyBox vXX`, which shows they are part of BusyBox. I briefly read up the [wiki](https://en.wikipedia.org/wiki/BusyBox#Features) and noticed the following line,

{% blockquote %}
...compared GNU, BusyBox, asmutils and Perl implementations of the standard Unix commands...
{% endblockquote %}

and the [examples](https://en.wikipedia.org/wiki/BusyBox#Examples),

{% blockquote %}
Programs included in BusyBox can be run simply by adding their name as an argument to the BusyBox executable:

    /bin/busybox ls

..., for example just

    /bin/ls

after /bin/ls is linked to /bin/busybox
{% endblockquote %}

So, Alpine uses BusyBox and Ubuntu uses GNU. Ubuntu does include BusyBox by default, but it mostly uses GNU.

## List

I tested the tools on Alpine and Ubuntu, and noted their behaviour. BusyBox = BB.

- **gzip/gunzip/zcat**: BB only support gzip/bzip2/xz format, use BB's unzip for zip file. GNU can only extract the first file in a zip.
- **unzip**: GNU doesn't support stdin as input. funzip can decompress from stdin, but only the first file (like zcat). BB support stdin and extract all files, through `unzip -`.
- **sed**: BB doesn't support -z argument which is used to find/replace \n new line character. A [workaround](https://stackoverflow.com/a/1252191) is `sed ':a;N;$!ba;s/\n/<new character>/g' file` or `sed -e ':a' -e 'N' -e '$!ba' -e 's/\n/<new character>/g' file`. GNU `sed -z 's/\n/<new character>/g' ` works.
- **bsdtar**: Since GNU can only extract the first file, in addition to BB's unzip, another alternative is bsdtar. bsdtar is available through `libarchive-tools` package. To extract zip from stdin, use `$ bsdtar -xf -`.
- **patch**: BB doesn't support `--backup` option. BSD doesn't support `--verbose` option.
