curben.gitlab.io
=====================

![Build Status](https://gitlab.com/curben/curben.gitlab.io/badges/master/pipeline.svg)
---

Forked from GitLab's [example](https://gitlab.com/pages/hexo) with [Typing](https://github.com/geekplux/hexo-theme-typing) theme.

<br>

Following changes have been made on Hexo:
- Update `.gitlab-ci.yml` to use the latest version of [Node.js](https://hub.docker.com/_/node/) in the Docker image.
- Update `package.json` to use latest version of [hexo](https://www.npmjs.com/package/hexo) and its related packages.
- Replace the bundled Landscape theme with Typing theme.

<br>

Following changes have been made on Typing theme:
- Homepage shows index of posts.
- Remove header and footer display (except for `/about` page).
- Use the latest version of [jQuery](https://jquery.com/download/), [fancyBox](https://github.com/fancyapps/fancyBox/releases) and [Font Awesome](https://github.com/FortAwesome/Font-Awesome/releases)
- All js and css files are self-hosted.
- Remove analytic, comment system and donation links.

---

[ci]: https://about.gitlab.com/features/gitlab-ci-cd/
[hexo]: https://hexo.io/
[hexo-server]: https://hexo.io/docs/server.html
[install]: https://hexo.io/docs/index.html#Installation
[documentation]: https://hexo.io/docs/
[gitlab-pages]: https://docs.gitlab.com/ee/user/project/pages/index.html
