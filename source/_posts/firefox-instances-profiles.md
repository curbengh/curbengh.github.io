---
title: How to run more than one Firefox instance
excerpt: Using Firefox profiles, you can use more than two instances.
date: 2019-04-07
updated: 2019-08-09
tags:
- firefox
- privacy
---

Running more than one Firefox instance allows you to use multiple cookies for a website. By default, you are limited to two separate cookies through *regular* and *private* windows. Using Firefox's **profiles**, you can use more than two.

For example, you are looking for item A and B at a shopping website using the private window but you prefer to keep the browsing separate as not to let the website knows that you are browsing both of them. Or you want to login to more than two accounts of a website.

**Edit:** Similar functionality can be achieved by using [Multi-Account Containers](#multi-account-containers).

A useful feature of Firefox is that it allows more than one profile, which otherwise would requires multiple operating system accounts. The feature even allows you to run multiple profiles at the same time by having multiple instances.

!['Firefox is currently running' error](20190407/firefox-error.png)

There are two ways of creating profiles: (1) **Fresh** profile and (2) **Clone** existing profile.

## Fresh profile

1. Create a new profile by running the following command:

```
firefox --no-remote -P 'new profile name'
```

2. Click "Create Profile...".

![Firefox Profile Manager](20190407/profile-manager.png)

3. Click "Next".

![Wizard to set up new Firefox profile](20190407/profile-wizard.png)

4. Name the new profile and click "Finish".

![Name the new Firefox profile](20190407/new-profile-name.png)

5. Once you are back to the profile manager, select "default", make sure "Use the selected profile..." and "Start Firefox".

![Firefox Profile Manager with a recently added profile](20190407/profile-manager-new.png)

6. Launch Firefox with the newly created profile using the same command as above:

```
firefox --no-remote -P 'new profile name'
```

***Protip***: Create a launcher or keyboard shortcut to run the command.

![Create a new launcher for the Firefox profile](20190407/launcher.png)

7. Just launch Firefox as usual for your current profile.

## Clone profile

1. Notice the directory shown in step 4 in previous section, that is where profile(s) is stored.
2. Browse to the **~/.mozilla/firefox** folder
3. To clone the default profile, simply select the xxxx.default and duplicate it by **Edit: -> Duplicate**, or copy to another folder, rename and move it back. Rename the cloned folder to desired name. In this example, I named it as *profile z*.

![List of folders in ~/.mozilla/firefox](20190407/profile-folder.png)

4. Append the following line to **profiles.ini**, if there is no existing profile (other than the default), use `[Profile1]` instead.

```
[Profile2]
Name=Profile Z
IsRelative=1
Path=profile z
```

![profile.ini in a text editor](20190407/profiles-ini.png)

5. Launch Firefox with the newly created profile using the same command as above (note the case-sensitive):

```
firefox --no-remote -P 'Profile Z'
```

## Multi-Account Containers

Multi-Account Containers is a built-in feature introduced since Firefox 50, but disabled by default (as of Firefox 68). Follow this link [[wiki.mozilla.org]](https://wiki.mozilla.org/Security/Contextual_Identity_Project/Containers) for instruction and more details.

Quick start: Go to `about:config`

```
privacy.userContext.enabled;true
privacy.userContext.ui.enabled;true
privacy.userContext.longPressBehavior;2
```

The feature is also available through [an add-on](https://addons.mozilla.org/en-US/firefox/addon/multi-account-containers/). The add-on offers the ability to assign a site to a specific container, so that a website will always open in a specified container.

![Assign a site to a container](20190407/open-site-container.png)
