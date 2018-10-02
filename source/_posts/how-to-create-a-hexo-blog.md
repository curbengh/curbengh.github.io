---
title: How to create a Hexo blog
date: 2018-09-21 00:00:00
tags:
---
Create a website/blog (hosted by [GitLab](https://about.gitlab.com/features/pages/) for free) using the following guide:
<!-- more -->
## GitLab project
1. Register a free [GitLab](https://gitlab.com/users/sign_in#register-pane) account or use your current one.
2. Fork this project.
3. Shared Runners should be enabled. Go to your (forked) project `Settings -> CI / CD -> Shared Runners`.
4. Change project website to a user website. This is so that the website's home page is `<your-username>.gitlab.io/`, instead of `<your-username>.gitlab.io/hexo`.
    Go to `Settings -> General -> Advanced -> Rename repository`. Change the Path to `<your-username>.gitlab.io`.
5. You can start writing a new post straightaway without [installing](#installation) Hexo. You still need to change the blog's name and favicon though ([how-to](#naming)).
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
	3. Write your post after the second `---` using [Markdown](https://about.gitlab.com/handbook/product/technical-writing/markdown-guide/) [style](https://docs.gitlab.com/ee/user/markdown.html).
6. After you create a new post, the website can be accessed on `<your-username>.gitlab.io/` or the link shown on your project `Settings -> Pages`.

## Installation
1. Having Hexo means you can debug locally, rather than waiting for [CI](https://docs.gitlab.com/ee/ci/). You can even run a local server to preview your blog (see step 6 below).
2. Clone this project to your workstation. Change `<folder>` to a preferred name.
```bash
$ git clone https://gitlab.com/curben/curben.gitlab.io <folder>
```
3. Install Node.js 10. Other distro, see this [guide](https://nodejs.org/en/download/package-manager/) or [here](https://github.com/nodesource/distributions).
```bash
# Installing npm will also install nodejs as dependency.
# Ubuntu 16.04 or newer
$ sudo snap install node --classic --channel=10
# Debian
$ curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
$ sudo apt-get install -y nodejs
# Fedora 29
$ sudo dnf install npm
# Fedora 28 or older
$ curl --silent --location https://rpm.nodesource.com/setup_10.x | sudo bash -
$ sudo yum -y install nodejs
# Arch Linux
$ sudo pacman -S npm
```
4. Install Hexo and its dependencies (defined in `package.json`). Re-launch the terminal program before continue.
```bash
$ cd <folder>
$ sudo npm install -g hexo-cli
$ npm install
```
5. Generate static files to check for any error. You should always do this before pushing/merging commits to the `master` branch.
```bash
$ hexo generate
```
6. (Optional) Start Hexo server on localhost:4000 to preview the blog. ([more info](https://hexo.io/docs/server))
```bash
$ npm install hexo-server --save
$ hexo server
```
7. Commit the changes and push them. The generated `public` and `node_modules` are [ignored](https://gitlab.com/curben/curben.gitlab.io/blob/master/.gitignore), as CI will generate them during build.
	1. I have migrated to [Netlify](https://www.netlify.com/) and removed my GitLab page.
	2. Since I don't have a gitlab page anymore, I removed the deploy command in the `.gitlab-ci.yml`.
	3. The config now has two parts. To use in gitlab page, simply uncomment the second part and comment out the first part.
	4. Make sure you double-check the CI config before you push.
8. Check the build status by going to your project `CI /CD -> Pipelines`. Due to the limitation of `hexo`, the build will always pass even when there is error. Check the Jobs log, look for any error after `$ hexo deploy`. 
9.  If there is no error, the generated website can be accessed on `<your-username>.gitlab.io/` or the link shown on your project `Settings -> Pages`.

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

To create a new page or more info: [Writing](https://hexo.io/docs/writing.html)

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
1. go to `Settings -> General -> Advanced -> Rename repository`. Change the Path to `<directory>`, so the website is available at `<your-username>.gitlab.io/<directory>`, `<directory>` can be any name, like `blog` or `hexo`.
1. Edit `_config.yml`, change the `root:` value from `""` to `"/<directory>/"`.
1. Commit and push.

### Remove fork relationship
If you don't have any plan to send merge requests to the upstream, you can remove fork relationship permanently by going to `Settings -> General -> Advanced -> Remove fork relationship`. 

## Useful links:
[Hexo Docs](https://hexo.io/docs/)
[GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/index.html)
