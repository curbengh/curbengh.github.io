'use strict'

const nanomatch = require('nanomatch')
const template = require('./template')

module.exports = function (locals) {
  const config = this.config
  const skipRenderList = [
    '*.js',
    '*.css'
  ]

  if (Array.isArray(config.skip_render)) {
    skipRenderList = skipRenderList.concat(config.skip_render)
  } else if (config.skip_render != null) {
    skipRenderList.push(config.skip_render)
  }

  const posts = [].concat(locals.posts.toArray(), locals.pages.toArray())
    .filter((post) => {
      return post.sitemap !== false && !isMatch(post.source, skipRenderList)
    })
    .sort((a, b) => {
      return b.updated - a.updated
    })

  // configuration dictionary
  const xmlConfig = {
    config: config,
    posts: posts,
    // add the sNow variable for creation of the home page and potential tags/cats
    sNow: new Date().toISOString()
  }

  // add tags array available in the template
  if (config.sitemap.tags !== false) {
    xmlConfig.tags = locals.tags.toArray()
  }

  // add categories available in the template
  if (config.sitemap.categories !== false) {
    xmlConfig.categories = locals.categories.toArray()
  }

  const xml = template(config).render(xmlConfig)

  return {
    path: config.sitemap.path,
    data: xml
  }
}

function isMatch (path, patterns) {
  if (patterns && patterns.length) {
    if (nanomatch.some(path, patterns, { matchBase: true })) return true
  }

  return false
}
