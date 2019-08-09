'use strict'
/* global hexo */

/*
* Add Link button next to a heading
* cheerio is provided by hexo package
*/

const cheerio = require('cheerio')

hexo.extend.filter.register('after_render:html', (str) => {
  const $ = cheerio.load(str)
  const svg = `<svg height="0.8em" viewBox="15 15 1635 1635">
               <desc>Link icon</desc>
               <use href="/hexo-testing/svg/link.svg#link"/>
               </svg>`

  const headings = ['h2', 'h3']

  headings.forEach(heading => {
    $(heading).each((index, element) => {
      if ($(element).children('a').children('svg').length === 0) {
        const text = $(element).text().trim()

        $(element).append($(element).children('a').append(svg))

        const cache = $(element).children()
        $(element).text(text + ' ').append(cache)
      }
    })
  })

  return $.html()
})
