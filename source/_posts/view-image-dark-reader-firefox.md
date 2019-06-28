---
title: Image view is broken when using Dark Reader
subtitle: Use this workaround to view the whole image.
date: 2019-06-28
tags:
- firefox
- firefox-ext
---

When using Dark Reader (DR) add-on with "Filter" or "Filter+" mode in Firefox (FF 67 as of writing), you may encounter this issue where only the lower half of an image is shown.

{% cloudinary '20190628/dark-reader-before.png' 'Image is only shown half' %}

To resolve it, add the following CSS rule to the DR's setting via **Dev tools**. Prepend before the site-specific rules.

```css
@media not print {
  img {
    bottom: auto;
  }
}
```

{% cloudinary '20190628/dark-reader-dev-tools.png' 'Dev tools of Dark Reader' %}

{% cloudinary '20190628/dev-tools-video.webp' 'A video of Dev Tools' %}

After adding the CSS, you should be able to see the whole image. But the fix is not perfect, the image sticks to the top rather than centred.

{% cloudinary '20190628/dark-reader-after.png' 'Full image is shown' %}

The above CSS is to override the default CSS used by FF to display an image. The default CSS is located at `resource://content-accessible/TopLevelImageDocument.css`, accessible via Style Editor (Shift + F7, don't enable Caret Browsing when prompted). It's used to centre the image. Here is a snippet of "TopLevelImageDocument.css",

```css
@media not print {
  body {
    margin: 0;
  }

  img {
    text-align: center;
    position: absolute;
    margin: auto;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
```

The `bottom: 0;` rule is the source of the issue, though it's more of a compatibility issue between DR and FF.

I got the information from the issue report ([#1142](https://github.com/darkreader/darkreader/issues/1142)). It's unlikely that the fix will be in the default DR, so you need to re-apply the workaround every time DR is updated.

Credit: Screenshots and screen recording contain a photo by [Yunming Wang](https://unsplash.com/@ymwang) on [Unsplash](https://unsplash.com/photos/GY2udBfnA6k).