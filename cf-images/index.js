import { join, relative } from 'node:path'

export default {
  /**
   * Fetch and log a request
   * @param {Request} request
   */
  async fetch (request) {
    const { pathname } = new URL(request.url)

    if (pathname === '/images/favicon.ico') {
      return new Response('', {
        status: 404,
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
    }

    if (/image-resizing/.test(request.headers.get("via"))) {
      return new Response('Request loop', {
        status: 403,
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
    }

    // https://developers.cloudflare.com/images/url-format#supported-formats-and-limitations
    if (!/\.(jpe?g|png|gif|webp)$/i.test(pathname)) {
      return new Response('Invalid file extension', {
        status: 400,
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
    }

    // Cloudflare-specific options are in the cf object.
    const options = { cf: { image: {} } }

    const numParts = pathname.split('/').length
    let imgPath = ''
    // original size
    if (numParts === 4) {
      imgPath = relative('/images', pathname)
    } else if (numParts === 5) {
      // Copy width size from path to request options
      const width = relative('/images', pathname).split('/')[0]
      const validSizes = new Set(['320', '468', '768'])

      if (validSizes.has(width)) {
        imgPath = relative(join('/images', width), pathname)
        options.cf.image.width = width
        // serve original size if width is larger
        options.cf.image.fit = 'scale-down'
      } else {
        return new Response('Invalid width', {
          status: 400,
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
      }
    } else {
      return new Response('Invalid path', {
        status: 404,
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
    }

    // Your Worker is responsible for automatic format negotiation. Check the Accept header.
    const accept = request.headers.get('Accept')
    if (/image\/avif/.test(accept)) {
      options.cf.image.format = 'avif'
    } else if (/image\/webp/.test(accept)) {
      options.cf.image.format = 'webp'
    }

    // Build a request that passes through request headers
    // Images are stored on https://gitlab.com/curben/blog/-/tree/site
    const imageURL = new URL(imgPath, 'https://mdleom.com/')
    const imageRequest = new Request(imageURL, {
      headers: request.headers
    })

    let response = await fetch(imageRequest, options)
    // Reconstruct the Response object to make its headers mutable.
    response = new Response(response.body, response)

    if (response.ok || response.redirected) {
      // Set cache for 1 week
      response.headers.set('Cache-Control', 'max-age=604800, public')
      // Set Vary header
      response.headers.set('Vary', 'Accept')
      return response
    } else if (response.status === 404) {
      // Custom 404 page
      const { readable, writable } = new TransformStream()
      const { status, statusText } = response

      const htmlHeader = new Headers({
        ...Object.fromEntries(request.headers),
        Accept: 'text/html'
      })
      const page404 = new Request('https://mdleom.com/404', {
        headers: htmlHeader
      })
      const res404 = await fetch(page404)
      res404.body.pipeTo(writable)

      return new Response(readable, {
        status,
        statusText,
        headers: {
          ...res404.headers,
          'Cache-Control': 'no-cache',
          'Content-Type': 'text/html; charset=utf-8'
        }
      })
    } else {
      return new Response(`Could not fetch the image, the origin returned HTTP error ${response.status}`, {
        status: response.status,
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
    }
  }
}
