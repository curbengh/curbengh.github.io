'use strict'
/* global hexo */

/*
* Simpler version of titlecase() https://github.com/rvagg/titlecase
* Does not ignore words with a dot
*/

hexo.extend.helper.register('titleCase', (str) => {
  return str.replace(/[\w]+[^\s]*/g, (match) => {
    return match[0].toUpperCase() + match.substring(1).toLowerCase()
  })
})
