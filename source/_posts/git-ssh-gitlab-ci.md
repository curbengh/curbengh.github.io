---
title: Using Git and Git+SSH in GitLab CI
excerpt: Guides and potential pitfalls
date: 2019-10-03
lastUpdated: 2020-04-18
tags:
- gitlab
---

I recently made a significant overhaul to the (GitLab, GL) [CI config](https://gitlab.com/curben/urlhaus-filter/blob/master/.gitlab-ci.yml) of [urlhaus-filter](https://gitlab.com/curben/urlhaus-filter) and learned a few things along the way.

## New host-based blocklist

As a starter, urlhaus-filter is a malware websites blocklist for uBlock Origin (uBO), with dataset sourced from [URLHaus](https://urlhaus.abuse.ch/). I recently added a new [host-based blocklist](https://gitlab.com/curben/urlhaus-filter#host-based-blocklist) that is compatible with host-based blocker (like PiHole), after a user [raised](https://gitlab.com/curben/urlhaus-filter/issues/5) the incompatibility issue. I previously made an erroneous listing on [FilterLists](https://filterlists.com/) (where most users discovered this blocklist, I believe), specifically I set the syntax as ["Domains"](https://github.com/collinbarrett/FilterLists/blob/6efb427042aad47a17ed06bafd970004dc675551/data/Syntax.json#L8-L9), instead it should be ["URLs"](https://github.com/collinbarrett/FilterLists/blob/6efb427042aad47a17ed06bafd970004dc675551/data/Syntax.json#L32-L33).

Specifying the correct syntax is essential because FilterLists would show a domain-based blocklist being compatible with PiHole (or any other host-based blocker), in addition to uBO (which supports domain and URL). I'm not sure whether PiHole can parse the domain from a URL filter, perhaps it can, but the incompatibility issue actually stemmed from the use of Adblock Plus (ABP) [syntax](https://help.eyeo.com/en/adblockplus/how-to-write-filters#special-comments) in the blocklist—exclamation mark (!) as comment. The [fix](https://gitlab.com/curben/urlhaus-filter/merge_requests/5) is actually trivial; in the final build step of the usual bloclist, malware domains are concatenated with malware URLs (of well-known domains), so I simply don't concatenate the URLs into the host-based blocklist and uses hash sign (#) as comment. The resulting blocklist doesn't have `Expires` directive like in ABP syntax, I don't know if PiHole supports it.

## Mirror GitLab to GitHub

After resolving that issue, I figured I might as well add GitHub (GH) mirroring. I've always wanted to mirror the urlhaus-filter ([GL](https://gitlab.com/curben/urlhaus-filter)) to GH, so that the blocklist can also be served via GitCDN and jsDelivr, in addition to [existing](https://gitlab.com/curben/urlhaus-filter#subscribe) CDNs that support GL. But GH doesn't have native repo mirroring feature, so it needs to be done manually, whereas GL, Gitea and [Repo.or.cz](https://repo.or.cz/) have this feature. I did clone the repo into GH months ago, but I never bothered to figure out how to update it, until now.

The initial idea is to use Travis CI to update mirror. But this approach poses an issue. If Travis config is added to the mirrored repo, source repo would have different commit history with the mirrored repo, so it's no longer a _mirror_. I could add it to the source repo instead. Then, I noticed `git push` (an alias of `git push origin master`) in the current CI, so I figured why not I just add GH as a remote/tracking repository and push the commit to it.

Since the GH mirror is already updated, I reset it and re-clone using this [guide](https://blog.cadena-it.com/linux-tips-how-to/how-to-properly-mirror-a-git-repository/). I think "Import by URL" works as well. I set up an SSH deploy key (public key) on GH and add the corresponding private key as a GL CI variable.

``` sh
$ ssh-keygen -t ed25519 -C "git@github.com"
```

``` yml
  before_script:
    - eval $(ssh-agent -s) # Requires openssh-client
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add - > /dev/null # existing GL deploy key
    - echo "$GH_PRIVATE_KEY" | tr -d '\r' | ssh-add - > /dev/null
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - echo "$SSH_KNOWN_HOSTS" > ~/.ssh/known_hosts # $SSH_KNOWN_HOSTS is output of "ssh-keyscan gitlab.com github.com"
    - chmod 644 ~/.ssh/known_hosts
```

To push it GitHub,

``` yml
  script:
    - ssh -T git@github.com || ":"
    - git remote add mirror git@github.com:user/project.git
    - git push mirror master
```

`-T` is necessary because Git hosting usually don't provide interactive session/shell access. `|| ":"` is an interesting one; somehow even with the `-T`, the ssh will exit with the following message,

```
Hi user! You've successfully authenticated, but GitHub does not provide shell access.
```

and _non-zero_ code, meaning the CI will stop after ssh and not run the subsequent git operations. SSH authenticate with GL doesn't have this issue. The `":"` command is a workaround to [force exit code 0](https://unix.fandom.com/wiki/Force_exit_code_0), the quote is to escape the semicolon in YML.

Note that if you push any commit to GL (aside from the CI), remember to push it to GH as well; remember, commit history must sync. It's not an issue for because, in the context urlhaus-filter, the blocklist update is already automated, the only manual work is adding/removing false positive or changing the CI process which I rarely need to. Besides, I also noticed it is possible for git `origin` to have [multiple locations](https://stackoverflow.com/a/12795747), so any commit can be automatically pushed to backup/mirror repository, but I haven't found any use of it yet.

_Edit:_ you could also use GitLab [**push** mirroring](https://docs.gitlab.com/ee/user/project/repository/repository_mirroring.html#pushing-to-a-remote-repository-core) feature.

## Removed git clone step

I got the `git remote add mirror` step from this [gist](https://gist.github.com/developius/c81f021eb5c5916013dc). That step made me realise that `git clone --depth 3 git@gitlab.com:curben/urlhaus-filter.git build` may not be necessary. Before the overhaul, I adapted the git cloning step from the [official example](https://gitlab.com/gitlab-examples/ssh-private-key/). It basically downloads the repo with SSH authentication. This is in addition to `git fetch` that is executed by default. So, the CI essentially downloads the repo twice. But, urlhaus-filter repo is public, cloning the repo doesn't require authentication. So, I proceeded to take out the git clone and replaced with:

``` yml
  script:
    - ssh -T git@gitlab.com
    - git remote set-url origin git@gitlab.com:curben/urlhaus-filter.git
    - git push origin master
```

But it didn't go smoothly, the changes got committed but not pushed. I checked the [job log](https://gitlab.com/curben/urlhaus-filter/-/jobs/309839816) and found error message,

```
error: src refspec master does not match any
```

scrolling up a few lines, I noticed,

```
[detached HEAD d6aa685] Filter updated: Wed, 02 Oct 2019 12:12:29 UTC
```

That's unusual, it should be `[master d6aa685]`.

Moving up a bit more,

```
From https://gitlab.com/curben/urlhaus-filter
 * [new branch]      master     -> origin/master
```

"new branch"? Then I remembered there are two Git strategies: `git fetch` (default) and `git clone`. Git fetch will results in [detached HEAD](https://www.atlassian.com/git/tutorials/syncing/git-fetch) state, since it doesn't merge the new commits, unlike `git pull`. The fix is to simply `git checkout master` before `git commit`.

Anyhow, removing the redundant git clone step, while it did simplify the CI, it didn't actually result in faster build (at least not significantly). This is because I used shallow cloning, which only downloads the most recent commits.

## Pipeline status badge

Another build step I updated is the CI status badge. The default pipeline badge does not work for me because the CI pushes a _new_ commit to the repo and the badge is the status of _previous_ commit, so it's always outdated. I attempted a workaround by grabbing a custom [badge](https://shields.io/) with success/failed message and save it as a GL Pages artifact. That didn't work due to similar situation with the pipeline badge. The artifact corresponds to the current HEAD, when the new commit is pushed, it becomes outdated and [not deployed](https://gitlab.com/gitlab-org/gitlab/issues/29257).

Due to the limitations, I push the badge to the repo instead.

``` yml
  script:
    - wget https://img.shields.io/badge/pipeline-passed-success.svg -O .gitlab/status.svg
    - git add .gitlab/status.svg
    - git diff-index --quiet HEAD || git commit -m "Success pipeline"
```

`git diff-index` checks whether there is any file difference and only runs `git commit` if there is. It will exit code 0 and skip commit if there is none to commit.

## SSH in after_script

The final change I did was moving the ssh and commit push steps to `after_script` phase as I don't need authenticated cloning. The move is also necessary because [ssh-agent exits](https://gitlab.com/gitlab-org/gitlab-runner/issues/1926) after `script` phase. So, if the ssh is initialised in `before_script` or `script`, it needs to initialise again in `after_script`.

``` yml
  before_script:
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add - > /dev/null

  script:
    - #some commands

  after_script:
    # Need to run ssh-agent and add private key again.
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add - > /dev/null
```
