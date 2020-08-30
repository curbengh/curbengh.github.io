---
title: Override smartypants in marked.js renderer
excerpt: marked is a Markdown renderer
date: 2020-08-30
tags:
- javascript
---

``` js
const marked = require('marked')
const { escape } = require('marked/src/helpers')
const { Tokenizer: MarkedTokenizer } = marked

class Tokenizer extends MarkedTokenizer {
  // Override smartypants
  inlineText (src, inRawBlock) {
    const { options, rules } = this
    const { smartypants: smartypantsCfg } = options

    // https://github.com/markedjs/marked/blob/b6773fca412c339e0cedd56b63f9fa1583cfd372/src/Lexer.js#L8-L24
    const smartypants = str => {
      return str
        // em-dashes
        .replace(/---/g, '\u2014')
        // en-dashes
        .replace(/--/g, '\u2013')
        // opening singles
        .replace(/(^|[-\u2014/([{"\s])'/g, '$1\u2018')
        // closing singles & apostrophes
        .replace(/'/g, '\u2019')
        // opening doubles
        .replace(/(^|[-\u2014/([{\u2018\s])"/g, '$1\u201c')
        // closing doubles
        .replace(/"/g, '\u201d')
        // ellipses
        .replace(/\.{3}/g, '\u2026')
    }

    // https://github.com/markedjs/marked/blob/b6773fca412c339e0cedd56b63f9fa1583cfd372/src/Tokenizer.js#L643-L658
    const cap = rules.inline.text.exec(src)
    if (cap) {
      let text
      if (inRawBlock) {
        text = cap[0]
      } else {
        text = escape(smartypantsCfg ? smartypants(cap[0]) : cap[0])
      }
      return {
        type: 'text',
        raw: cap[0],
        text
      }
    }
  }
}

marked.setOptions({
  smartypants: true
})

const tokenizer = new Tokenizer()

marked('input', { tokenizer })
```

A year ago, a user requested an option to override the behaviour of marked's smartypants, particularly the user wondered if it is possible to replace `"` with `«»` instead of `“”`. Another Markdown renderer, markdown-it (utilised by hexo-renderer-markdown-it), also offers smartypants feature and you can easily customise the quotes substitution using "quotes:" option. But marked doesn't offer that option and I was not familiar with marked API, I couldn't implement the user's request.

Recently after working on [hexojs/hexo-renderer-marked#159](https://github.com/hexojs/hexo-renderer-marked/pull/159), I became (slightly) more familiar with [marked](https://marked.js.org/), particularly in overriding its rendering methods. I noticed [`inlineText`](https://marked.js.org/#/USING_PRO.md#inline-level-tokenizer-methods) tokenizer passes smartypants function in one of its arguments:

> - inlineText(_string_ src, _bool_ inRawBlock, _function_ smartypants)

It seemed it is possible to bring-your-own smartypants function. Indeed after a few trial-and-error (there was no clear example), I finally figured it out and add a new `quotes:` option in hexo-renderer-marked ([hexojs/hexo-renderer-marked#161](https://github.com/hexojs/hexo-renderer-marked/pull/161)). I attached a sample code at the beginning of this post. If you are already using marked, that code should be quite easy to understand and you just need to modify the `smartypants()` function. Otherwise, here is my explanation.

``` js
const { escape } = require('marked/src/helpers')
```

marked uses this function to escape unsafe content related to HTML tag (e.g. `<` to [`&lt;`](https://github.com/markedjs/marked/blob/b6773fca412c339e0cedd56b63f9fa1583cfd372/src/helpers.js#L10). I initially wanted to hexo-util's [`escapeHTML()`](https://github.com/hexojs/hexo-util#escapehtmlstr) since they seem to serve similar purpose and `escapeHTML()` does escape more potentially unsafe character. But then I noticed the regex search pattern is slightly different, so I retain marked's `escape()` to avoid any undesired rendering change.

``` js
// https://github.com/markedjs/marked/blob/b6773fca412c339e0cedd56b63f9fa1583cfd372/src/Lexer.js#L8-L24
const smartypants = str => {
  return str
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/([{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/([{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026')
}
```

This is smartypants function as implemented by marked, just comment out any `.replace()` line that you don't want. Note the ordering of the replace function, you may need to comment out other related replacement; if you remove em-dash replace but still retain en-dash, any triple-dash "---" will become en-dash + dash "–-". It's also possible to add _more_ substitutions, like "=>" becomes "⇒".


``` js
if (inRawBlock) {
  text = cap[0]
}
```

`inRawBlock` will be true whenever marked encounters (safe) raw HTML element like `<kbd>lorem ipsum</kbd>` in the markdown content; in this case, there is no need to escape and it will be retained as is.

``` js
return {
  type: 'text',
  raw: cap[0],
  text
}
```

This is what I initially struggled the most to understand, I didn't know which `type:` should I return. At first, I thought the type should be itself (`inlineText`) since that was the `codespan` [example](https://marked.js.org/#/USING_PRO.md#tokenizer) showed, but that didn't work (it didn't make sense anyway, since the function shouldn't need to identify itself).

It turned out to be one of the [inline renderer](https://marked.js.org/#/USING_PRO.md#inline-level-renderer-methods) methods, in this case, it should be `text`.

``` js
marked.setOptions({
  smartypants: true
})
```

This option is available as `this.options.smartypants` property in the method.
