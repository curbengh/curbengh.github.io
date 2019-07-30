'use strict'

const micromatch = require('micromatch')
const template = require('./template')
const moment = require('moment')

module.exports = function (locals) {
  const config = this.config
  let skipRenderList = ['*.js', '*.css']

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
      return b.date - a.date
    })
    .map((post) => ({
      ...post,
      permalink: post.permalink.replace('index.html', ''),
      date: moment(post.date).format('YYYY-MM-DD[T00:00:00.000Z]'),
      lastUpdated: () => {
        if (post.lastUpdated) return moment(post.lastUpdated).format('YYYY-MM-DD[T00:00:00.000Z]')
        else return false
      }
    }))

  // configuration dictionary
  const xmlConfig = {
    config: config,
    posts: posts,
    // add the sNow variable for creation of the home page and potential tags/cats
    sNow: moment().format('YYYY-MM-DD[T00:00:00.000Z]')
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
    if (micromatch.isMatch(path, patterns, { matchBase: true })) return true
  }

  return false
}
