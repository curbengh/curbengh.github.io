// Search button function
document.getElementById('search-click').addEventListener('click', () => {
  searchForm.submit()
}, false)

document.getElementById('search-click-mobile').addEventListener('click', () => {
  searchFormMob.submit()
}, false)

// Hide mobile menu when click outside of the menu
document.addEventListener('click', (evt) => {
  const mainNavDisplay = window.getComputedStyle(document.getElementsByClassName('main-nav')[0]).getPropertyValue('display')
  const mobileNav = document.getElementById('mobile-nav-link')
  const mobileToggle = document.getElementById('mobile-menu-toggle')
  const isClickedOutside = !mobileNav.contains(evt.target)

  // Exit if not in mobile view or menu button is clicked or menu is currently hidden
  // Menu button click triggers `menu-button` and `mobile-menu-toggle`
  if (mainNavDisplay !== 'none' ||
    evt.target.id === 'menu-button' || evt.target.id === 'mobile-menu-toggle' ||
    mobileToggle.checked === false) return

  if (isClickedOutside) {
    mobileToggle.checked = false
  }
}, false)

// Web Share API
// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
// Only available on supporting browsers and HTTPS
if (navigator.share && document.location.protocol === 'https:') {
  const shareBtn = document.getElementById('btnshare')

  // Unhide share-button if supported
  shareBtn.style.display = 'initial'

  shareBtn.addEventListener('click', async () => {
    const query = (selector) => {
      return document.querySelector(selector)
    }

    const title = query('meta[property="og:title"]') ? query('meta[property="og:title"]').content : ''
    const text = query('meta[property="og:description"]') ? query('meta[property="og:description"]').content : ''
    const url = query('link[rel="canonical"]') ? query('link[rel="canonical"]').href : document.location.href

    await navigator.share({ title, text, url })
  }, false)
}

// Use duckduckgo's onion address when the site is accessed via .onion
if (document.location.hostname.endsWith('.onion')) {
  const searchForms = document.querySelectorAll('form#searchForm, form#searchFormMob')

  searchForms.forEach((form) => {
    form.setAttribute('action', 'https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion/')
  })
}

// Remove navigation link of current page
const navLink = document.querySelectorAll('a.main-nav-link, a.mobile-nav-link-a')
navLink.forEach((ele) => {
  const eleHref = new URL(ele.href)
  if (eleHref.pathname === document.location.pathname) {
    const span = document.createElement('span')
    span.className = ele.className
    span.textContent = ele.textContent
    ele.outerHTML = span.outerHTML
  }
})
