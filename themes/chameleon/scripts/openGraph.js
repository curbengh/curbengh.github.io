'use strict'
/* global hexo */

/*
* Modified from the hexo version,
* https://github.com/hexojs/hexo/blob/master/lib/plugins/helper/open_graph.js
* to include https://github.com/hexojs/hexo/pull/3674
* and use WHATWG URL API
* https://nodejs.org/api/url.html#url_the_whatwg_url_api
*/

'use strict'

const moment = require('moment')
const { encodeURL, htmlTag, stripHTML } = require('hexo-util')

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
  const { config, page, theme } = this
  const { content } = page
  let images = page.photos || []
  let description = page.excerpt || theme.description || false
  const keywords = page.tags || false
  const title = page.title || theme.nickname
  const type = (this.is_post() ? 'article' : 'website')
  const url = encodeURL(this.url)
  const siteName = config.subtitle || theme.nickname || false
  const published = page.date || false
  const updated = page.lastUpdated || false
  const language = 'en_GB'
  let result = ''

  if (!Array.isArray(images)) images = [images]

  if (description) {
    description = stripHTML(description).substring(0, 200)
      .trim() // Remove prefixing/trailing spaces
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .replace(/\n/g, ' ') // Replace new lines by spaces
  }

  if (!images.length && content && content.includes('<img')) {
    images = images.slice()

    let img
    const imgPattern = /<img [^>]*src=['"]([^'"]+)([^>]*>)/gi
    while ((img = imgPattern.exec(content)) !== null) {
      images.push(img[1])
    }
  }

  if (description) {
    result += meta('description', description)
  }

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

  images = images.map(path => {
    let url
    // resolve `path`'s absolute path relative to current page's url
    // `path` can be both absolute (starts with `/`) or relative.
    try {
      url = new URL(path).href
    } catch (e) {
      url = new URL(path, config.url).href
      return url
    }

    return url
  })

  images.forEach(path => {
    result += og('og:image', path)
  })

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
