curben.gitlab.io
================

![Build Status](https://gitlab.com/curben/curben.gitlab.io/badges/master/pipeline.svg)

Forked from GitLab's [Hexo](https://gitlab.com/pages/hexo) example with [Typing](https://github.com/geekplux/hexo-theme-typing) theme.

## Installation (GitLab Pages only)
1. Fork this project.
1. Make sure Shared Runners is enabled. Go to your (forked) project `Settings -> CI / CD -> Shared Runners`.
1. Change project website to a user website, so the website's home page is available at `<your-username>.gitlab.io/`, instead of `<your-username>.gitlab.io/hexo`.
    Go to `Settings -> General -> Advanced -> Rename repository`. Change the Path to `<your-username>.gitlab.io`.
1. Clone this project to your workstation. Change `<folder>` to a preferred name.
```bash
git clone https://gitlab.com/curben/curben.gitlab.io <folder>
```
1. Install Node.js.
```bash
# Installing npm will also install nodejs as dependency.
# Ubuntu/Debian
sudo apt-get install npm
# Fedora/Red Hat
sudo yum install npm
# Arch Linux
sudo pacman -S npm
```
1. Install Hexo and its dependencies (defined in [package.json](package.json)).
```bash
sudo npm install -g hexo-cli
cd <folder>
npm install
```
1. Edit [README.md](README.md) and make whatever changes, can be just a word.
1. Generate static files to check for any error. You should always do this before pushing/merging commits to the `master` branch.
```bash
hexo generate
```
1. Commit the changes and push them. The generated `public` and `node_modules` are [ignored](.gitnore), as GitLab runner will generate itself.
1. Check the build status by going to your project `CI /CD -> Pipelines`. Due to the limitation of `hexo`, the build will always pass even when error occurred. Check the Jobs log, look for any error in `$ hexo deploy`. 
1.  If no error, the generated website would be available on `<your-username>.gitlab.io/` or the link shown on your project `Settings -> Pages`.
1. Follow this [guide](https://hexo.io/docs/writing) to create a new post or a new page.

## Configuration

### Favicon (recommended)
[RealFaviconGenerator](https://realfavicongenerator.net/) provides a web-based tool to generate favicons with wide compatibility.
1. Upload your favicon (at least 260x260) and configure however you want.
1. Install the generated package to [favicons](themes/typing/source/favicons/) folder.
1. Edit [head.ejs](themes/typing/layout/_partial/head.ejs). Change the `color` values of `mask-icon` and `msapplication-TileColor` to the values you configured on the generator.
1. Check for any error using `hexo generate` (you should do this *before* you push any commit).
1. Commit and push.
1. Check your favicon with the [favicon checker](https://realfavicongenerator.net/favicon_checker).

### Project page (optional)
If you prefer to have a project page on GitLab
1. go to `Settings -> General -> Advanced -> Rename repository`. Change the Path to `<directory>`, so the website is available at `<your-username>.gitlab.io/<directory>`, `<directory>` can be any name, like `blog` or `hexo`.
1. Edit [_config.yml](_config.yml), change the `root:` value from `""` to `"/<directory/"`.
1. Commit and push.

### Remove fork relationship (optional)
If you don't have any plan to send merge requests to the upstream, you can remove fork relationship permanently by going to `Settings -> General -> Advanced -> Remove fork relationship`. 

## Changes
The following are the major changes I made from the upstream.
### Hexo
- Update [.gitlab-ci.yml](.gitlab-ci.yml) to use the latest version of [Node.js](https://hub.docker.com/_/node/) in the Docker image.
- Update [package.json](package.json) to use latest version of [hexo](https://www.npmjs.com/package/hexo) and its related packages.
- Replace the bundled Landscape theme with Typing theme.

### Typing theme
- Homepage shows index of posts.
- Remove header and footer display (except for `/about` page).
- Use the latest version of [jQuery](https://jquery.com/download/), [fancyBox](https://github.com/fancyapps/fancyBox/releases) and [Font Awesome](https://github.com/FortAwesome/Font-Awesome/releases)
- All js and css files are self-hosted.
- Remove analytic, comment system and donation links.

---
Useful links:
[Hexo Docs](https://hexo.io/docs/)
[GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/index.html)

