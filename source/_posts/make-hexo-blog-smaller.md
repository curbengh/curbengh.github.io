---
title: Make Hexo blog smaller
excerpt: Static site serves html, css, javascript and images. These files can be compressed to reduce bandwidth and speed up the website.
date: 2018-09-28
lastUpdated: 2018-10-06
tags:
- hexo
---

# Minify
[Minify](https://en.wikipedia.org/wiki/Minification_(programming)) html, css, js and svg to remove characters that are not required for the code to function. This process involves removing white space/tab, line break and comments. I read somewhere that Google saves gigabytes of bandwidth just by removing line break, which surprised me how much line break alone costs when you have the popularity of Google.com.
In Hexo, there are two approaches.

### hexo-all-minifier
1. The easiest way is using hexo-all-minifier. Unlike most, this plugin also compress images as well. To use it, simply run the following command in your hexo folder:
    ``` bash
    $ npm install hexo-all-minifier --save
    ```
2. If there is any error during installation, run `$ sudo apt install libpng-dev` and `node node_modules/optipng-bin/lib/install.js`.
2. Above command will add hexo-all-minifer to your `package.json` and install it.
3. To enable it, put `all_minifier: true` line at `_config.yml`.
4. Deploy.

To see this in action, check out this [job log](https://gitlab.com/curben/blog/-/jobs/101703188). As you can see, the resulting files are around 20% smaller. However, do note that its image compression dependencies have some [vulnerabilities](https://snyk.io/test/npm/hexo-all-minifier). This can be patched using [Snyk](https://snyk.io/).

### hexo-yam
Despite the convenience of hexo-all-minifier, I don't use it due to potential vulnerability. I don't need its image compression since the image hosting I'm currently using, [Cloudinary](https://cloudinary.com/), offers [auto compression](https://cloudinary.com/documentation/responsive_images#responsive_images_with_automatic_quality_selection).

So, I switch to a leaner plugin, [hexo-yam](https://github.com/curbengh/hexo-yam). To use it, simply run the following command in your hexo folder:
``` bash
$ npm install hexo-yam --save
```
and deploy.

# Compression
[Compression](https://en.wikipedia.org/wiki/Data_compression) uses more advanced technique to reduce the file size even further. Most modern web browsers support gzip decompression and prefer it (with appropriate HTTP header). As you might know from zipping a text file, this can yield significant reduction in file size. For example, my home page `index.html` is less than half smaller (3.3KB > 1.2KB). Check it out [here](https://gitlab.com/curben/blog/-/jobs/101703188/artifacts/browse/public/).

***Update:*** hexo-yam 0.5.0+ offers gzip and brotli compressions. After you install it, it will automatically compress assets files to `.gz` and `.br` whenever hexo generate/deploy/server. This means the command `$ find ....` as shown below is no longer required.

1. Linux distro has built-in gzip. Install brotli through apt/dnf/yum/pacman.
2. To compress, simply run the following commands after you generate static files (`$ hexo generate`), only `public` folder is affected,
	```bash
	$ find public -type f -iregex '.*\.\(htm\|html\|txt\|text\|js\|css\)$' -execdir gzip -f --keep {} \;
	$ find public -type f -iregex '.*\.\(htm\|html\|txt\|text\|js\|css\)$' -execdir brotli -f --keep {} \;
	```
3. If you use CI like `.gitlab-ci.yml` or `.travis.yml`, simply add the above command under `script:`, after `hexo generate`.
4. Deploy.
