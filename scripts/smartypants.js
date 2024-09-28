const { escapeHTML: escape } = require('hexo-util')

// https://github.com/markedjs/marked/blob/b6773fca412c339e0cedd56b63f9fa1583cfd372/src/Lexer.js#L8-L24
// Replace dashes only
const smartypants = (str) => {
  return str
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026')
    // right arrow
    .replace(/->/g, '\u2192')
}

hexo.extend.filter.register('marked:tokenizer', function (tokenizer) {
  const { smartypants: isSmarty } = this.config.marked
  tokenizer.inlineText = function (src) {
    const { rules } = this

    // https://github.com/markedjs/marked/blob/b6773fca412c339e0cedd56b63f9fa1583cfd372/src/Tokenizer.js#L643-L658
    const cap = rules.inline.text.exec(src)
    if (cap) {
      let text
      if (this.lexer.state.inRawBlock) {
        text = cap[0]
      } else {
        text = escape(isSmarty ? smartypants(cap[0]) : cap[0])
      }
      return {
        // `type` value is a corresponding renderer method
        // https://marked.js.org/using_pro#inline-level-renderer-methods
        type: 'text',
        raw: cap[0],
        text
      }
    }
  }
})
