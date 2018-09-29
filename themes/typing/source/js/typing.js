(function ($) {
  // Caption
  $('.article-entry').each(function (i) {
    $(this).find('img').each(function () {
      if ($(this).parent().hasClass('fancybox')) return

      var alt = this.alt

      if (alt) {
        $(this).after('<span class="caption">' + alt + '</span>')
      }

      $(this).wrap('<a href="' + this.src + '" title="' + alt + '" class="fancybox"></a>')
    })

    $(this).find('.fancybox').each(function () {
      $(this).attr('rel', 'article' + i)
    })
  })

  if ($.fancybox) {
    $('.fancybox').fancybox()
  }


  $(document).ready(function() {

    // Add "Copy" button to code snippet
    var pre = document.getElementsByTagName('pre');

    for (var i = 0; i < pre.length; i++) {
      var button = document.createElement('button');
        button.className = 'copy-button';
        button.textContent = 'Copy';

        pre[i].appendChild(button);
    }

    var copyCode = new ClipboardJS('.copy-button', {
      target: function(trigger) {
          return trigger.previousElementSibling;
      }
    });

    copyCode.on('success', function(event) {
      event.clearSelection();
      event.trigger.textContent = 'Copied';
      window.setTimeout(function() {
          event.trigger.textContent = 'Copy';
      }, 2000);
    });

    copyCode.on('error', function(event) {
      event.trigger.textContent = 'Press "Ctrl + C" to copy';
      window.setTimeout(function() {
          event.trigger.textContent = 'Copy';
      }, 2000);
    });

    // Navigation menu
    $('#menu').click(function (event) {
      var nav = $('#main-nav');
      nav.toggle('fast');
    });

    // Show navigation button for smaller screen
    $(window).resize(function () {
      var viewportWidth = $(window).width();
      if (viewportWidth > 468) {
        $('#main-nav').show('fast');
      } else {
        $('#main-nav').hide('fast');
      }
    });
  });
})(jQuery)

