// Search button function
document.getElementById('searchClick').addEventListener('click', () => {
  searchForm.submit()
}, false)

document.getElementById('searchClickMob').addEventListener('click', () => {
  searchFormMob.submit()
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
