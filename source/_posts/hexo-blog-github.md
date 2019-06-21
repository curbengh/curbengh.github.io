---
title: How to create a Hexo blog on GitHub Pages
subtitle: Host your Hexo blog for free on GitHub Pages.
date: 2018-11-10
tags:
- hexo
---

In {% post_link how-to-create-a-hexo-blog 'previous post' %}, I showed you how to create a blog using [Hexo](https://hexo.io) and host it on [GitLab Pages](https://about.gitlab.com/features/pages/). Here's how to host it on [GitHub Pages](https://pages.github.com/):

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

10. You can start writing a new post straightaway without [installing](#Installation) Hexo. You still need to change the blog's name and favicon though ([how-to](#naming)).
	1. To create a new post (through GitLab.com), create a new `<post-title>.md` file in `source/_posts` folder.
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
11. After you create a new post, the website can be accessed on <b>*username*.github.io</b>. Check your repo settings, under the GitHub Pages, make sure the Source is `gh-pages` branch.

## Installation
1. Having Hexo means you can debug locally, rather than waiting for [Travis](https://travis-ci.com/). You can even run a local server to preview your blog (see step 6 below).
2. Clone your repo to your workstation.
3. Install Node.js 10 (current [active LTS](https://github.com/nodejs/Release)). Other distro, see this [guide](https://nodejs.org/en/download/package-manager/) or [here](https://github.com/nodesource/distributions).

```bash
# Installing npm will also install nodejs as dependency.
# Ubuntu 16.04 or newer
$ sudo snap install node --classic --channel=10
# Debian
$ curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
$ sudo apt-get install -y nodejs
# Fedora 29 or newer
$ sudo dnf install npm
# Fedora 28 or older
$ curl --silent --location https://rpm.nodesource.com/setup_10.x | sudo bash -
$ sudo yum -y install nodejs
# Arch Linux
$ sudo pacman -S npm
```

4. Install Hexo and its dependencies (defined in `package.json`). Re-launch the terminal program before continue. After installation, append `node_modules/.bin` to $PATH (skip the `echo` step if you've already {% post_link running-locally-installed-node-packages 'done so' %}).

```bash
$ cd <project>
$ npm install --only=prod
$ echo 'PATH="$PATH:./node_modules/.bin"' >> ~/.profile
```

5. Generate static files to check for any error. You should always do this before pushing/merging commits to the `master` branch.

```bash
$ hexo generate
```

6. (Optional) Start Hexo server on `http://localhost:4000` to preview the blog. ([more info](https://hexo.io/docs/server))

```bash
$ hexo server
```

8. Check the build status by going to your project in [Travis](https://travis-ci.com/). Due to the limitation of `hexo`, the build will always pass even when there is error. Check the Jobs log, look for any error after `$ hexo deploy`. 
9.  If there is no error, the generated website can be accessed on <b>*username*.github.io</b>

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

4. Write your post after the second `---` using [Markdown](https://about.gitlab.com/handbook/product/technical-writing/markdown-guide/) [style](https://docs.gitlab.com/ee/user/markdown.html).

More info: [Writing](https://hexo.io/docs/writing.html)

## Configuration
### Naming
Change the website's author and name
`_config.yml`:

```yml
title:
subtitle:
description:
author:
```

`themes/typing/_config.yml`:

```yml
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

1. Navigate to your repo on GitHub. Go to the **Settings** tab. Change the **Repository name** so your blog is available at <b>username.github.io/*repository*</b>,  **repository** can be any name, like *blog* or *hexo*.
1. Edit **_config.yml**, change the `root:` value to the name.
1. Commit and push.

## Useful links:
Configuration files for this blog deployment:

- [.gitlab-ci.yml](https://gitlab.com/curben/blog/blob/master/.gitlab-ci.yml) *for GitLab Pages deployment only*
- [_config.yml](https://gitlab.com/curben/blog/blob/master/_config.yml)
- [package.json](https://gitlab.com/curben/blog/blob/master/package.json)
- [netlify.toml](https://gitlab.com/curben/blog/blob/master/netlify.toml) *for Netlify deployment only*

More info:

- [Hexo Docs](https://hexo.io/docs/)
- [GitHub Pages](https://help.github.com/categories/github-pages-basics/)
- [Travis CI Docs](https://docs.travis-ci.com/user/tutorial/)
