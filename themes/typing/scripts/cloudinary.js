/*
*  Put {% cloudinary folder/filename.jpg %} in your post.
*  Change the username in data-src tag,
*  and cloud name in layout/_partial/after-footer.ejs
*  src is an animated svg generated from https://loading.io/
*  More info:
*  https://hexo.io/docs/tag-plugins
*  https://hexo.io/api/tag
*  https://cloudinary.com/documentation/responsive_images
*/
hexo.extend.tag.register('cloudinary', function (fileName) {
  return '<img class="cld-responsive" data-src="https://res.cloudinary.com/curben/image/upload/w_auto,f_auto,q_auto,c_scale/c_limit,w_500/' + fileName + '" src="/loading.svg" />'
})
