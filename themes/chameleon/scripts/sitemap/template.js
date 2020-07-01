'use strict'

const { join } = require('path')
const { readFileSync } = require('fs')
const moment = require('moment')
let sitemapTmpl = ''

module.exports = function (config) {
  if (sitemapTmpl) return sitemapTmpl

  const nunjucks = require('nunjucks')
  const env = new nunjucks.Environment(null, {
    autoescape: false,
    watch: false
  })

  env.addFilter('formatDate', str => {
    if (typeof str === 'string') return str.substring(0, 10)
    return moment(str).format('YYYY-MM-DD[T00:00:00.000Z]').substring(0, 10)
  })

  const sitemapSrc = config.sitemap.template || join(__dirname, '.sitemap.xml')
  sitemapTmpl = nunjucks.compile(readFileSync(sitemapSrc, 'utf8'), env)

  return sitemapTmpl
}
