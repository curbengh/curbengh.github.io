'use strict'
/* global hexo */

/*
*  Embed an image with responsive images in a post
*  https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
*  Image is resized on-the-fly using Statically (https://statically.io/)
*  Usage: ![alt](/path/to/img "title")
*/

const { join } = require('path').posix

hexo.extend.filter.register('marked:renderer', (renderer) => {
  renderer.image = (href, title, alt) => {
    if (!alt) alt = ''
    if (!title) title = alt

    if (href.endsWith('.svg')) return `<img class="svg" src="${href}" alt="${alt}" title="${title}">`

    // embed external image
    if (href.startsWith('http')) return `<img src="${href}" alt="${alt}" title="${title}">`

    const fLink = (path, width = '') => {
      const url = new URL(join('images', width, path), 'http://example.com/')

      return url.pathname
    }

    return `<a href="${join('/img', href)}">` +
      `<img srcset="${fLink(href, '320')} 320w,` +
      `${fLink(href, '468')} 468w,` +
      `${fLink(href, '768')} 768w,` +
      `${fLink(href)} 800w"` +
      ' sizes="(max-width: 320px) 320px,' +
      '(max-width: 468px) 468px,' +
      '(max-width: 768px) 768px,' +
      '800px"' +
      ` src="${fLink(href)}" title="${title}" alt="${alt}" loading="lazy"></a>`
  }
})
