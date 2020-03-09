'use strict'
/* global hexo */

/*
* Modified from the hexo version,
* https://github.com/hexojs/hexo/blob/master/lib/plugins/helper/open_graph.js
* to include https://github.com/hexojs/hexo/pull/3674
* and use WHATWG URL API
* https://nodejs.org/api/url.html#url_the_whatwg_url_api
*/

const moment = require('moment')
const { escapeHTML, htmlTag, prettyUrls, stripHTML } = require('hexo-util')
const fullUrlFor = require('hexo-util').full_url_for

function meta (name, content) {
  return `${htmlTag('meta', {
    name,
    content
  })}\n`
}

function og (name, content) {
  return `${htmlTag('meta', {
    property: name,
    content
  })}\n`
}

function openGraphHelper () {
  const { config, page } = this
  let description = page.excerpt || ''
  const author = config.author
  const keywords = page.tags || ''
  const title = page.title || config.title || ''
  const type = (this.is_post() ? 'article' : 'website')
  const url = prettyUrls(this.url, config.pretty_urls)
  const screenshot = '/screenshot/' + prettyUrls(this.path, config.pretty_urls)
  const siteName = config.title || ''
  const published = page.date || ''
  const updated = page.lastUpdated || ''
  const language = config.language.replace('-', '_')
  let result = ''

  if (description) {
    description = escapeHTML(stripHTML(description)
      .trim()
      .replace(/\n/g, ' ')
      .substring(0, 200))

    result += meta('description', description)
  }

  result += og('article:author', author)

  if (keywords) {
    keywords.forEach(tag => {
      result += og('article:tag', tag.name)
    })
  }

  result += og('og:type', type)
  result += og('og:title', title)
  result += og('og:url', url)

  if (siteName) {
    result += og('og:site_name', siteName)
  }

  if (description) {
    result += og('og:description', description)
  }

  result += og('og:locale', language)

  result += og('og:image', fullUrlFor.call(this, screenshot))

  if (published) {
    if ((moment.isMoment(published) || moment.isDate(published)) && !isNaN(published.valueOf())) {
      // Skip timezone conversion
      result += og('article:published_time', moment(published).format('YYYY-MM-DD[T00:00:00.000Z]'))
    }
  }

  if (updated) {
    if ((moment.isMoment(updated) || moment.isDate(updated)) && !isNaN(updated.valueOf())) {
      result += og('article:modified_time', moment(updated).format('YYYY-MM-DD[T00:00:00.000Z]'))
    }
  }

  return result.trim()
}

hexo.extend.helper.register('openGraph', openGraphHelper)
