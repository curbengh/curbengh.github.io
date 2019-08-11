[curben.netlify.com](https://curben.netlify.com/)
===

[![Netlify Status](https://api.netlify.com/api/v1/badges/aaf73659-db84-4c41-a700-de3926022674/deploy-status)](https://app.netlify.com/sites/curben/deploys)
[![Build Status](https://gitlab.com/curben/curben.gitlab.io/badges/master/pipeline.svg)](https://gitlab.com/curben/blog/-/jobs)
[![Hexo version](https://img.shields.io/badge/hexo-3.9.0-brightgreen.svg)](https://www.npmjs.com/package/hexo)

Forked from GitLab's [Hexo](https://gitlab.com/pages/hexo) example with [Typing](https://github.com/geekplux/hexo-theme-typing) theme.

## Installation

Refer to [this post](https://curben.netlify.com/2018/09/21/how-to-create-a-hexo-blog/) for more detailed instruction.


## Changes
The following are the major changes I made compared to the upstream.

### [Hexo](https://gitlab.com/pages/hexo) site
- Update [.gitlab-ci.yml](.gitlab-ci.yml) to use the latest version of [Node.js](https://hub.docker.com/_/node/) in Alpine docker image.
- Update [package.json](package.json) to use latest version of [hexo](https://www.npmjs.com/package/hexo) and its related packages.
- Replace the bundled Landscape theme with Typing theme.
- [Pre-compressed](https://docs.gitlab.com/ee/user/project/pages/introduction.html#serving-compressed-assets) the assets using [hexo-yam](https://github.com/weyusi/hexo-yam).

### [Typing](https://github.com/geekplux/hexo-theme-typing) theme
- Homepage shows index of posts (same as /archives).
- Use the latest version of [clipboard.js](https://github.com/zenorocha/clipboard.js/) and [Fork Awesome](https://github.com/ForkAwesome/Fork-Awesome/releases) (disabled by default).
- Remove jQuery, fancyBox, web analytics, comment plugins and donation links.
- Use more [relative length](https://www.w3schools.com/CSSref/css_units.asp), instead of absolute length in the css.


## License
The content of this blog is licensed under the [CC-BY-SA license](https://creativecommons.org/licenses/by-sa/4.0/), and the underlying source code used to format and display that content is licensed under the [MIT license](LICENSE.md), unless indicated otherwise.

---
Useful links:

- [Hexo Docs](https://hexo.io/docs/)
- [GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/index.html)

