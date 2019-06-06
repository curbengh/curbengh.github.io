---
title: Running locally installed node packages
date: 2018-10-24
tags:
- Node
---

How to run binaries of locally installed node packages.

<!-- more -->

Installing a package with `--global` introduce more trouble than convenience. Here's how to run binaries of locally installed node packages.

By default, `npm install` installs packages as listed in `package.json` at 'node_modules' of your project folder. When a package ships with executables/binaries, usually user would install it globally using `sudo npm install --global/-g`.

But you should try to avoid using `--global`. Installing globally means using a specific version of a package across different projects. It might be fine in certain use cases, but it would cause version conflict time when different project depends on different versions.

Let say [Hexo](https://hexo.io). It ships with `hexo` binary, so you can [run](https://hexo.io/docs/) `hexo generate` or `hexo server`

If you install it locally, the shell would complain `'hexo' command not found` when you try to run it. There are two methods of running the binaries, without using `--global`.

## Method 1

You can add `./node_modules/.bin` to **$PATH**. The beginning dot is so that it can work in any folder as long your current folder has `node_modules` folder. This way, you don't have to add all your project folder to $PATH.

There are different ways of adding a folder to $PATH. If you simply run `export PATH="$PATH:./node_modules/.bin"`, it's only temporary and would be gone as soon as you close the terminal.

To make the value persistent, the recommended way is to add it to `.profile` of your home folder. At least this applies to Ubuntu. To do that,

```shell
$ echo 'PATH="$PATH:./node_modules/.bin"' >> ~/.profile
```

If your distro supports `.bashrc` and doesn't use `.profile` at all, run

```shell
$ echo 'export PATH="$PATH:./node_modules/.bin"' >> ~/.bashrc
```

The command above *append* the directory location to $PATH. You might find some instructions online use `"./node_modules/.bin:$PATH"`, which *prepend* to $PATH. This makes node packages having precedence over `/usr/bin`(!). If a node package has malicious binaries with similar name as {% post_link unix-tools-line-endings 'Unix' %} {% post_link binaries-alpine-docker 'tools' %} like `cd` or `ls`, those will be executed instead of the ones in `/usr/bin`.

## Method 2

This method is mostly used for CI runner, so probably you're not gonna use it. Anyway, here it goes.

Put it under `script` section of package.json. Usually it's above `dependencies` section. Assign a name for the command. You can include flags/arguments/options.

For example,

```json
  "scripts": {
    "build": "hexo generate",
    "test": "snyk auth $SNYK_TOKEN && snyk protect && snyk test && snyk monitor",
    "postbuild": "renovate --token $BOT_TOKEN --platform 'gitlab' --onboarding false --update-lock-files false --labels 'renovate' --recreate-closed true curben/blog"
  },
```

Running `npm run test` would execute `snyk auth $SNYK_TOKEN && snyk protect && snyk test && snyk monitor`.

So, back to the Hexo example, you *could* put its most common operations like `hexo new post`, `hexo clean`, `hexo generate` or `hexo server` into the "scripts" section, and then `npm run [name]`.

Source: [[1]](https://firstdoit.com/no-need-for-globals-using-npm-dependencies-in-npm-scripts-3dfb478908?gi=850cae7e854e), [[2]](http://2ality.com/2016/01/locally-installed-npm-executables.html)
