[curben.netlify.com](https://curben.netlify.com/)
===

![Build Status](https://gitlab.com/curben/curben.gitlab.io/badges/master/pipeline.svg)
![https://www.npmjs.com/package/hexo](https://img.shields.io/badge/hexo-3.8.0-blue.svg)

Forked from GitLab's [Hexo](https://gitlab.com/pages/hexo) example with [Typing](https://github.com/geekplux/hexo-theme-typing) theme.

## Installation

1. Change `<folder>` to a preferred name.
```bash
git clone https://gitlab.com/curben/curben.gitlab.io <folder>
```
2. Install Node.js.
```bash
# Installing npm will also install nodejs as dependency.
# Ubuntu/Debian
sudo apt-get install npm
# Fedora/Red Hat
sudo yum install npm
# Arch Linux
sudo pacman -S npm
```
3. Install Hexo and its dependencies (defined in [package.json](package.json)).
```bash
$ sudo npm install -g hexo-cli
$ cd <folder>
$ npm install
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
- Use the latest version of [jQuery](https://jquery.com/download/), [fancyBox](https://github.com/fancyapps/fancyBox/releases), [Font Awesome](https://github.com/FortAwesome/Font-Awesome/releases) and [clipboard.js](https://github.com/zenorocha/clipboard.js/).
- Remove web analytics, comment systems and donation links.


## License
The content of this blog itself is licensed under the [Creative Commons Attribution Share Alike 4.0 International license](https://creativecommons.org/licenses/by-sa/4.0/), and the underlying source code used to format and display that content is licensed under the [MIT license](LICENSE.md).

---
Useful links:

- [Hexo Docs](https://hexo.io/docs/)
- [GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/index.html)

