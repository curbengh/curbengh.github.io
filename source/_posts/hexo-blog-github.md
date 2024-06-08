---
title: How to create a Hexo blog on GitHub Pages
excerpt: Host your Hexo blog for free on GitHub Pages.
date: 2018-11-10
updated: 2020-11-17
tags:
- hexo
---

> I recommend the [official guide](https://hexo.io/docs/github-pages) (which I co-authored) for more updated content.

In {% post_link how-to-create-a-hexo-blog 'previous post' %}, I showed you how to create a blog using [Hexo](https://hexo.io) and host it on a GitLab repo then deploy using Netlify. Here's how to host it on [GitHub Pages](https://pages.github.com/):

## GitHub repository
1. Register a free [GitHub](https://github.com/join) account or use your current one.
2. Create a repo named <b>*username*.github.io</b>, where username is your username on GitHub.
3. Clone this [repo](https://gitlab.com/curben/blog).
4. Install [Travis CI](https://github.com/marketplace/travis-ci). It's free for open source repo.
5. Go to [Applications settings](https://github.com/settings/installations), configure Travis CI to have access to the repo.
6. You'll be redirected to Travis page.
7. On a new tab, generate a [new token](https://github.com/settings/tokens) with **repo** scopes. Note down the token value.
8. On the Travis page, go to your repo's setting. Under **Environment Variables**, put **GH_TOKEN** as name and paste the token onto value. Click Add to save it.
9. Add `.travis.yml` file to your repo with the following config:

```yml
language: node_js
node_js:
  - node # use latest version of nodejs
cache: npm
branches:
  only:
    - master # build master branch only
before_install:
  - npm install # install node packages and dependencies
script:
  - hexo generate # generate static files
deploy:
  provider: pages
  skip-cleanup: true
  github-token: $GH_TOKEN
  keep-history: true
  on:
    branch: master
  local-dir: public
```

10. You can start writing a new post straightaway without [installing](#installation) Hexo. You still need to change the blog's name and favicon though ([how-to](#naming)).
    1. To create a new post (through [GitHub.com](https://help.github.com/en/articles/creating-new-files)), create a new `<post-title>.md` file in `source/_posts` folder.
    2. Start with the following header/[front-matter](https://hexo.io/docs/front-matter):

    ```
    ---
    title: Test page
    date: yyyy-mm-dd hh:mm:ss
    tags:
    categories:
    ---
    ```

    3. Write your post after the second `---` using [Markdown](https://guides.github.com/features/mastering-markdown/) [style](https://help.github.com/articles/basic-writing-and-formatting-syntax/).
    4. Save the file by clicking on "Commit changes".
11. After you create a new post, the website can be accessed on <b>*username*.github.io</b>. Check your repo settings, under the GitHub Pages, make sure the Source is `gh-pages` branch. Read on if you prefer to manage the blog from your workstation.

## Installation
1. Having Hexo means you can debug locally, rather than waiting for [Travis](https://travis-ci.com/). You can even run a local server to preview your blog (see step 6 below).
2. Clone your repo to your workstation.
3. Install Node.js and Hexo using the [official guide](https://hexo.io/docs/).
4. Create a [new post](#writing). Then generate static files to check for any error. You should always do this before pushing/merging commits to the `master` branch.

```bash
$ hexo generate
```

5. (Optional) Start Hexo server on `http://localhost:4000` to preview the blog. ([more info](https://hexo.io/docs/server))

```bash
$ hexo server
```

6. Git add, commit and push the file to your GitHub repo.

``` bash
$ git add 'source/_posts/your-post.md'
$ git commit -a -m 'Commit Message'
$ git push -u
```

7. Check the build status by going to your project in [Travis](https://travis-ci.com/). Due to a limitation of `hexo`, the build will always pass even when there is error. Check the Jobs log, look for any error after `$ hexo deploy`.
8.  If there is no error, the generated website can be accessed on <b>*username*.github.io</b>

## Writing

1. Create a new post (using Hexo)

``` bash
$ hexo new "My New Post"
```

2. `My-New-Post.md` is created to the `source/_posts` folder, with the following header/[front-matter](https://hexo.io/docs/front-matter):

```
---
title: My New Post
date: yyyy-mm-dd hh:mm:ss
tags:
categories:
---
```

4. Write your post after the second `---` using [Markdown](https://guides.github.com/features/mastering-markdown/) [style](https://help.github.com/en/articles/basic-writing-and-formatting-syntax).

More info: [Writing](https://hexo.io/docs/writing.html)

## Configuration
### Naming
Change the website's author and name
`_config.yml`:

```yml
title:
excerpt:
description:
author:
```

`themes/typing/_config.yml`:

```yml
menu:
  GitHub: <your-github-project-link>
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

1. Navigate to your repo on GitHub. Go to the **Settings** tab. Change the **Repository name** so your blog is available at <b>username.github.io/*repository*</b>,  **repository** can be any name, like *blog* or *hexo*.
1. Edit **_config.yml**, change the `root:` value to the name.
1. Commit and push.

## Useful links:
Sample configuration files:

- [.travis.yml](https://github.com/curbengh/hexo-testing/blob/master/.travis.yml)
- [_config.yml](https://gitlab.com/curben/blog/blob/master/_config.yml)
- [package.json](https://gitlab.com/curben/blog/blob/master/package.json)
- [netlify.toml](https://gitlab.com/curben/blog/blob/master/netlify.toml) *for Netlify deployment only*

More info:

- [Hexo Docs](https://hexo.io/docs/)
- [GitHub Pages](https://help.github.com/categories/github-pages-basics/)
- [Travis CI Docs](https://docs.travis-ci.com/user/tutorial/)
