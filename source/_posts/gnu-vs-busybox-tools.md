---
title: GNU vs BusyBox Unix tools
date: 2018-10-13 00:00:00
tags:
---
TL;DR Alpine uses BusyBox while Ubuntu uses GNU tools, and they behave differently. Here's how they differ.

<!-- more -->

## Intro

> Skip to the [list](#list).

Alpine Linux is known for its minimal size. The '[mini root filesystem](https://www.alpinelinux.org/downloads/)' flavour is only 2MB. This size makes it suitable as a Docker image, so CI job can start running script sooner instead of downloading larger image like Ubuntu.

I use it in my [urlhaus-filter](https://gitlab.com/curben/urlhaus-filter) repo to run the [scripts](https://gitlab.com/curben/urlhaus-filter/tree/master/utils) (that update the filter twice a day). When I first started using it on gitlab ci (I only knew about it a week ago), my first impression was that it somehow ships with [more Unix tools](https://curben.netlify.com/2018/10/10/binaries-alpine-docker/) than Ubuntu (not technically correct which I explain later), despite its minimal size. during the setup of the repo, there were many job failure due to incorrect command options or syntax.

## Exit with code 1

I was dismayed by those [error messages](https://gitlab.com/curben/urlhaus-filter/-/jobs), I tested the scripts on my workstation! Looking through error message, I noticed the Alpine's Unx tools behave differently than mine. I investigated further by running an Alpine live cd.

I `--version` those tools (only those I use in the [scripts](https://gitlab.com/curben/urlhaus-filter/tree/master/utils)) and the output is totally different! The Alpine tools output `BusyBox vXX`, which shows they are part of BusyBox. I briefly read up the [wiki](https://en.wikipedia.org/wiki/BusyBox#Features) and noticed the following line,

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

So, Alpine uses BusyBox and Ubuntu uses GNU. While Ubuntu also bundles with BusyBox, but it uses GNU by default.

## List

I tested the tools on Alpine and Ubuntu, and noted their behaviour. BusyBox = BB.

- **gzip/gunzip/zcat**: BB only support gzip/bzip2/xz format, not the ubiquitous zip. To extract, use **unzip**. GNU supports zip, but its zcat can only extract the first file.
- **unzip**: GNU doesn't support stdin as input. Use funzip to decompress stdin, but only extract the first file like zcat. BB support stdin and extract all files, through `unzip -`.
- **sed**: BB doesn't support -z argument which is used to find/replace \n new line character. A [workaround](https://stackoverflow.com/a/1252191) is `sed ':a;N;$!ba;s/\n/<new character>/g' file` or `sed -e ':a' -e 'N' -e '$!ba' -e 's/\n/<new character>/g' file`. GNU `sed -z 's/\n/<new character>/g' ` works.