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

  return '<a href="https://res.cloudinary.com/curben/' + fileName + '"><img class="cld-responsive" data-src="https://res.cloudinary.com/curben/image/upload/w_auto,f_auto,q_auto,c_scale/c_limit,w_600,h_400/' + fileName + '" src="/svg/loading.svg" alt="' + alt + '"></a>'
})
