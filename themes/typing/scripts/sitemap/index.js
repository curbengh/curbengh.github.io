/*
* Add sitemap.xml
* Based on https://github.com/hexojs/hexo-generator-sitemap/pull/26
*/

/* global hexo */
'use strict'

const pathFn = require('path')

const config = hexo.config.sitemap = Object.assign({
  path: 'sitemap.xml'
}, hexo.config.sitemap)

if (!pathFn.extname(config.path)) {
  config.path += '.xml'
}

hexo.extend.generator.register('sitemap', require('./generator'))
