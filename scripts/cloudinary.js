'use strict'
/* global hexo */

/*
*  Put {% cloudinary 'folder/filename.jpg' 'description' %} in your post.
*  Change the username in data-src tag
*  and cloud name in typing.js
*  More info:
*  https://hexo.io/docs/tag-plugins
*  https://hexo.io/api/tag
*  https://cloudinary.com/documentation/responsive_images
*/

hexo.extend.tag.register('cloudinary', (args) => {
  const fileName = args[0]
  const alt = args[1] || ''
  let modern = ''
  let legacy = ''
  const cloudinary = 'https://res.cloudinary.com/curben/image/upload/w_auto,f_auto,q_auto,c_scale/c_limit,'

  if (fileName.endsWith('.png')) {
    modern = fileName.replace(/\.png$/, '.webp')
    legacy = fileName
  } else if (fileName.endsWith('.webp')) {
    modern = fileName
    legacy = fileName.replace(/\.webp$/, '.gif')
  }

  if (fileName.endsWith('.png') || fileName.endsWith('.webp')) {
    return `<a href="https://res.cloudinary.com/curben/${fileName}">
      <picture>
      <source type="image/webp"
        srcset="${cloudinary}w_300/${modern} 300w,
              ${cloudinary}w_450/${modern} 450w,
              ${cloudinary}w_600/${modern} 600w,
              ${cloudinary}w_900/${modern} 900w,
              ${cloudinary}w_1200/${modern} 1200w,
              ${cloudinary}w_1500/${modern} 1500w"
        sizes="(max-width: 300px) 280px,
              (max-width: 450px) 430px,
              (max-width: 600px) 580px,
              (max-width: 900px) 880px,
              (max-width: 1200px) 1180px,
              1500px">
      <img
        srcset="${cloudinary}w_300/${legacy} 300w,
              ${cloudinary}w_450/${legacy} 450w,
              ${cloudinary}w_600/${legacy} 600w,
              ${cloudinary}w_900/${legacy} 900w,
              ${cloudinary}w_1200/${legacy} 1200w,
              ${cloudinary}w_1500/${legacy} 1500w"
        sizes="(max-width: 300px) 280px,
              (max-width: 450px) 430px,
              (max-width: 600px) 580px,
              (max-width: 900px) 880px,
              (max-width: 1200px) 1180px,
              1500px"
        src="${cloudinary}w_600/${legacy}"
        alt="${alt}">
      </picture></a>`
  } else {
    return `<a href="https://res.cloudinary.com/curben/${fileName}">
      <img
        srcset="${cloudinary}w_300/${fileName} 300w,
              ${cloudinary}w_450/${fileName} 450w,
              ${cloudinary}w_600/${fileName} 600w,
              ${cloudinary}w_900/${fileName} 900w,
              ${cloudinary}w_1200/${fileName} 1200w,
              ${cloudinary}w_1500/${fileName} 1500w"
        sizes="(max-width: 300px) 280px,
              (max-width: 450px) 430px,
              (max-width: 600px) 580px,
              (max-width: 900px) 880px,
              (max-width: 1200px) 1180px,
              1500px"
        src="${cloudinary}w_600/${fileName}"
        alt="${alt}">
      </a>`
  }
})
