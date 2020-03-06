// Search button function
document.getElementById('searchClick').addEventListener('click', () => {
  searchForm.submit()
}, false)

document.getElementById('searchClickMob').addEventListener('click', () => {
  searchFormMob.submit()
}, false)

// Use duckduckgo's onion address when the site is accessed via .onion
if (document.location.hostname.endsWith('.onion')) {
  const searchForms = document.querySelectorAll('form#searchForm, form#searchFormMob')

  searchForms.forEach((form) => {
    form.setAttribute('action', 'https://3g2upl4pq6kufc4m.onion/')
  })
}
