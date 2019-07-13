---
title: Embed SVG without using img tag
subtitle: Using img tag prevents the use of CSS to change property of SVG. There is a workaround.
date: 2019-06-01
tags:
- svg
- web
---

Website usually embed SVG using `<img>` tag or directly use the `<svg>` tag. Using `<img>` tag prevents the use of CSS to change property of SVG. As for inline `<svg>`, I prefer to have a separate file that is easier to keep track.

## Embed SVG file

Utilise `<use>` tag to embed an SVG file in `svg`. For example in this blog, I have a search button on the top right corner. This is how I embed the [search.svg](/svg/search.svg):

```html
<svg viewBox="0 0 512 512">
  <title>Search</title>
  <desc>Search icon</desc>
  <use href="/svg/search.svg#search"/>
</svg>
```

<br/>

The `<title>` is for tooltip and `<desc>` stands for description and functions similarly to the `alt` attribute in `<img>`. These two tags are optional but recommended for [SEO purpose](https://support.google.com/webmasters/answer/114016?hl=en).

The `viewBox` value is based on the layout you want to use. I simply use the value from the SVG file.

Notice `#search` value in the href attribute. It refers to the `id` attribute in the SVG file, which you need to manually add it. Following is an excerpt from the search.svg.

```
<svg id="search" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="..."/></svg>
```

That attribute is **mandatory**; using link alone like `<use href="/svg/search.svg"/>` would *not* work. Another thing to watch out is SVG minifier like [svgo](https://github.com/svg/svgo) (the only SVG minifier?). **svgo** removes the id attribute by default, via [cleanupIDs](https://github.com/svg/svgo/blob/master/plugins/cleanupIDs.js) plugin.

To disable that plugin in CLI,
```
svgo --disable=cleanupIDs test.svg -o test.min.svg
```

<br/>

For [hexo-yam](https://github.com/weyusi/hexo-yam),
```json
neat_svg:
  plugins: [{ cleanupIDs: false }]
```

## img tag

Currently, I use the following CSS,

```css
svg {
  fill: currentColor;
}
```

to set the SVG to use the same colour as the font's. The `fill` attribute is not supported in `<img>` tag. Since `<image>` property in SVG is [defined as a synonym](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image) for `<img>`, it also shares similar limitation. So, the following method *would not* work,

```html
<svg viewBox="0 0 512 512">
  <title>Search</title>
  <desc>Search icon</desc>
  <image href="/svg/search.svg" x="0" y="0" height="512" width="512"/>
</svg>
```

## object tag

`<object>` [tag](https://css-tricks.com/using-svg/#article-header-id-11) doesn't work inside an `<a>` tag.

Source: [CSS-Tricks.com](https://css-tricks.com/svg-use-external-source/)