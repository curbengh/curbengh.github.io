curben.gitlab.io
================

![Build Status](https://gitlab.com/curben/curben.gitlab.io/badges/master/pipeline.svg)

Forked from GitLab's [example](https://gitlab.com/pages/hexo) with [Typing](https://github.com/geekplux/hexo-theme-typing) theme.

## Installation
to-do

## Changes

### Hexo

- Update `.gitlab-ci.yml` to use the latest version of [Node.js](https://hub.docker.com/_/node/) in the Docker image.
- Update `package.json` to use latest version of [hexo](https://www.npmjs.com/package/hexo) and its related packages.
- Replace the bundled Landscape theme with Typing theme.

### Typing theme

- Homepage shows index of posts.
- Remove header and footer display (except for `/about` page).
- Use the latest version of [jQuery](https://jquery.com/download/), [fancyBox](https://github.com/fancyapps/fancyBox/releases) and [Font Awesome](https://github.com/FortAwesome/Font-Awesome/releases)
- All js and css files are self-hosted.
- Remove analytic, comment system and donation links.

## Favicon

[RealFaviconGenerator](https://realfavicongenerator.net/) provides a web-based tool to generate favicons with wide compatibility.
1. Upload your favicon (at least 260x260) and configure however you want.
2. Install the generated package to [favicons](themes/typing/source/favicons/) folder.
3. Edit [header.ejs](themes/typing/layout/_partial/head.ejs). Change the `color` values of `mask-icon` and `msapplication-TileColor` to the values you configured on the generator.
4. Check for any error using `hexo generate --force` (you should do this before you push any commit anyway).
5. `git commit` `push`.
5. Check your favicon with the [favicon checker](https://realfavicongenerator.net/favicon_checker).


[ci]: https://about.gitlab.com/features/gitlab-ci-cd/
[hexo]: https://hexo.io/
[hexo-server]: https://hexo.io/docs/server.html
[install]: https://hexo.io/docs/index.html#Installation
[documentation]: https://hexo.io/docs/
[gitlab-pages]: https://docs.gitlab.com/ee/user/project/pages/index.html
