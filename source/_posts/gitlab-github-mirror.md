---
title: Manually mirroring a GitLab repository to GitHub
excerpt: DIY mirroring the native mirroring feature
date: 2020-04-21
tags:
- gitlab
---

GitLab has a native [mirroring feature](https://docs.gitlab.com/ee/user/project/repository/repository_mirroring.html) and supports both pull and push directions; in **pull**, it periodically fetch any changes (including addition or removal of branches) from another location and push them to your GitLab repository, whereas in **push**, it periodically updates of your GitLab repository to the mirrored repository.

I've been using this feature mirror [Hexojs repository](https://github.com/hexojs) to my [GitLab account](https://gitlab.com/curben) as a backup. It works well so far, especially when the repository has multiple branches. However, what if you has a simpler repository setup, like my blog which only has [two branches](https://gitlab.com/curben/blog/-/branches) _and_ you want to get your hands dirty. Let's find out.

## Manually push to mirror

The easiest to sync `origin` location (GitLab repo in this case) to another location (GitHub repo) is to add another remote,

```
$ git remote add mirror https://github.com/<user>/<project>
```

after you push commits to `origin`, push to `mirror` as well.

```
$ git push origin master
# Or `git push -u`

$ git push mirror master
# Enter your GitHub credential
```

### Managing multiple SSH identities

The previous guide assumes HTTP authentication, but what if you (want to) use SSH authentication for both GitLab and GitHub. If you haven't set up SSH authentication yet, read on.

#### Generate and add a new SSH key to GitLab and GitHub

For this guide, I'll be using ED25519 keypair, instead of the default RSA. This SSH keypair will be your **account** SSH key and has the same privilege as a personal access token; it covers all the repo that your account has access to, which is different from **deploy** key also known as _per-repository_ key.

```
$ ssh-keygen -t ed25519 -C 'email@example.com'
# Save the key to /home/user/.ssh/id_gitlab_username
# The email address is only used for label, not authentication
# Enter a password when prompted, that password will be used
# to encrypt the private key
```

Two files `id_gitlab_username.pub` and `id_gitlab_username` will be generated in "~/.ssh" folder; they are public and private key respectively, remember to back them up.

Add the **public** key to your GitLab account in the "SSH Keys" setting. Repeat this step to generate another keypair for your GitHub account, name the file accordingly. The private key is the credential that you will use to authenticate your account.

#### Configure SSH

Create a new file in "~/.ssh/config" with the following content,

```
#github account
Host github.com-username
	HostName github.com
	User git
	IdentityFile ~/.ssh/id_github_username
  Preferredauthentications publickey
	IdentitiesOnly yes

#gitlab account
Host gitlab.com-username
	HostName gitlab.com
	User git
	IdentityFile ~/.ssh/id_gitlab_username
  Preferredauthentications publickey
	IdentitiesOnly yes
```

The `config` and private keys must have `chmod 600` permission, adjust accordingly.

#### Add GitLab and Github as trusted hosts

When connecting to the SSH server for the first time, you will encounter the following message, `The authenticity of host 'gitlab.com (35.231.145.151)' can't be established.`. This is because SSH also verifies the authenticity of the server. To avoid that message, you can import the respective key fingerprints into "~/.ssh/known_hosts".

```
$ ssh-keyscan gitlab.com 2>&1 | grep -vE '^#' > ~/.ssh/known_hosts
$ ssh-keyscan github.com 2>&1 | grep -vE '^#' >> ~/.ssh/known_hosts
```

`2>&1 | grep -vE '^#'` is to remove the comment "# github.com:22 SSH-2.0-babeld-76c80caa".

#### Update remote repository location

The final step is to update the `origin` and `mirror` remote repository locations.

```
$ git remote set-url origin git@gitlab.com-username:username/project.git
$ git remote set-url mirror git@github.com-username:username/project.git
```

It's a good practice to verify the values,

```
$ git remote -v
mirror	git@github.com-username:username/project.git (fetch)
mirror	git@github.com-username:username/project.git (push)
origin	git@gitlab.com-username:username/project.git (fetch)
origin	git@gitlab.com-username:username/project.git (push)
```

Next time you push or pull from the repository, you will be prompted with a password that you previously set during `ssh-keygen`, to decrypt your private key and authenticate your account.

### Use multiple origin location (alternative)

Alternatively, a [neat trick](https://stackoverflow.com/a/12795747) I found is that you could also add _multiple_ locations to the `origin`, so that whenever you push the commits, git will automatically push to all locations. This shortcut also applies to SSH authentication.

```
$ git remote set-url origin --push --add https://gitlab.com/<username>/<project>
$ git remote set-url origin --push --add https://github.com/<username>/<project>
```

The first command will _replace_ the default push location of `origin` and only the second command onward will add a new location, so make sure you add both GitLab and GitHub.

As always, verify it.

```
$ git remote -v
origin	https://gitlab.com/curben/blog.git (fetch)
origin	https://gitlab.com/curben/blog.git (push)
origin	https://github.com/curben/blog.git (push)
```

## Push to mirror using GitLab CI

Part of this guide is also found in my previous post, [Using Git and Git+SSH in GitLab CI](/blog/2019/10/03/git-ssh-gitlab-ci#mirror-gitlab-to-github), this time I add more explanation for clarity.

The first thing is to set up a **deploy** key, a public key set in the targeted GitHub repository, in which its private key counterpart will be used by GitLab to authenticate to the GitHub. Deploy key is a _per-repository_ key, thus applies only to a repository; this effectively isolate the privilege of the key, compromise of a deploy key would not affect other repositories, unlike account key or personal access token which affects _all_ of your repo. Nothing stops you from using the same deploy key on multiple repos, but that practice is highly discouraged.

In this use case, since deploy key will only be used in a CI environment, it is not necessary to save it "~/.ssh" folder--you would use your account SSH key to authenticate from your workstation. I use "~/Desktop" folder here as it would be easier to locate the keypair when configuring the CI. As always, **backup** your SSH key.

```
$ ssh-keygen -t ed25519 -C 'email@example.com'
# Save the key to /home/user/Desktop/id_github_repo
# The email address is only used for label, not authentication
```

Two files `id_github_repo.pub` and `id_github_repo` will be generated in "~/Desktop" folder; they are public and private key respectively, remember to back them up.

On your GitHub repository (that will mirror your GitLab repository), go to **Settings** -> **Deploy keys** -> **Add deploy key**, paste the content of `id_github_repo.pub` and tick **Allow write access**.

![Deploy key](20200421/deploy-key.png)

On your GitLab repository, navigate to **Settings** -> **CI / CD** -> **Variables**, add a new Var variable named `GH_PRIVATE_KEY` and add the content of `id_github_repo`, make sure **Protect variable** is ticked so that the key is only imported to the "master" branch (which is a protected branch by default).

![CI variable](20200421/ci-variable.png)

Add another Var variable named `SSH_KNOWN_HOSTS` and the output of `ssh-keyscan github.com 2>&1 | grep -vE '^#'`. I explained the necessity of this step in [previous section](#Add-GitLab-and-Github-as-trusted-hosts).

Add a new job named `mirror` in your repository's **.gitlab-ci.yml**. Optionally, you could move _Import SSH key_ step to `before_script` if preferred, it does not make any practical difference. However, if you want to use _Update GitHub mirror_ step in `after_script`, _Import SSH key_  has to be moved there as well--`before_script` and `script` are executed in the same shell, while `after_script` is executed in a [_different_ shell](https://docs.gitlab.com/ee/ci/yaml/#before_script-and-after_script).


``` yml
image: node:alpine

mirror:
  before_script:
    # Install prerequisites
    - 'which ssh-agent || (apk update && apk add openssh-client git)'

  script:
    ## Import SSH key
    # Launch ssh-agent
    - eval $(ssh-agent -s)
    # Add private key from CI variable
    - echo "$GH_PRIVATE_KEY" | tr -d '\r' | ssh-add - > /dev/null
    # Create ~/.ssh folder if not exist
    - mkdir -p ~/.ssh
    # Restrict the folder privilege
    - chmod 700 ~/.ssh
    # Add GitHub key fingerprint
    - echo "$SSH_KNOWN_HOSTS" > ~/.ssh/known_hosts
    - chmod 644 ~/.ssh/known_hosts

    ## Update GitHub mirror
    # ssh connect to GitHub
    - ssh -T git@github.com || ":" # workaround) force exit code 0
    # Add a new remote location called "mirror"
    - git remote add mirror git@github.com:curbengh/blog.git
    # Discard changes before checking out branch
    - git reset HEAD --hard
    # Push "master" branch
    - git checkout master && git push mirror master
    # Uncomment below to push other branch(es), change "branchX" according to your need
    #- git checkout branchX && git push mirror branchX

  rules:
    # Only trigger through push event in master branch
    - if: '$CI_COMMIT_REF_NAME == "master" && $CI_PIPELINE_SOURCE == "push"'
      when: always
    # Only trigger through "Run pipeline" in master branch
    - if: '$CI_COMMIT_REF_NAME == "master" && $CI_PIPELINE_SOURCE == "web"'
      when: always
```

