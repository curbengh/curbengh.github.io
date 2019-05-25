// Add "Copy" button to code snippet

const cheerio = require('cheerio')

hexo.extend.filter.register('after_render:html', (str) => {
  const $ = cheerio.load(str)

  // Avoid duplicate button
  if ($('button').parent().hasClass('code')) return

  $('.code').append('<button class="copy-button">Copy</button>')

  return $.html()
})
