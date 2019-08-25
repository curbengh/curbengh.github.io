'use strict'

const nunjucks = require('nunjucks')
const env = new nunjucks.Environment()
const pathFn = require('path')
const fs = require('fs')
const moment = require('moment')

env.addFilter('uriencode', str => {
  return encodeURI(str)
})

env.addFilter('noControlChars', str => {
  return str.replace(/[\x00-\x1F\x7F]/g, '') // eslint-disable-line no-control-regex
})

env.addFilter('date', str => {
  return moment(str).format('YYYY-MM-DD[T00:00:00.000Z]')
})

const atomTmplSrc = pathFn.join(__dirname, './.atom.xml')
const atomTmpl = nunjucks.compile(fs.readFileSync(atomTmplSrc, 'utf8'), env)

module.exports = function (locals) {
  const config = this.config
  const feedConfig = config.feed
  const template = atomTmpl

  let posts = locals.posts.sort(feedConfig.order_by || '-date')
  posts = posts.filter(post => {
    return post.draft !== true
  })

  if (feedConfig.limit) posts = posts.limit(feedConfig.limit)

  let url = config.url
  if (url[url.length - 1] !== '/') url += '/'

  let icon = ''
  if (feedConfig.icon) icon = url + encodeURI(feedConfig.icon)

  const xml = template.render({
    config: config,
    url: url,
    icon: icon,
    posts: posts,
    feed_url: config.root + feedConfig.path
  })

  return {
    path: feedConfig.path,
    data: xml
  }
}