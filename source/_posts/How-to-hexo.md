---
title: Create a Hexo blog using GitLab Pages
date: 2018-09-21 00:00:00
tags:
---
Create a website/blog (hosted by [GitLab](https://about.gitlab.com/features/pages/) for free) using the following guide:
<!-- more -->
## Create a new GitLab project
1. Register a free [GitLab](https://gitlab.com/users/sign_in#register-pane) account or use your current one.
2. Fork this project.
3. Ensure Shared Runners is enabled. Go to your (forked) project `Settings -> CI / CD -> Shared Runners`.
4. Change project website to a user website. This is so that the website's home page is `<your-username>.gitlab.io/`, instead of `<your-username>.gitlab.io/hexo`.
    Go to `Settings -> General -> Advanced -> Rename repository`. Change the Path to `<your-username>.gitlab.io`.
5. If you just want to use a similar layout as this blog, or you're not planning to customize it, you don't have to [install](#installation) Hexo. You still need to change the blog's name and favicon though ([how-to](#naming).
	Having Hexo makes it easier for you to debug, rather than relying entirely on the GitLab runner.
	1. To create a new post (*without* using [Hexo](https://hexo.io/docs/writing)), create a new `<post-title>.md` in the [source/_posts](source/_posts) folder.
	2. Start with the following header/[front-matter](https://hexo.io/docs/front-matter):
	```
	---
	title: Test page
	date: yyyy-mm-dd hh:mm:ss
	tags:
	categories:
	---
	```
	3. Write your post after the second `---` using [Markdown](https://about.gitlab.com/handbook/product/technical-writing/markdown-guide/) [style](https://docs.gitlab.com/ee/user/markdown.html).
6. After you create a new post, the website would be available on `<your-username>.gitlab.io/` or the link shown on your project `Settings -> Pages`.

## Installation
1. Clone this project to your workstation. Change `<folder>` to a preferred name.
```bash
$ git clone https://gitlab.com/curben/curben.gitlab.io <folder>
```
2. Install Node.js.
```bash
# Installing npm will also install nodejs as dependency.
# Ubuntu/Debian
$ sudo apt-get install npm
# Fedora/Red Hat
$ sudo yum install npm
# Arch Linux
$ sudo pacman -S npm
```
3. Install Hexo and its dependencies (defined in [package.json](package.json)).
```bash
$ sudo npm install -g hexo-cli
$ cd <folder>
$ npm install
```
4. Generate static files to check for any error. You should always do this before pushing/merging commits to the `master` branch.
```bash
$ hexo generate
```
5. Commit the changes and push them. The generated `public` and `node_modules` are [ignored](.gitnore), as GitLab runner will generate them by itself.
6. Check the build status by going to your project `CI /CD -> Pipelines`. Due to the limitation of `hexo`, the build will always pass even when error occurred. Check the Jobs log, look for any error in `$ hexo deploy`. 
7.  If there is no error, the generated website would be available on `<your-username>.gitlab.io/` or the link shown on your project `Settings -> Pages`.

## Writing
1. Create a new post (using Hexo)
``` bash
$ hexo new "My New Post"
```
2. `My-New-Post.md` is saved to the [source/_posts](source/_posts) folder, with the following header/[front-matter](https://hexo.io/docs/front-matter):
```
---
title: My New Post
date: yyyy-mm-dd hh:mm:ss
tags:
categories:
---
```
4. Write your post after the second `---` using [Markdown](https://about.gitlab.com/handbook/product/technical-writing/markdown-guide/) [style](https://docs.gitlab.com/ee/user/markdown.html).

To create a new page or more info: [Writing](https://hexo.io/docs/writing.html)

## Configuration
### Naming
Change the website's author and name
[_config.yml](_config.yml):
```yml
title:
subtitle:
description:
author:
```
[themes/typing/_config.yml](themes/typing/_config.yml):
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
1. Install the generated package to [favicons](themes/typing/source/favicons/) folder.
1. Edit [head.ejs](themes/typing/layout/_partial/head.ejs). Change the `color` values of `mask-icon` and `msapplication-TileColor` to the values you configured on the generator.
1. Check for any error using `hexo generate` (you should do this *before* you push any commit).
1. Commit and push.
1. Check your favicon with the [favicon checker](https://realfavicongenerator.net/favicon_checker).

### Project page
If you prefer to have a project page on GitLab:
1. go to `Settings -> General -> Advanced -> Rename repository`. Change the Path to `<directory>`, so the website is available at `<your-username>.gitlab.io/<directory>`, `<directory>` can be any name, like `blog` or `hexo`.
1. Edit [_config.yml](_config.yml), change the `root:` value from `""` to `"/<directory/"`.
1. Commit and push.

### Remove fork relationship
If you don't have any plan to send merge requests to the upstream, you can remove fork relationship permanently by going to `Settings -> General -> Advanced -> Remove fork relationship`. 

## Useful links:
[Hexo Docs](https://hexo.io/docs/)
[GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/index.html)


