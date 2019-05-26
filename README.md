[curben.netlify.com](https://curben.netlify.com/)
===

[![Netlify Status](https://api.netlify.com/api/v1/badges/aaf73659-db84-4c41-a700-de3926022674/deploy-status)](https://app.netlify.com/sites/curben/deploys)
[![Build Status](https://gitlab.com/curben/curben.gitlab.io/badges/master/pipeline.svg)](https://gitlab.com/curben/blog/-/jobs)
[![Hexo version](https://img.shields.io/badge/hexo-3.8.0-brightgreen.svg)](https://www.npmjs.com/package/hexo)

Forked from GitLab's [Hexo](https://gitlab.com/pages/hexo) example with [Typing](https://github.com/geekplux/hexo-theme-typing) theme.

## Installation

> Refer to [this post](https://curben.netlify.com/2018/09/21/how-to-create-a-hexo-blog/) for more detailed instruction.

1. Change `<folder>` to a preferred name.
```bash
git clone https://gitlab.com/curben/blog <folder>
```
2. Install Node.js.
```bash
# Ubuntu 16.04 or newer
$ sudo snap install node --classic --channel=10
# Debian
$ curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
$ sudo apt-get install -y nodejs
# Fedora 29
$ sudo dnf install npm
# Fedora 28 or older
$ curl --silent --location https://rpm.nodesource.com/setup_10.x | sudo bash -
$ sudo yum -y install nodejs
# Arch Linux
$ sudo pacman -S npm
```
3. Install Hexo and its dependencies (defined in [package.json](package.json)). `hexo-cli` installation step can be skipped if you use [this shortcut](https://curben.netlify.com/2018/10/24/running-locally-installed-node-packages/#Method-1).
```bash
$ sudo npm install -g hexo-cli
$ cd <folder>
$ npm install --only=prod
```
4. Generate static files to check for any error. You should _always_ do this before pushing/merging commits to the `master` branch.
```bash
$ hexo generate
```

## Quick Start

### Create a new post

``` bash
$ hexo new "My New Post"
```

More info: [Writing](https://hexo.io/docs/writing.html)

### Run server

``` bash
$ hexo server
```

More info: [Server](https://hexo.io/docs/server.html)

### Generate static files

``` bash
$ hexo generate
```

More info: [Generating](https://hexo.io/docs/generating.html)

### Deploy to remote sites

``` bash
$ hexo deploy
```

More info: [Deployment](https://hexo.io/docs/deployment.html)

## Changes
The following are the major changes I made compared to the upstream.

### [Hexo](https://gitlab.com/pages/hexo) site
- Update [.gitlab-ci.yml](.gitlab-ci.yml) to use the latest version of [Node.js](https://hub.docker.com/_/node/) in Alpine docker image.
- Update [package.json](package.json) to use latest version of [hexo](https://www.npmjs.com/package/hexo) and its related packages.
- Replace the bundled Landscape theme with Typing theme.
- [Pre-compressed](https://docs.gitlab.com/ee/user/project/pages/introduction.html#serving-compressed-assets) the assets using [hexo-yam](https://github.com/weyusi/hexo-yam).

### [Typing](https://github.com/geekplux/hexo-theme-typing) theme
- Homepage shows index of posts.
- Remove header and footer display (except for `/about` page).
- Use the latest version of [jQuery](https://jquery.com/download/), [fancyBox](https://github.com/fancyapps/fancyBox/releases), [Fork Awesome](https://github.com/ForkAwesome/Fork-Awesome/releases) and [clipboard.js](https://github.com/zenorocha/clipboard.js/).
- Remove web analytics, comment systems and donation links.
- Use more [relative length](https://www.w3schools.com/CSSref/css_units.asp), instead of absolute length in the css.


## License
The content of this blog is licensed under the [Creative Commons Attribution Share Alike 4.0 International license](https://creativecommons.org/licenses/by-sa/4.0/), and the underlying source code used to format and display that content is licensed under the [MIT license](LICENSE.md).

---
Useful links:

- [Hexo Docs](https://hexo.io/docs/)
- [GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/index.html)

