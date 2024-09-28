/*
* Copy button
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
}, false)
