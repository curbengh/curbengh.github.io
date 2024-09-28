'use strict'
/* global hexo */

/*
* Modified from the hexo version,
* https://github.com/hexojs/hexo/blob/master/lib/plugins/helper/link_to.js
* to remove title attribute and 'external' option
*/

const { htmlTag } = require('hexo-util')

hexo.extend.helper.register('link', (path, text) => {
  const urlFor = hexo.extend.helper.get('url_for').bind(hexo)

  if (!text) text = path.replace(/^https?:\/\/|\/$/g, '')

  const attrs = Object.assign({
    href: urlFor(path)
  })

  if (attrs.class && Array.isArray(attrs.class)) {
    attrs.class = attrs.class.join(' ')
  }

  return htmlTag('a', attrs, text)
})
