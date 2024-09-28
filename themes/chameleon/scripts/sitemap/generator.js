'use strict'

const micromatch = require('micromatch')
const template = require('./template')

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
