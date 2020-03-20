// Search button function
document.getElementById('searchClick').addEventListener('click', () => {
  searchForm.submit()
}, false)

document.getElementById('searchClickMob').addEventListener('click', () => {
  searchFormMob.submit()
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
