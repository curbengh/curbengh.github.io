'use strict'
/* global hexo */

/*
*  Embed an image with responsive images in a post
*  https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
*  Image is resized on-the-fly using Statically Imgpx
*  https://statically.io/imgpx
*  Usage: ![alt](/path/to/img "title")
*/

hexo.extend.filter.register('marked:renderer', (renderer) => {
  renderer.image = (href, title, alt) => {
    if (href.endsWith('.svg')) return `<img src="${href}" alt="${alt}">`

    if (!alt) alt = ''
    if (!title) title = alt
    let modern = href
    let legacy = href
    // /img/ is a reverse proxy to Statically CDN
    // See source/_redirects
    const link = '/img/'

    if (href.endsWith('.png') || href.endsWith('.jpg')) {
      modern = href.concat('?format=webp')
    } else if (href.endsWith('.webp')) {
      // Statically has yet to support animated webp
      // https://github.com/marsble/statically/issues/36
      // modern = href.concat('?auto_format=false')
      modern = href.replace(/\.webp$/, '.gif')
      legacy = href.replace(/\.webp$/, '.gif')
    }

    const modernLink = link + modern
    const legacyLink = link + legacy

    const img = `<img srcset="${legacyLink}&w=320 320w,` +
      `${legacyLink}&w=468 468w,` +
      `${legacyLink}&w=768 768w,` +
      `${legacyLink} 800w"` +
      ' sizes="(max-width: 320px) 320px,' +
      '(max-width: 468px) 468px,' +
      '(max-width: 768px) 768px,' +
      '800px"' +
      ` src="${legacyLink}"` +
      ` title="${title}" alt="${alt}" loading="lazy">`

    if (href.endsWith('.png') || href.endsWith('.webp')) {
      return `<a href="${legacyLink}">` +
        '<picture>' +
        '<source type="image/webp"' +
        ` srcset="${modernLink}&w=320 320w,` +
        `${modernLink}&w=468 468w,` +
        `${modernLink}&w=768 768w,` +
        `${modernLink} 800w"` +
        ' sizes="(max-width: 320px) 320px,' +
                '(max-width: 468px) 468px,' +
                '(max-width: 768px) 768px,' +
                '800px">' +
        `${img}` +
        '</picture></a>'
    } else {
      return `<a href="${legacyLink}">${img}</a>`
    }
  }
})
