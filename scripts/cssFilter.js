'use strict'
/* global hexo */

/*
* Normalize typing.css using sanitize.css
* Add browser prefixes using autoprefixer
*
* renderer is used (instead of filter) due to
* incompatible with hexo-yam
*/

const autoprefixer = require('autoprefixer')
const micromatch = require('micromatch')
const normalize = require('postcss-normalize')
const postcss = require('postcss')

hexo.extend.renderer.register('css', 'css', (data, options) => {
  if (data.path) {
    if (micromatch.isMatch(data.path, '*.min.css', { basename: true })) return data.text
  }

  return new Promise((resolve, reject) => {
    postcss([normalize, autoprefixer])
      .process(data.text, { from: data.path })
      .then(result => {
        resolve(result.css)
      },
      error => {
        reject(error)
      })
  })
})
