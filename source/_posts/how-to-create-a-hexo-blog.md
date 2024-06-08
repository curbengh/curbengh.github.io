---
title: How to create a Hexo blog using GitLab and Netlify
excerpt: Deploy a Hexo website/blog using Netlify from a GitLab repo.
date: 2018-09-21
updated: 2020-11-17
tags:
- hexo
- gitlab
- netlify
---

> Refer to the [this guide](https://hexo.io/docs/gitlab-pages) (co-authored by me) if you prefer to use GitLab Pages instead of Netlify.

Create a website/blog using Hexo on [GitLab Pages](https://about.gitlab.com/features/pages/) for free using the following guide. Refer to my {% post_link hexo-blog-github 'another guide' %} for [GitHub Pages](https://pages.github.com/).

## GitLab project
1. Register a free [GitLab](https://gitlab.com/users/sign_in#register-pane) account or use your current one.
2. Fork the [repo of this blog](https://gitlab.com/curben/blog).
3. Shared Runners should be enabled. Go to your (forked) project `Settings -> CI / CD -> Shared Runners`.
4. Change project website to a user website. This is so that the website's home page is <b>*username*.gitlab.io</b>, instead of username.gitlab.io/hexo.
    Go to `Settings -> General -> Advanced -> Change path`. Change the value to <b>*username*.gitlab.io</b>, where username is your username on GitLab.
5. You can start writing a new post straight away without [installing](#installation) Hexo. You still need to change the blog's name and favicon though ([how-to](#naming)).
    1. To create a new post (through GitLab.com), create a new `<post-title>.md` file in `source/_posts` folder.
    2. Start with the following header/[front-matter](https://hexo.io/docs/front-matter):

    ``` yml _posts/test-page.md
    ---
    title: Test page
    date: yyyy-mm-dd hh:mm:ss
    tags:
    categories:
    ---
    ```

    3. Write your post after the second `---` using [Markdown](https://about.gitlab.com/handbook/product/technical-writing/markdown-guide/) [style](https://docs.gitlab.com/ee/user/markdown.html).
    4. Save the file by clicking on "Commit changes".
6. After you create a new post, the website can be accessed on <b>*username*.gitlab.io</b> or the link shown on your project `Settings -> Pages`. Read on if you prefer to manage the blog from your workstation.

## Installation
1. Having Hexo means you can debug locally, rather than waiting for [CI](https://docs.gitlab.com/ee/ci/). You can even run a local server to preview your blog (see step 6 below).
2. Clone your repo to your workstation.
3. Install Node.js and Hexo using the [official guide](https://hexo.io/docs/).
4. Create a [new post](#writing). Then generate static files to check for any error. You should always do this before pushing/merging commits to the `master` branch.

```
$ hexo generate
```

5. (Optional) Start Hexo server on `http://localhost:4000` to preview the blog.

```
$ hexo server
```
More info: [Server](https://hexo.io/docs/server)

6. Git add, commit and push the file to your GitHub repo.

```
$ git add 'source/_posts/your-post.md'
$ git commit -a -m 'Commit Message'
$ git push -u
```

7. The generated `public` and `node_modules` are [ignored](https://gitlab.com/curben/blog/blob/master/.gitignore), as CI will generate them during build.
    1. I have migrated to [Netlify](https://www.netlify.com/) and removed my GitLab page.
    2. Since I don't have a gitlab page any more, I removed the deploy command in the `.gitlab-ci.yml`.
    3. The config now has two parts. To use in gitlab page, simply uncomment the second part and comment out the first part.
    4. Make sure you {% post_link validity-gitlab-ci-config 'double-check' %} the CI config before you push.

8. Check the build status by going to your project `CI /CD -> Pipelines`. Due to the limitation of `hexo`, the build will always pass even when there is error. Check the Jobs log, look for any error after `$ hexo deploy`.
9.  If there is no error, the generated website can be accessed on `<your-username>.gitlab.io/` or the link shown on your project `Settings -> Pages`.

## Writing
1. Create a new post (using Hexo)

```
$ hexo new "My New Post"
```

2. `My-New-Post.md` is created to the `source/_posts` folder, with the following header/[front-matter](https://hexo.io/docs/front-matter):

``` yml _posts/my-new-post.md
---
title: My New Post
date: yyyy-mm-dd hh:mm:ss
tags:
categories:
---
```

4. Write your post after the second `---` using [Markdown](https://about.gitlab.com/handbook/product/technical-writing/markdown-guide/) [style](https://docs.gitlab.com/ee/user/markdown.html).

More info: [Writing](https://hexo.io/docs/writing.html)

## Configuration
### Naming
Change the website's author and name:

``` yml _config.yml
title:
excerpt:
description:
author:
```

Change the theme's setting:

``` yml themes/typing/_config.yml
menu:
  GitLab: <your-gitlab-project-link>
# Customize /about page
nickname:
description:
```

### Favicon
[RealFaviconGenerator](https://realfavicongenerator.net/) provides a web-based tool to generate favicons with wide compatibility.

1. Upload your favicon (at least 260x260) and configure however you want.
1. Install the generated package to `themes/typing/source` folder. Make you replace all existing files.
1. Edit `themes/typing/layout/_partial/head.ejs`. Change the `color` values of `mask-icon` and `msapplication-TileColor` to the values you configured on the generator.
1. Check for any error using `hexo generate` (you should do this *before* you push any commit).
1. Commit and push.
1. Check your favicon with the [favicon checker](https://realfavicongenerator.net/favicon_checker).

### Project page
If you prefer to have a project page on GitLab:

1. Go to `Settings -> General -> Advanced -> Change path`. Change the value to a name, so the website is available at <b>username.gitlab.io/*name*</b>. It can be any name, like *blog* or *hexo*.
1. Edit **_config.yml**, change the `root:` value from `""` to `"name"`.
1. Commit and push.

### Remove fork relationship
If you don't have any plan to send merge requests to the upstream, you can remove fork relationship permanently by going to `Settings -> General -> Advanced -> Remove fork relationship`.

## Useful links:
Configuration files for this blog deployment:

- [netlify.toml](https://gitlab.com/curben/blog/blob/master/netlify.toml)
- [_config.yml](https://gitlab.com/curben/blog/blob/master/_config.yml)
- [package.json](https://gitlab.com/curben/blog/blob/master/package.json)
- [.gitlab-ci.yml](https://gitlab.com/curben/blog/blob/master/.gitlab-ci.yml)

Docs:

- [Hexo Docs](https://hexo.io/docs/)
- [GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/index.html)
