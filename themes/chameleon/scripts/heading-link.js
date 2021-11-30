'use strict'
/* global hexo */

/*
* Add Link button next to a heading
*/

const { slugize, stripHTML } = require('hexo-util')

const anchorId = (str, transformOption) => {
  return slugize(str.trim(), { transform: transformOption })
}

hexo.extend.filter.register('marked:renderer', function (renderer) {
  const { config } = this
  renderer.heading = function (text, level) {
    const transformOption = config.marked.modifyAnchors
    let id = anchorId(stripHTML(text), transformOption)
    const headingId = this._headingId

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
