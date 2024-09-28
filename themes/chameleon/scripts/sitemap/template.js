'use strict'

const { join } = require('path')
const { readFileSync } = require('fs')
const moment = require('moment')
const { full_url_for } = require('hexo-util')
let sitemapTmpl = ''

module.exports = function (config) {
  if (sitemapTmpl) return sitemapTmpl

  const nunjucks = require('nunjucks')
  const env = new nunjucks.Environment(null, {
    autoescape: false,
    watch: false
  })

  env.addFilter('formatDate', str => {
    return moment(str).format('YYYY-MM-DD[T00:00:00.000Z]').substring(0, 10)
  })

  env.addFilter('fullUrlFor', str => {
    return full_url_for.call({ config }, str)
  })

  const sitemapSrc = config.sitemap.template || join(__dirname, '.sitemap.xml')
  sitemapTmpl = nunjucks.compile(readFileSync(sitemapSrc, 'utf8'), env)

  return sitemapTmpl
}
