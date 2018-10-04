/* This is concat of sri-fallback.min.js and typing.js
* Any changes to typing.js needs to be reflected here (just concat again)
*/
!function(){var a="x-sri-fallback";function o(e){var r=e.getAttribute&&e.getAttribute(a),i=(e.tagName||"").toLowerCase(),n="script"===i&&e.src?"src":"link"===i&&"stylesheet"===e.rel&&e.href?"href":null;r&&n&&(e.onerror=function(){var t=document.createElement(i);t.crossOrigin=e.crossOrigin,t.integrity=e.integrity,t[n]=r,"link"===i&&(t.rel=e.rel),t.onerror=function(){console.log("SRI fallback "+r+" also failed to match integrity string "+t.integrity+".")},document.head.appendChild(t)})}new MutationObserver(function(t){for(var e=0;e<t.length;++e){for(var r=t[e],i=r.addedNodes,n=0;n<i.length;++n)o(i[n]);r.attributeName===a&&o(r.target)}}).observe(document,{childList:!0,attributes:!0,characterData:!1,subtree:!0,attributeOldValue:!1,attributeFilter:[a]})}();(function ($) {
  // Fancybox caption
  $('.article-entry').each(function (i) {
    $(this).find('img').each(function () {
      // Don't insert fancybox element to cloudinary's cld-responsive img class
      if ($(this).hasClass('cld-responsive') || $(this).parent().hasClass('fancybox')) return

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


  //Add "Copy" button to code snippet
  var code = document.getElementsByClassName('code');

  for (var i = 0; i < code.length; i++) {
    var button = document.createElement('button');
      button.className = 'copy-button';
      button.textContent = 'Copy';

      code[i].appendChild(button);
  }

  $(document).ready(function() {

    // Add copy to clipboard button for code snippet
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
