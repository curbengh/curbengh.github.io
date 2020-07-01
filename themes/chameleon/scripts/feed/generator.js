'use strict'

const nunjucks = require('nunjucks')
const env = new nunjucks.Environment()
const { join } = require('path')
const { readFileSync } = require('fs')
const moment = require('moment')
const { encodeURL } = require('hexo-util')
const { format } = require('url')

env.addFilter('uriencode', str => {
  return encodeURL(str)
})

env.addFilter('noControlChars', str => {
  return str.replace(/[\x00-\x1F\x7F]/g, '') // eslint-disable-line no-control-regex
})

env.addFilter('date', str => {
  return moment(str).format('YYYY-MM-DD[T00:00:00.000Z]')
})

const atomTmplSrc = join(__dirname, './.atom.xml')
const atomTmpl = nunjucks.compile(readFileSync(atomTmplSrc, 'utf8'), env)

module.exports = function (locals) {
  const { config } = this
  const { feed, root, url } = config
  const { icon: iconCfg, limit, order_by, path } = feed
  const template = atomTmpl

  let posts = locals.posts.sort(order_by || '-date')
  posts = posts.filter(post => {
    return post.draft !== true
  })

  if (limit) posts = posts.limit(limit)

  const icon = iconCfg ? format(new URL(iconCfg, url), { unicode: true }) : ''

  const data = template.render({
    config,
    url,
    icon,
    posts,
    feed_url: root + path
  })

  return {
    path,
    data
  }
}
