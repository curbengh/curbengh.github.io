'use strict'
/* global hexo */

/*
* Normalize typing.css using sanitize.css
* Add browser prefixes using autoprefixer
*/

const micromatch = require('micromatch')
const postcss = require('postcss')
const normalize = require('postcss-normalize')
const autoprefixer = require('autoprefixer')

function cssFilter (str, data) {
  const path = data.path
  const exclude = '*.min.css'

  if (path && exclude && exclude.length) {
    if (micromatch.isMatch(path, exclude, { basename: true })) return str
  }

  const output = postcss([normalize, autoprefixer])
    .process(str, {from: path})
    .then(result => {
      return result.css
    })

  return output
}

hexo.extend.filter.register('after_render:css', cssFilter)
