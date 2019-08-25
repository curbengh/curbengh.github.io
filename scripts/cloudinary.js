'use strict'
/* global hexo */

/*
*  Put {% cloudinary 'folder/filename.jpg' 'description' %} in your post.
*  Change the username in data-src tag
*  and cloud name in typing.js
*  src is an animated svg generated from https://loading.io/
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
      srcset="https://res.cloudinary.com/curben/image/upload/w_auto,f_auto,q_auto,c_scale/c_limit,w_300,h_400/${modern} 300w,
        https://res.cloudinary.com/curben/image/upload/w_auto,f_auto,q_auto,c_scale/c_limit,w_450,h_400/${modern} 450w,
        https://res.cloudinary.com/curben/image/upload/w_auto,f_auto,q_auto,c_scale/c_limit,w_600,h_400/${modern} 600w"
      sizes="(max-width: 300px) 280px,
            (max-width: 450px) 430px,
            600px"
      src="https://res.cloudinary.com/curben/image/upload/w_auto,f_auto,q_auto,c_scale/c_limit,w_600,h_400/${legacy}">
      <img srcset="https://res.cloudinary.com/curben/image/upload/w_auto,f_auto,q_auto,c_scale/c_limit,w_300,h_400/${legacy} 300w,
        https://res.cloudinary.com/curben/image/upload/w_auto,f_auto,q_auto,c_scale/c_limit,w_450,h_400/${legacy} 450w,
        https://res.cloudinary.com/curben/image/upload/w_auto,f_auto,q_auto,c_scale/c_limit,w_600,h_400/${legacy} 600w"
        sizes="(max-width: 300px) 280px,
              (max-width: 450px) 430px,
              600px"
        src="https://res.cloudinary.com/curben/image/upload/w_auto,f_auto,q_auto,c_scale/c_limit,w_600,h_400/${legacy}"
        alt="${alt}">
      </picture></a>`
  } else {
    return `<a href="https://res.cloudinary.com/curben/${fileName}">
      <picture>
      <img srcset="https://res.cloudinary.com/curben/image/upload/w_auto,f_auto,q_auto,c_scale/c_limit,w_300,h_400/${fileName} 300w,
        https://res.cloudinary.com/curben/image/upload/w_auto,f_auto,q_auto,c_scale/c_limit,w_450,h_400/${fileName} 450w,
        https://res.cloudinary.com/curben/image/upload/w_auto,f_auto,q_auto,c_scale/c_limit,w_600,h_400/${fileName} 600w"
        sizes="(max-width: 300px) 280px,
              (max-width: 450px) 430px,
              600px"
        src="https://res.cloudinary.com/curben/image/upload/w_auto,f_auto,q_auto,c_scale/c_limit,w_600,h_400/${fileName}"
        alt="${alt}">
      </picture></a>`
  }
})
