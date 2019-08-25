'use strict'
/* global hexo */

/*
* Modified from the hexo version,
* https://github.com/hexojs/hexo/blob/master/lib/plugins/helper/list_tags.js
* to add rel="tag"
* http://microformats.org/wiki/rel-tag
*/

function listTagsHelper (tags, options) {
  if (!options && (!tags || !Object.prototype.hasOwnProperty.call(tags, 'length'))) {
    options = tags
    tags = this.site.tags
  }

  if (!tags || !tags.length) return ''
  options = options || {}

  const { style = 'list', transform, separator = ', ', suffix = '' } = options
  const showCount = Object.prototype.hasOwnProperty.call(options, 'show_count') ? options.show_count : true
  const className = options.class || 'tag'
  const orderby = options.orderby || 'name'
  const order = options.order || 1
  let result = ''
  const self = this

  // Sort the tags
  tags = tags.sort(orderby, order)

  // Ignore tags with zero posts
  tags = tags.filter(tag => tag.length)

  // Limit the number of tags
  if (options.amount) tags = tags.limit(options.amount)

  if (style === 'list') {
    result += `<ul class="${className}-list" itemprop="keywords">`

    tags.forEach(tag => {
      result += `<li class="${className}-list-item">`

      result += `<a class="p-category ${className}-list-link" href="${self.url_for(tag.path)}${suffix}" rel="tag">`
      result += transform ? transform(tag.name) : tag.name
      result += '</a>'

      if (showCount) {
        result += `<span class="${className}-list-count">${tag.length}</span>`
      }

      result += '</li>'
    })

    result += '</ul>'
  } else {
    tags.forEach((tag, i) => {
      if (i) result += separator

      result += `<a class="${className}-link" href="${self.url_for(tag.path)}${suffix}" rel="tag">`
      result += transform ? transform(tag.name) : tag.name

      if (showCount) {
        result += `<span class="${className}-count">${tag.length}</span>`
      }

      result += '</a>'
    })
  }

  return result
}

hexo.extend.helper.register('listTags', listTagsHelper)
