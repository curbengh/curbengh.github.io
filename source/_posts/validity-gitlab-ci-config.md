---
title: How to check validity of GitLab CI config
date: 2018-10-25 00:00:00
tags:
---
It can be frustrating after you push the changes you made to `.gitlab-ci.yml`, only to discover it's invalid on gitlab.com. Here's how to verify/lint the config.

<!-- more -->

Login to GitLab.com and navigate to any of your repo or project. It must be under your account. If you don't have one, simply create a new project or fork one.

Simply add `/-/ci/lint` to the end of your repo link and navigate to that link.

For example,

```
https://gitlab.com/curben/blog/-/ci/lint
```

This is what it looks like,

{% cloudinary 20181025/lint.png %}

Simply paste the content of your `.gitlab-ci.yml` and 'Validate'.