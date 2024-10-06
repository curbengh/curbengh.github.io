export async function onRequestGet(context) {
  // const {pathname} = new URL(context.request.url)
  // const imageURL = new URL(pathname, 'https://mdleom.com')
  // const imageRequest = new Request(imageURL, {
  //   headers: context.request.headers
  // })
  // return fetch(imageRequest)
  return context.env.CF_IMAGES.fetch(context.request)
}
