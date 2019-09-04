'use strict'
/* global hexo */

/*
* Add "Copy" button to code snippet
*/

hexo.extend.filter.register('after_render:html', (data) => {
  // Avoid duplicate button
  if (data.includes('</button></td>')) return;

  const copyBtn = '<button class="copy-button">Copy</button>'

  // Regex is based on https://github.com/hexojs/hexo/pull/3697
  return data.replace(/<td class="code">(?!<\/td>).+?<\/td>/, (str) => str.replace('</td>', copyBtn + '</td>'))
})
