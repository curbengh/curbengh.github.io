---
title: Serving pre-compressed files in Caddy 2
excerpt: gzip and brotli files
date: 2020-11-12
tags:
- caddy
---

Caddy v0.9.4+ and v1.0.0+ support pre-compressed gzip and brotli files automatically. However, this feature is [not yet](https://github.com/caddyserver/caddy/issues/2665) implemented in v2 and requires manual configuration. Examples available at the Caddy forum are incomplete, it's either gzip or brotli. The config provided in this guide supports _both_, prioritising brotli if supported by the requesting web browser (and there are .br files), otherwise fallback to gzip.

## Default usage

This configuration supports URL normalisation; when a URL has a trailing slash `http://localhost:8080/about/`, Caddy will serve `http://localhost:8080/about/index.html` using _internal/transparent_ redirect (without 301/302 redirect). If you need to internal redirect `http://localhost:8080/bio` to `http://localhost:8080/bio.html`, refer to the [next section](#Pretty-URLs).

``` plain Caddyfile
http://localhost:8080 {
  bind 127.0.0.1 ::1

  root * /home/user/www
  file_server

  @brotli {
    header Accept-Encoding *br*
    file {
      try_files {path}.br {path}/index.html.br
    }
  }
  handle @brotli {
    header Content-Encoding br
    rewrite {http.matchers.file.relative}
  }

  @gzip {
    header Accept-Encoding *gzip*
    file {
      try_files {path}.gz {path}/index.html.gz
    }
  }
  handle @gzip {
    header Content-Encoding gzip
    rewrite {http.matchers.file.relative}
  }

  @html {
    file
    path *.html */
  }
  header @html Content-Type text/html

  @css {
    file
    path *.css
  }
  header @css Content-Type text/css

  @js {
    file
    path *.js
  }
  header @js Content-Type text/javascript

  @svg {
    file
    path *.svg
  }
  header @svg Content-Type image/svg+xml

  @xml {
    file
    path *.xml
  }
  header @xml Content-Type application/xmlr
  }

  @json {
    file
    path *.json
  }
  header @json Content-Type application/json
}
```

### Content-Type

```
@svg {
  file
  path *.svg
}
header @svg Content-Type image/svg+xml
```

`Content-Type` response header needs to be specified as a workaround, otherwise Caddy responses with `application/gzip`.

### URL normalisation

```
@html {
  file
  path *.html */
}
```

`*/` is to match path with a trailing slash `/path/` since that is (transparently) redirects to `/path/index.html`.

### Dummy files

```
root * /home/user/www
```

I prepared a set of dummy files with most common file extensions ([download](/files/20201112/dummy.zip)). This enables you to test whether Caddy serves the correct file. `.gz` and `.br` files are _not_ compressed files, they are text files so that you can easily identify the file being served. This also means you cannot test it on browsers since the files are not are not actually compressed (you'll get encoding error); also note that web browsers only send `Accept-Encoding: br` request header to HTTPS website.

Unzip the dummy.zip and specify the folder in the `root` directive. Following are some sample tests after you start Caddy:

```
$ curl -i http://localhost:8080/foo.svg -H 'Accept-Encoding: gzip'

# /foo.svg.gz should be served
HTTP/1.1 200 OK
Content-Encoding: gzip
Content-Type: image/svg+xml

svg gz
```

```
$ curl -i http://localhost:8080/foo.svg -H 'Accept-Encoding: gzip,br'

# /foo.svg.br should be served
HTTP/1.1 200 OK
Content-Encoding: br
Content-Type: image/svg+xml

svg br
```

```
$ curl -i http://localhost:8080/foo.svg

# /foo.svg should be served
HTTP/1.1 200 OK
Content-Type: image/svg+xml

svg
```

## Pretty URLs

This configuration supports transparently redirect a URL without trailing slash and file extension, e.g. `http://localhost:8080/bio` to `http://localhost:8080/bio.html`. If you request "bio.html", Caddy still still serve it as usual, without any redirect. This feature is similar to [Netlify's](https://docs.netlify.com/routing/redirects/redirect-options/#trailing-slash).

``` plain Caddyfile
http://localhost:8080 {
  bind 127.0.0.1 ::1

  root * /home/user/www
  file_server
  try_files {path}.html

  @brotli {
    header Accept-Encoding *br*
    file {
      try_files {path}.br {path}/index.html.br {path}.html.br
    }
  }
  handle @brotli {
    header {
      Content-Encoding br
      Content-Type text/html
    }
    rewrite {http.matchers.file.relative}
  }

  @gzip {
    header Accept-Encoding *gzip*
    file {
      try_files {path}.gz {path}/index.html.gz {path}.html.gz
    }
  }
  handle @gzip {
    header {
      Content-Encoding gzip
      Content-Type text/html
    }
    rewrite {http.matchers.file.relative}
  }

  @html {
    file
    path *.html */
  }
  header @html {
    Content-Type text/html
    defer
  }

  @css {
    file
    path *.css
  }
  header @css {
    Content-Type text/css
    defer
  }

  @js {
    file
    path *.js
  }
  header @js {
    Content-Type text/javascript
    defer
  }

  @svg {
    file
    path *.svg
  }
  header @svg {
    Content-Type image/svg+xml
    defer
  }

  @xml {
    file
    path *.xml
  }
  header @xml {
    Content-Type application/xml
    defer
  }

  @json {
    file
    path *.json
  }
  header @json {
    Content-Type application/json
    defer
  }
}
```

Derived from [[1]](https://caddy.community/t/how-to-serve-pre-compressed-files-with-caddy-v2/8760), [[2]](https://caddy.community/t/how-to-serve-gzipped-files-automatically-in-caddy-v2/7311), [[3]](https://caddy.community/t/why-caddy-2-is-not-able-to-serve-static-brotli-files/7653).
