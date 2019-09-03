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
  let [fileName, alt] = args
  if (!alt) alt = ''
  let modern = ''
  let legacy = ''
  const link = 'https://cdn.statically.io/img/res.cloudinary.com/' + user

  if (fileName.endsWith('.png')) {
    modern = fileName.replace(/\.png$/, '.webp')
    legacy = fileName
  } else if (fileName.endsWith('.webp')) {
    // Statically doesn't support animated webp
    // https://github.com/marsble/statically/issues/36
    // modern = fileName
    modern = fileName.replace(/\.webp$/, '.gif')
    legacy = fileName.replace(/\.webp$/, '.gif')
  } else {
    legacy = fileName
  }

  const modernLink = link + '/' + modern + '?auto_format=false'
  const legacyLink = link + '/' + legacy + '?auto_format=false'

  const img = `<img
            srcset="${legacyLink}&w=320 320w,
                  ${legacyLink}&w=468 468w,
                  ${legacyLink}&w=768 768w,
                  ${legacyLink} 800w"
            sizes="(max-width: 320px) 320px,
                  (max-width: 468px) 468px,
                  (max-width: 768px) 768px,
                  800px"
            src="${legacyLink}"
            alt="${alt}" loading="lazy">`

  if (fileName.endsWith('.png') || fileName.endsWith('.webp')) {
    return `<a href="${legacyLink}">
      <picture>
      <source type="image/webp"
        srcset="${modernLink}&w=320 320w,
              ${modernLink}&w=468 468w,
              ${modernLink}&w=768 768w,
              ${modernLink} 800w"
        sizes="(max-width: 320px) 320px,
              (max-width: 468px) 468px,
              (max-width: 768px) 768px,
              800px">
      ${img}
      </picture></a>`
  } else {
    return `<a href="${legacyLink}">${img}</a>`
  }
})
