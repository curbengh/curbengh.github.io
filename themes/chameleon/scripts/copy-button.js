'use strict'
/* global hexo */

/*
* Add "Copy" button to code snippet
*/

hexo.extend.filter.register('after_render:html', (data) => {
  const copyBtn = '<button class="copy-button">Copy</button>'

  // Regex is based on https://github.com/hexojs/hexo/pull/3697
  return data.replace(/<pre>(?!<\/pre>).+?<\/pre>/gs, (str) => {
    if (!str.includes(copyBtn)) return str.replace('</pre>', copyBtn + '</pre>')
    return str
  })
})
