'use strict'

const micromatch = require('micromatch')
const template = require('./template')
const moment = require('moment')

const isMatch = (path, patterns) => {
  if (patterns && patterns.length) {
    if (micromatch.isMatch(path, patterns, { matchBase: true })) return true
  }

  return false
}

module.exports = function (locals) {
  const { config } = this
  const { sitemap, skip_render } = config
  const { path } = sitemap
  const skipRenderList = ['*.js', '*.css']

  if (Array.isArray(skip_render)) {
    skipRenderList.push(...skip_render)
  } else if (skip_render != null) {
    skipRenderList.push(skip_render)
  }

  const posts = [].concat(locals.posts.toArray(), locals.pages.toArray())
    .filter((post) => {
      return post.sitemap !== false && !isMatch(post.source, skipRenderList)
    })
    .sort((a, b) => {
      return b.date - a.date
    })
    // https://github.com/pyyzcwg2833/hexo-generator-sitemap/commit/a92dbbb83cc39ff60d43faa5cd688a56574a3889
    .map((post) => ({
      ...post,
      date: moment(post.date).format('YYYY-MM-DD[T00:00:00.000Z]'),
      updated: post.updated ? moment(post.updated).format('YYYY-MM-DD[T00:00:00.000Z]') : false
    }))

  // configuration dictionary
  const xmlConfig = {
    config,
    posts,
    tags: locals.tags.toArray()
  }

  const data = template(config).render(xmlConfig)

  return {
    path,
    data
  }
}
