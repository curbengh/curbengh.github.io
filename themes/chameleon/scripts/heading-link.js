'use strict'
/* global hexo */

/*
* Add Link button next to a heading
* based on https://github.com/hexojs/hexo-renderer-marked/blob/master/lib/renderer.js
*/

const { slugize, stripHTML, unescapeHTML: unescape } = require('hexo-util')

const anchorId = (str, transformOption) => {
  return slugize(stripHTML(unescape(str.replace('.', ''))).trim(), { transform: transformOption })
}

hexo.extend.filter.register('marked:renderer', function (renderer) {
  const { config } = this
  const headingId = {}
  renderer.heading = function ({ text, depth: level }) {
    const { modifyAnchors } = config.marked
    const transformOption = modifyAnchors
    let id = anchorId(text, transformOption)

    // Add a number after id if repeated
    if (headingId[id]) {
      id += `-${headingId[id]++}`
    } else {
      headingId[id] = 1
    }

    // add headerlink
    return `<h${level} id="${id}">${text} <a href="#${id}" class="headerlink" title="${stripHTML(text)}">§</a></h${level}>`
  }
})
