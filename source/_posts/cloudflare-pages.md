---
title: Deploy Hexo to Cloudflare Pages
excerpt: Alternative to Netlify/GitHub/GitLab Pages
date: 2021-02-15
tags:
- cloudflare
---

Cloudflare Pages was initially [announced](https://blog.cloudflare.com/cloudflare-pages/) back in mid-December 2020. Since I'm already using its CDN on mdleom.com, it's a no-brainer to me to adopt it. At first glance, this may result in better performance than my previous setup which puts Cloudflare CDN in front of Netlify. So, I went straight for the beta sign up.

The sign up email said that I will be notified when it's ready for testing. Today I noticed it's available on my dashboard, despite never receive the notification.

![Cloudflare Pages Dash](20210215/cf-pages-dash.png)

The installation was straightforward, I just need to install Cloudflare Pages app on my GitHub account. Currently, it only supports GitHub, fortunately I have a GitHub [mirror](https://github.com/curbengh/blog) of my primary [blog repo](https://gitlab.com/curben/blog) on GitLab.

Once the app is installed, I granted access to the blog repo. After that, it redirected back to the Cloudflare to continue setup. The next step is to specify the repo again. Then, I specified a unique project name, this has to be unique among _all_ Cloudflare Pages; in this case, I use "curben" so it's hosted at [curben.pages.dev](https://curben.pages.dev). I selected "Hexo" from the framework preset selections, this resulted in `hexo generate` build command and `public` output directory. Alternatively, you could also specify `npm run build` command if you install Hexo after [4 Oct 2019](https://github.com/hexojs/hexo-starter/commit/de0a52f421e9e64d8d6dbf59037b822df0d992f9); this convention is similar to Svelte and Vue.

![Clouflare Pages build settings](20210215/cf-pages-project.png)

Once configured, I just need to wait for the blog to be built and deployed. My blog is deployed to [curben.pages.dev](https://curben.pages.dev) and [6c9d9856.curben.pages.dev](https://6c9d9856.curben.pages.dev), the later is a snapshot of the build at that time.

Every push to the git repo will trigger a new build and subsequently a new snapshot; in my case, curben.pages.dev always points to the latest snapshot. Having a snapshot means I can easily revert to previous one without having to revert git commits, though it's not available yet. This feature is not new, it was one of the earliest features of Netlify that differentiate itself from other static site hosting.

![Cloudflare Pages build progress](20210215/cf-pages-deploy.png)

Speaking of Netlify, I haven't replace it with Clouflare Pages and currently not planning to. Instead, I deploy my blog (including [.onion](http://xw226dvxac7jzcpsf4xb64r4epr6o5hgn46dxlqk7gnjptakik6xnzqd.onion) and [Eepsite](http://mdleom.i2p)) to two identical web servers that can failover to the following mirrors:

1. [curben.pages.dev](https://curben.pages.dev)
2. [curben.netlify.app](https://curben.netlify.app)
3. [curben.gitlab.io](https://curben.gitlab.io)
4. [curbengh.github.io](https://curbengh.github.io)
