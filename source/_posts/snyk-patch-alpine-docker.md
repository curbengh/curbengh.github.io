---
title: Snyk failed to patch in Alpine docker
date: 2018-10-31 00:00:00
tags:
---
Snyk initially runs fine on Alpine, until you try to `snyk protect` to patch the modules. Turns out Synk depends on GNU version of `patch` utility.

<!-- more -->

Snyk is used to patch vulnerabilities of node_modules (read my <a href="{% post_path secure-node-modules-with-snyk %}">previous post</a> for installation guide). I never had any issue with it running on Alpine docker image. That was because there was no modules to patch.

That is until I install [renovate](https://github.com/renovatebot/renovate), which has [vulnerabilities](https://snyk.io/test/npm/renovate) that can be patched.

Snyk only tells modules failed to patch, which is not helpful at all. I initially thought it was due to file permissions, which I now realise don't make sense. All commands are executed as root and files are owned by root.

The issue was only pinpointed after I ran snyk with `--debug`, which I should've used it in the first place anyway. The issue is due to BusyBox's patch doesn't support `--backup` option. Sigh, <a href="{% post_path gnu-vs-busybox-unix-tools %}">BusyBox versus GNU</a>, back at it again.

To install GNU's patch, simply add `apk add patch` before `npm install` in your CI config (e.g. `.gitlab-ci.yml`). The installation will automatically replace the BusyBox's patch symlink, so you don't need to.