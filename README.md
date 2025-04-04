# [mdleom.com](https://mdleom.com/)

[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fmdleom.com)](https://stats.uptimerobot.com/1394zup2LQ)
[![Netlify Status](https://api.netlify.com/api/v1/badges/3f4b970a-c258-454c-97d6-3a8164f63262/deploy-status)](https://app.netlify.com/sites/curben/deploys)
[![Build Status](https://gitlab.com/curben/blog/badges/master/pipeline.svg)](https://gitlab.com/curben/blog/-/jobs)
[![Hexo version](https://img.shields.io/badge/hexo-hexojs/hexo-brightgreen.svg)](https://github.com/hexojs/hexo)

## Branches

- [`site`](https://gitlab.com/curben/blog/-/tree/site): images deployed to https://curben.gitlab.io/
- [`microblog`](https://gitlab.com/curben/blog/-/tree/microblog): microblog deployed to https://mdleom.com/microblog/

## Plugins

- Installed [hexo-yam](https://github.com/curbengh/hexo-yam) (author) to pre-compress static assets (html, css, js and svg).
- Installed [hexo-nofollow](https://github.com/curbengh/hexo-nofollow) for SEO purpose to prevent search engines from following external links.
- [copy-button.js](/themes/chameleon/scripts/copy-button.js) - A [filter](https://hexo.io/api/filter) plugin to add a copy button to each code block.
- [feed](/themes/chameleon/scripts/feed) - A generator plugin to generate [an RSS feed](https://en.wikipedia.org/wiki/Web_feed). Adapted from [hexo-generator-feed](https://github.com/hexojs/hexo-generator-feed) for simpler use case.
- [heading-link.js](/themes/chameleon/scripts/heading-link.js) - A filter plugin to add a link button next to each heading.
- [image.js](/scripts/image.js) - A [tag](https://hexo.io/api/tag) plugin to easily embed images in a post with responsive image support.
- [link.js](/themes/chameleon/scripts/link.js) - A [helper](https://hexo.io/api/helper) plugin to add a link. Modified from [link_to.js](https://github.com/hexojs/hexo/blob/master/lib/plugins/helper/link_to.js) to remove title attribute and 'external' option.
- [openGraph](/themes/chameleon/scripts/openGraph.js) - A helper plugin to add [Open Graph](https://ogp.me/) tags. Modified from [open_graph.js](https://github.com/hexojs/hexo/blob/master/lib/plugins/helper/open_graph.js) to use additional [Open Graph](https://www.ogp.me/) tags and [WHATWG URL API](https://nodejs.org/api/url.html#url_the_whatwg_url_api).
- [sitemap](/scripts/sitemap) - A [generator](https://hexo.io/api/generator) plugin to generate [a sitemap](https://en.wikipedia.org/wiki/Sitemaps). Modified from [hexo-generator-sitemap](https://github.com/hexojs/hexo-generator-sitemap) with this [patch](https://github.com/hexojs/hexo-generator-sitemap/pull/26) to include tags/categories and [remove](https://github.com/pyyzcwg2833/hexo-generator-sitemap/commit/a92dbbb83cc39ff60d43faa5cd688a56574a3889) [index.html](https://github.com/hexojs/hexo-generator-sitemap/pull/59) from the URL.

## Changes

The following are the major changes I made compared to the upstream.

### [Hexo](https://gitlab.com/pages/hexo) site

- Updated [.gitlab-ci.yml](.gitlab-ci.yml) to use the latest version of [Node.js](https://hub.docker.com/_/node/) in Alpine docker image.
- [All packages](package.json) are installed from their respective master branch, instead of npm published version.
- Removed unused packages, [hexo-generator-category](https://github.com/hexojs/hexo-generator-category) and [hexo-renderer-stylus](https://github.com/hexojs/hexo-renderer-stylus) from the [default packages](https://github.com/hexojs/hexo-starter/blob/571320ba41a83e065d7560e050eb3fa63ad74a57/package.json#L9-L17).
- Replaced the bundled Landscape theme with Typing theme.

### [Chameleon theme](/themes/chameleon)

Chameleon is a fork of [Typing](https://github.com/geekplux/hexo-theme-typing) theme, rewrote from scratch with the following changes/features:

- [sanitize.css](https://github.com/csstools/sanitize.css/) and [autoprefixer](https://github.com/csstools/sanitize.css/) for consistent cross-browser styling.
- Utilise [relative length](https://www.w3schools.com/CSSref/css_units.asp) instead of absolute length in the css.
- [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) to apply light/dark theme according to the OS preference.
- Add a [Copy](https://clipboardjs.com/) button to each code block.
- Removed jQuery, fancyBox, web analytics, comment plugins, donation links and [typo.css](https://github.com/sofish/typo.css).
- Homepage shows recent posts and tags.

## Installation

Refer to [this post](https://mdleom.com/2018/09/21/how-to-create-a-hexo-blog/) for more detailed instruction.

## License

Copyright (c) 2018-2025 Ming Di Leom

The content of this blog is licensed under a [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) license, and the underlying source code used to format and display that content is licensed under an [MIT license](LICENSE.md), unless indicated otherwise.

## Website Mirrors

- https://curben.pages.dev/
- https://curben.netlify.app/
- https://curben.gitlab.io/
- https://curbengh.github.io/
- https://xw226dvxac7jzcpsf4xb64r4epr6o5hgn46dxlqk7gnjptakik6xnzqd.onion/
- http://mdleom.i2p/ ([address helper](http://mdleom.i2p/?i2paddresshelper=-NjUAy6H3wkgRfB3rBwGrpS56L2P~RHRDnD8HnRV1mLSKFdbzxHTMsGLo-mdgGq360Kni2Ec0qhRzm-IUc8X4Y0Ug1eYvcEp2ubXwLe5JJg7yZJOdGxqdy5y5VbdHfIuUe2ooG3MNA4v6b4pGk7pUQ7hnTkUi0EObD~79ik4AY-vSsxIFrc8kJxtbRMCQ3NQRhAuvS1A14rSVk0wv50YwKS23y~FUIQWyG8ZpjTVYu50n~oBnJtVKSAHbCMWRcnJx6iGFsbTRh4ZsRtDh0drwfeRkvaQQqQmf6nZOc4-GLxZ0RT5QlS5gdPXL4V7eaIETbNJAIeYr2NzcpwVHs~zp93Ga-p7dlH3TsJX5gJSyqJWCc64vvmkxf7Vseh3uGaa4xqiLjTH5XsOyFQLp5D6myt-yH7ggReZbs70NKqG1Mj5iRLhIC3Q~pJ6LkPnMBJN6QeLNYNWcOPXkMzRfsavvH2l3yxdpkn41BLM2-7bBUdJNXfu4OhGAR22O0gFngjUBQAEAAcAAA==&update=true))
- http://ggucqf2jmtfxcw7us5sts3x7u2qljseocfzlhzebfpihkyvhcqfa.b32.i2p/

## Repository Mirrors

- https://github.com/curbengh
- https://pagure.io/projects/curben/%2A
- https://codeberg.org/curben
- https://git.disroot.org/curben
- https://git.nixnet.services/curben
- https://gitea.com/curben
- https://framagit.org/curben

## Uptime Status

- https://stats.uptimerobot.com/1394zup2LQ

---

Useful links:

- [Hexo Docs](https://hexo.io/docs/)
- [GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/index.html)
