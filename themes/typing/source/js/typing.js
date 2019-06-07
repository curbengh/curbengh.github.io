// Search button function
const searchClick = document.getElementById('searchClick')
searchClick.addEventListener('click', () => {
  const searchTxt = document.getElementById('searchTxt')
  const searchForm = document.getElementById('searchForm')

  searchTxt.value = searchTxt.value + ' site:curben.netlify.com'
  searchForm.submit()

  searchTxt.value = searchTxt.value.replace(' site:curben.netlify.com', '')
}, false)

const searchClickMob = document.getElementById('searchClickMob')
searchClickMob.addEventListener('click', () => {
  const searchTxt = document.getElementById('searchTxtMob')
  const searchForm = document.getElementById('searchFormMob')

  searchTxt.value = searchTxt.value + ' site:curben.netlify.com'
  searchForm.submit()

  searchTxt.value = searchTxt.value.replace(' site:curben.netlify.com', '')
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
