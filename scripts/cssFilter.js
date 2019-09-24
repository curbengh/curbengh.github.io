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
const normalize = require('postcss-normalize')
const postcss = require('postcss')

hexo.extend.renderer.register('css', 'css', async (data) => {
  if (data.path) {
    if (data.path.endsWith('.min.css')) return data.text
  }

  const result = await postcss([normalize, autoprefixer]).process(data.text, { from: data.path })
  return result.css
})
