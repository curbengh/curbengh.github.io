(($) => {
  // Fancybox caption
  $('.article-entry').each((i) => {
    $(this).find('img').each(() => {
      // Don't insert fancybox element to cloudinary's cld-responsive img class
      if ($(this).hasClass('cld-responsive') || $(this).parent().hasClass('fancybox')) return

      const alt = this.alt

      if (alt) {
        $(this).after('<span class="caption">' + alt + '</span>')
      }

      $(this).wrap('<a href="' + this.src + '" title="' + alt + '" class="fancybox"></a>')
    })

    $(this).find('.fancybox').each(() => {
      $(this).attr('rel', 'article' + i)
    })
  })

  if ($.fancybox) {
    $('.fancybox').fancybox()
  }

  // Add "Copy" button to code snippet
  const code = document.getElementsByClassName('code')

  for (let i = 0; i < code.length; i++) {
    const button = document.createElement('button')
    button.className = 'copy-button'
    button.textContent = 'Copy'

    code[i].appendChild(button)
  }

  $(document).ready(() => {
    // Add copy to clipboard button for code snippet
    const copyCode = new ClipboardJS('.copy-button', {
      target: (trigger) => {
        return trigger.previousElementSibling
      }
    })

    copyCode.on('success', (event) => {
      event.clearSelection()
      event.trigger.textContent = 'Copied'
      window.setTimeout(() => {
        event.trigger.textContent = 'Copy'
      }, 2000)
    })

    copyCode.on('error', (event) => {
      event.trigger.textContent = 'Press "Ctrl + C" to copy'
      window.setTimeout(() => {
        event.trigger.textContent = 'Copy'
      }, 2000)
    })

    // Initialize Cloudinary responsive function
    const cl = cloudinary.Cloudinary.new({ cloud_name: 'curben' })
    cl.responsive()
  })
})(jQuery)

// Search button function
const searchClick = document.getElementById('searchClick')
searchClick.onclick = function() {
  window.open('https://gitlab.com/search?utf8=%E2%9C%93&search=' + 
  document.getElementById('searchTxt').value + 
  '&group_id=&project_id=8306723&search_code=true&repository_ref=master')
}