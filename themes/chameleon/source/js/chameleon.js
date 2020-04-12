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
  document.getElementById('share-click').addEventListener('click', async () => {
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
    form.setAttribute('action', 'https://3g2upl4pq6kufc4m.onion/')
  })
}
