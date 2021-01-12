'use strict'
/* global hexo */

/*
*  Embed an image with responsive images in a post
*  https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
*  Image is resized on-the-fly using Statically (https://statically.io/)
*  Usage: ![alt](/path/to/img "title")
*/

hexo.extend.filter.register('marked:renderer', (renderer) => {
  renderer.image = (href, title, alt) => {
    if (!alt) alt = ''
    if (!title) title = alt

    if (href.endsWith('.svg')) return `<img class="svg" src="${href}" alt="${alt} title="${title}">`

    // embed external image
    if (!href.startsWith('20')) return `<img src="${href}" alt="${alt}" title="${title}">`

    // Statically doesn't support WebP and GIF
    if (href.endsWith('.webp')) {
      const gif = href.replace(/\.webp$/, '.gif')
      return `<a href="/files/${gif}"><picture>` +
        `<source srcset="/files/${href}" type="image/webp">` +
        `<img src="/files/${gif}" title="${title}" alt="${alt}" loading="lazy"></picture></a>`
    }

    const fLink = (str, width) => {
      if (typeof width === 'number') width = ',w=' + width.toString()
      else width = ''

      return '/img/gitlab.com/f=auto' + width + '/curben/blog/-/raw/site/' + str
    }

    return `<a href="${fLink(href)}">` +
      `<img srcset="${fLink(href, 320)} 320w,` +
      `${fLink(href, 468)} 468w,` +
      `${fLink(href, 768)} 768w,` +
      `${fLink(href)} 800w"` +
      ' sizes="(max-width: 320px) 320px,' +
      '(max-width: 468px) 468px,' +
      '(max-width: 768px) 768px,' +
      '800px"' +
      ` src="${fLink(href)}" title="${title}" alt="${alt}" loading="lazy"></a>`
  }
})
