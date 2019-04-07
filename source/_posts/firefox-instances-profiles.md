---
title: How to run more than one Firefox instance
date: 2019-04-07 00:00:00
tags:
- Firefox
- Privacy
---

Running more than one Firefox instance allows you to use multiple cookies for a website. By default, you are limited to two separate cookies through *regular* and *private* windows. Using Firefox's **profiles**, you can use more than two.

<!-- more -->

For example, you are looking for item A and B at a shopping website using the private window but you prefer to keep the browsing separate as not to let the website knows that you are browsing both of them. Or you want to login to more than two accounts of a website.

A useful feature of Firefox is that it allows more than one profile, which otherwise would requires multiple operating system accounts. The feature even allows you to run multiple profiles at the same time by having multiple instances.

{% cloudinary 20190407/firefox-error.png %}

There are two ways of creating profiles: (1) **Fresh** profile and (2) **Clone** existing profile.

## Fresh profile

1. Create a new profile by running the following command:

```
firefox --no-remote -P 'new profile name'
```

2. Click "Create Profile...".

{% cloudinary 20190407/profile-manager.png %}

3. Click "Next".

{% cloudinary 20190407/profile-wizard.png %}

4. Name the new profile and click "Finish".

{% cloudinary 20190407/new-profile-name.png %}

5. Once you are back to the profile manager, select "default", make sure "Use the selected profile..." and "Start Firefox".

{% cloudinary 20190407/profile-manager-new.png %}

6. Launch Firefox with the newly created profile using the same command as above:

```
firefox --no-remote -P 'new profile name'
```

***Protip***: Create a launcher or keyboard shortcut to run the command.

{% cloudinary 20190407/launcher.png %}

7. Just launch Firefox as usual for your current profile.

## Clone profile

1. Notice the directory shown in step 4 in previous section, that is where profile(s) is stored.
2. Browse to the **~/.mozilla/firefox** folder
3. To clone the default profile, simply select the xxxx.default and duplicate it by **Edit: -> Duplicate**, or copy to another folder, rename and move it back. Rename the cloned folder to desired name. In this example, I named it as *profile z*.

{% cloudinary 20190407/profile-folder.png %}

4. Append the following line to **profiles.ini**, if there is no existing profile (other than the default), use `[Profile1]` instead.

```
[Profile2]
Name=Profile Z
IsRelative=1
Path=profile z
```

{% cloudinary 20190407/profiles-ini.png %}

5. Launch Firefox with the newly created profile using the same command as above (note the case-sensitive):

```
firefox --no-remote -P 'Profile Z'
```