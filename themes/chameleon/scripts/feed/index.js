/* global hexo */
'use strict'

/*
* Modified from the hexo version,
* https://github.com/hexojs/hexo-generator-feed
* to use post.lastUpdated and remove timezone
*/

const { extname } = require('path')

const config = hexo.config.feed = Object.assign({
  type: 'atom',
  limit: 20,
  hub: '',
  content: true,
  content_limit: 140,
  content_limit_delim: '',
  order_by: '-date'
}, hexo.config.feed)

// Set default feed path
if (!config.path) {
  config.path = config.type + '.xml'
}

// Add extension name if don't have
if (!extname(config.path)) {
  config.path += '.xml'
}

hexo.extend.generator.register('feed', require('./generator'))
