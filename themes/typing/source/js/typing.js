// Search button function
const searchClick = document.getElementById('searchClick')
searchClick.addEventListener('click', () => {
  window.open('https://gitlab.com/search?utf8=%E2%9C%93&search=' +
  document.getElementById('searchTxt').value +
  '&group_id=&project_id=8306723&search_code=true&repository_ref=master')
}, false);

const searchClickMob = document.getElementById('searchClickMob')
searchClickMob.addEventListener('click', () => {
  window.open('https://gitlab.com/search?utf8=%E2%9C%93&search=' +
  document.getElementById('searchTxtMob').value +
  '&group_id=&project_id=8306723&search_code=true&repository_ref=master')
}, false)

/*
* Copy button and Cloudinary functions.
* Following functions only execute after
* the 'document' is ready or
* <script src> is executed.
*/
document.addEventListener('DOMContentLoaded', () => {
  // Copy button
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
}, false)
