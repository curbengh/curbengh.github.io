---
title: Secure node modules with Snyk
date: 2018-10-01
lastUpdated: 2019-03-09
tags:
- Node
- Snyk
- Security
---
## Intro
> Click [here](#Installation) to go straight to installation guide.

Node.js is infamous for the [left-pad](https://medium.com/commitlog/the-internet-is-at-the-mercy-of-a-handful-of-people-73fac4bc5068) [controversy](https://blog.npmjs.org/post/141577284765/kik-left-pad-and-npm), removing just a single package can break many websites. 

The package dependency can also cause security issue ([example 1](https://eslint.org/blog/2018/07/postmortem-for-malicious-package-publishes), [example 2](https://blog.npmjs.org/post/173526807575/reported-malicious-module-getcookies)).

Say you use Package A, which depends on Package B, which depends on Package C and so on.
```
A > B > C > D > E
```
What if Package A uses outdated version of Package B?

If newer version(s) of Package A has updated its `package.json` to use updated version of Package B, you simply update your `package.json` to update Package A.

What if Package A is no longer maintained? You can fork its repo, update the package and re-publish under a new name. For example, hexo-autonofollow uses [vulnerable](https://snyk.io/test/npm/hexo-autonofollow) version of cheerio, hexo-filter-nofollow [updates](https://github.com/SukkaW/hexo-filter-nofollow/commit/ff122123f08d1765ab3272303914d8a29e0bcd7f) it.

If you have time to fork and more importantly fix any compatibility issue ([example](https://github.com/mamboer/hexo-filter-cleanup/commit/8d9f2da8276652ef270e943dbf9dcb648e14ed55)), why not?

Now, what if E is vulnerable? For example, [hexo-fs](https://snyk.io/test/npm/hexo-fs) package has a vulnerability introduced by [chownr](https://snyk.io/vuln/npm:chownr:20180731) package. The dependency path is `hexo-fs@0.2.3 › chokidar@1.7.0 › fsevents@1.2.4 › node-pre-gyp@0.10.3 › tar@4.4.6 › chownr@1.1.1`.

So, you fork, fix it and republish with a new name. Cool. Here comes the fun part, you also need to instruct tar to go for the *renamed* package. Fork, fix and republish. Repeat this for all the packages along the path.

## Installation
Practically, you can use Snyk to patch it, *if* possible like this [hexo-all-minifier](https://snyk.io/test/npm/hexo-all-minifier). Snyk is [free](https://snyk.io/plans) for open-source projects. Much like any other security products, Snyk is not a silver bullet to the NodeJS issue. Some like [hexo-fs](https://snyk.io/test/npm/hexo-fs) can't be fixed (at the time of writing).

1. [Sign up](https://app.snyk.io/signup) for a new Snyk account.
2. Snyk only supports [SSO](https://en.wikipedia.org/wiki/Single_sign-on), no e-mail sign up. You need to have GitHub, Bitbucket, or Google account. It can be a separate account from your current GitHub account. Linking your current GitHub repo to Snyk is *optional*. 
3. Once you signed up, go to your account setting, grab the API token and save it in your password manager (or somewhere safe).
{% cloudinary 20181001/snyk-api.png %}
4. Install Snyk, 
```bash
$ npm install snyk
# Add 'node_modules/.bin' to $PATH, if you haven't done so. Check ~/.profile before running the following command.
$ echo 'PATH="$PATH:./node_modules/.bin"' >> ~/.profile
```
5. `cd` into your repo folder.
6. Login to Snyk, `$ snyk auth`. Snyk website will pop-up.
7. Once authenticated, you can start to use it.
8. Test for vulnerability, `$ snyk test`.
9. If there is any vulnerability, run `$ snyk wizard`.
10. Snyk will prompt you for a possible action (update, patch or ignore).
11. Snyk will ask if you want to add its commands to `package.json`. This allows Snyk to check every time you `$ npm install`. I don't add it because it doesn't play nice with CI.
12. `.snyk` file will be created. You can review it in a text editor.
13. If fix is available, run `$ snyk protect`.
14. In step 10, if you choose to ignore, Snyk will ignore the issue for 30 days by default (even after you run `snyk test`. Once elapsed, `$ snyk test` will say there is vulnerability again (and fail your build/CI). If you find it annoying, you can delay the expiry date in `.snyk`.
15. Lastly, link the project to your Snyk account, `$ snyk monitor`. Your project will shows up at your Snyk account. Go to the project setting and add your github repo link. This is necessary to remove usage quota for open-source projects.
16. Optional: add `snyk test`, `snyk protect` and `snyk monitor` commands to your CI script to protect your CI build image.

***Attention:*** Snyk depends on GNU version of `patch` utility, so you need to install it if the CI build environment is Alpine or BSD. Otherwise, `snyk protect` won't work. Read my {% post_link snyk-patch-alpine-docker 'newer post' %} for more info.

***Edit:*** Snyk [v1.131.0](https://github.com/snyk/snyk/releases/tag/v1.131.0) onwards no longer use `patch`.

Alternatively, you could integrate directly to your remote repo (github/gitlab). This integration allows Snyk to automatically create pull/merge request. Enable this by going to your Snyk account and Integrations tab.

{% cloudinary 20181001/snyk-integration.png %}

More info: [NodeJS](https://snyk.io/docs/snyk-for-nodejs), [GitHub](https://snyk.io/docs/github), [GitLab](https://snyk.io/docs/gitlab)
