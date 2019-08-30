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
  let fileName = args[0]
  const alt = args[1] || ''
  let modern = ''
  let legacy = ''
  const link = 'https://cdn.statically.io/img/res.cloudinary.com/' + user

  if (fileName.endsWith('.png')) {
    modern = fileName.replace(/\.png$/, '.webp')
    legacy = fileName
  } else if (fileName.endsWith('.webp')) {
    modern = fileName
    legacy = fileName.replace(/\.webp$/, '.gif')
  } else {
    legacy = fileName
  }

  fileName += '?auto_format=false'
  modern += '?auto_format=false'
  legacy += '?auto_format=false'

  const img = `<img
            srcset="${link}/${legacy}&w=320 320w,
                  ${link}/${legacy}&w=468 468w,
                  ${link}/${legacy}&w=768 768w,
                  ${link}/${legacy} 800w"
            sizes="(max-width: 320px) 320px,
                  (max-width: 468px) 468px,
                  (max-width: 768px) 768px,
                  800px"
            src="${link}/${legacy}"
            alt="${alt}" loading="lazy">`

  if (fileName.endsWith('.png') || fileName.endsWith('.webp')) {
    return `<a href="${link}/${fileName}">
      <picture><noscript>
      <source type="image/webp"
        srcset="${link}/${modern}&w=320 320w,
              ${link}/${modern}&w=468 468w,
              ${link}/${modern}&w=768 768w,
              ${link}/${modern} 800w"
        sizes="(max-width: 320px) 320px,
              (max-width: 468px) 468px,
              (max-width: 768px) 768px,
              800px">
      ${img}
      </noscript></picture></a>`
  } else {
    return `<a href="${link}/${fileName}"><noscript>${img}</noscript></a>`
  }
})
