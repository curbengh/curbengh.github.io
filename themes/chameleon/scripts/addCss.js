'use strict'
/* global hexo */

/*
* Helper to embed css file with support of custom attributes
* https://github.com/hexojs/hexo/pull/3690
*/

hexo.extend.helper.register('addCss', (...args) => {
  let result = '\n'
  let items = args

  if (!Array.isArray(args)) {
    items = [args]
  }

  items.forEach(item => {
    // Old syntax
    if (typeof item === 'string' || item instanceof String) {
      result += `<link rel="stylesheet" href="${item}">\n`
    } else {
      // New syntax
      let tmpResult = '<link rel="stylesheet"'
      Object.keys(item).forEach(attribute => {
        tmpResult += ` ${attribute}="${item[attribute]}"`
      })
      tmpResult += '>\n'
      result += tmpResult
    }
  })
  return result
})
