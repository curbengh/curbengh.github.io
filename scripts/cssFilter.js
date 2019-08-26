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

hexo.extend.renderer.register('css', 'css', (data, options, callback) => {
  const exclude = '*.min.css'

  if (micromatch.isMatch(data.path, exclude, { basename: true })) callback(null, data.text)

  postcss([normalize, autoprefixer])
    .process(data.text, { from: data.path })
    .then(result => {
      callback(null, result.css)
    },
    error => {
      callback(error)
    })
})
