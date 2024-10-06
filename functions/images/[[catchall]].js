export async function onRequestGet (context) {
  const { pathname } = new URL(context.request.url)
  const imageURL = new URL(pathname, 'https://mdleom.com')
  const headers = new Headers(context.request.headers)
  headers.set('Host', 'mdleom.com')
  const imageRequest = new Request(imageURL, {
    headers
  })
  return fetch(imageRequest)
}
