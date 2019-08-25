'use strict'
/* global hexo */

function metaGeneratorHelper () {
  return '<meta name="generator" content="Hexo %s">'.replace('%s', this.env.version)
}

hexo.extend.helper.register('meta_generator', metaGeneratorHelper)
