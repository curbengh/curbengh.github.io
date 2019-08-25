'use strict'
/* global hexo */

/*
*  Put {% cloudinary 'folder/filename.jpg' 'description' %} in your post.
*  Change the username in 'user' variable
*  More info:
*  https://cloudinary.com/blog/responsive_images_with_srcset_sizes_and_cloudinary
*/

hexo.extend.tag.register('cloudinary', (args) => {
  const user = 'curben'
  const fileName = args[0]
  const alt = args[1] || ''
  let modern = ''
  let legacy = ''
  const cloudinary = 'https://cdn.statically.io/img/res.cloudinary.com/' + user +
    '/image/upload/q_auto'
  const original = 'https://cdn.statically.io/img/res.cloudinary.com/' + user + '/' + fileName

  if (fileName.endsWith('.png')) {
    modern = fileName.replace(/\.png$/, '.webp')
    legacy = fileName
  } else if (fileName.endsWith('.webp')) {
    modern = fileName
    legacy = fileName.replace(/\.webp$/, '.gif')
  } else {
    legacy = fileName
  }

  const img = `<img
            srcset="${cloudinary}/c_limit,w_320/${legacy} 320w,
                  ${cloudinary}/c_limit,w_468/${legacy} 468w,
                  ${cloudinary}/c_limit,w_768/${legacy} 768w,
                  ${cloudinary}/${legacy} 800w"
            sizes="(max-width: 320px) 320px,
                  (max-width: 468px) 468px,
                  (max-width: 768px) 768px,
                  800px"
            src="${cloudinary}w_768/${legacy}"
            alt="${alt}" loading="lazy">`

  if (fileName.endsWith('.png') || fileName.endsWith('.webp')) {
    return `<a href="${original}">
      <picture><noscript>
      <source type="image/webp"
        srcset="${cloudinary}/c_limit,w_320/${modern} 320w,
              ${cloudinary}/c_limit,w_468/${modern} 468w,
              ${cloudinary}/c_limit,w_768/${modern} 768w,
              ${cloudinary}/${modern} 800w"
        sizes="(max-width: 320px) 320px,
              (max-width: 468px) 468px,
              (max-width: 768px) 768px,
              800px">
      ${img}
      </noscript></picture></a>`
  } else {
    return `<a href="${original}"><noscript>${img}</noscript></a>`
  }
})
