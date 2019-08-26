'use strict'
/* global hexo */

/*
* Helper to add <script src=""> with support of custom attributes
* https://github.com/hexojs/hexo/pull/3681
*/

hexo.extend.helper.register('addJs', (...args) => {
  let result = '\n'
  let items = args

  if (!Array.isArray(args)) {
    items = [args]
  }

  items.forEach(item => {
    // Old syntax
    if (typeof item === 'string' || item instanceof String) {
      result += `<script src="${item}"></script>\n`
    } else {
      // New syntax
      let tmpResult = '<script'
      for (const attribute in item) {
        if (item[attribute] === true) tmpResult += ' ' + attribute
        else tmpResult += ` ${attribute}="${item[attribute]}"`
      }
      tmpResult += '></script>\n'
      result += tmpResult
    }
  })
  return result
})
