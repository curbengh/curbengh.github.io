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
hexo.extend.tag.register('cloudinary', function(args){
  var filename = args[0];

  return '<img class="cld-responsive" data-src="https://res.cloudinary.com/curben/image/upload/w_auto,f_auto,q_auto,dpr_auto,c_scale/"' + filename + ' src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzBweCIgIGhlaWdodD0iMzBweCIgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIiBjbGFzcz0ibGRzLXJpcHBsZSIgc3R5bGU9ImJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMCkgbm9uZSByZXBlYXQgc2Nyb2xsIDAlIDAlOyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMCIgZmlsbD0ibm9uZSIgbmctYXR0ci1zdHJva2U9Int7Y29uZmlnLmMxfX0iIG5nLWF0dHItc3Ryb2tlLXdpZHRoPSJ7e2NvbmZpZy53aWR0aH19IiBzdHJva2U9IiM1ZjJhNjIiIHN0cm9rZS13aWR0aD0iMiI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iciIgY2FsY01vZGU9InNwbGluZSIgdmFsdWVzPSIwOzQwIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjEiIGtleVNwbGluZXM9IjAgMC4yIDAuOCAxIiBiZWdpbj0iLTAuNXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIj48L2FuaW1hdGU+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgY2FsY01vZGU9InNwbGluZSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMSIga2V5U3BsaW5lcz0iMC4yIDAgMC44IDEiIGJlZ2luPSItMC41cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiPjwvYW5pbWF0ZT48L2NpcmNsZT48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIwIiBmaWxsPSJub25lIiBuZy1hdHRyLXN0cm9rZT0ie3tjb25maWcuYzJ9fSIgbmctYXR0ci1zdHJva2Utd2lkdGg9Int7Y29uZmlnLndpZHRofX0iIHN0cm9rZT0iI2E5NzZjMyIgc3Ryb2tlLXdpZHRoPSIyIj48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJyIiBjYWxjTW9kZT0ic3BsaW5lIiB2YWx1ZXM9IjA7NDAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMSIga2V5U3BsaW5lcz0iMCAwLjIgMC44IDEiIGJlZ2luPSIwcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiPjwvYW5pbWF0ZT48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiBjYWxjTW9kZT0ic3BsaW5lIiB2YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxIiBrZXlTcGxpbmVzPSIwLjIgMCAwLjggMSIgYmVnaW49IjBzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSI+PC9hbmltYXRlPjwvY2lyY2xlPjwvc3ZnPg==" />';
});
