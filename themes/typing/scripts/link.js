/*
* Modified from the hexo version,
* https://github.com/hexojs/hexo/blob/master/lib/plugins/helper/link_to.js
* to remove title attribute and 'external' option
*/

'use strict'

const { htmlTag } = require('hexo-util')

function linkHelper(path, text) {
  if (!text) text = path.replace(/^https?:\/\/|\/$/g, '')

  const attrs = Object.assign({
    href: this.url_for(path)
  })

  if (attrs.class && Array.isArray(attrs.class)) {
    attrs.class = attrs.class.join(' ')
  }

  return htmlTag('a', attrs, text)
}

hexo.extend.helper.register('link', linkHelper)
