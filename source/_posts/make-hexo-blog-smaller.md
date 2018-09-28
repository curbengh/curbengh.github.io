---
title: Make Hexo blog smaller
date: 2018-09-28 00:00:00
tags:
---
Static site serves html, css, javascript and images. These files can be compressed to reduce bandwidth.
<!-- more -->
# Minify
[Minify](https://en.wikipedia.org/wiki/Minification_(programming)) html, css and js to remove characters that are not required for the code to function. This process involves removing white space/tab, line break and comments. I read somewhere that Google saves gigabytes of bandwidth just by removing line break, which surprised me how much line break alone costs when you have the popularity of Google.com.
In Hexo, there are two approaches.

### hexo-all-minifier
1. The easiest way is using hexo-all-minifier. Unlike others, this plugin also compress images as well. To use it, simply add the following line to `package.json`:
	```json
		"hexo-all-minifier": "^0.5.2"
	```
2. Note you should add a comma at the end of previous line, but no comma at the last value. The last few lines look like this:
	```json
		...
		"hexo-renderer-stylus": "latest",
		"hexo-server": "latest",
		"hexo-all-minifier": "^0.5.2"
	  }
	}
	```
3. Run `$ npm install` to install it.
4. To enable it, put `all_minifier: true` line at `_config.yml`.
5. Deploy.

To see this in action, check out this [job log](https://gitlab.com/curben/curben.gitlab.io/-/jobs/101703188). As you can see, the resulting files are around 20% smaller. However, do note that its image compression dependencies have some [vulnerabilities](https://snyk.io/test/npm/hexo-all-minifier). This can be patched using [Snyk](https://snyk.io/).

### hexo-yam
Despite the convenience of hexo-all-minifier, I don't use it due to the vulnerabity. I don't need its image compression as I plan to use [Cloudinary](https://cloudinary.com/) via [hexo-cloudinary](https://github.com/maliMirkec/hexo-cloudinary) plugin.

Thus, I switch to hexo-yam which doesn't offer image compression. To use, add the following line to `package.json`:
```json
    "hexo-yam": "^0.3.0"
```
2. `$ npm install` and enable the plugin by putting `neat_enable: true` to `_config.yml`.
3. Deploy.

# Compression
[Compression](https://en.wikipedia.org/wiki/Data_compression) uses more advanced technique to reduce the file size even further. Most modern web browsers support gzip decompression and prefer it (with appropriate HTTP header). As you might know from zipping a text file, this can yield significant reduction in file size. For example, my home page `index.html` is less than half smaller (3.3KB > 1.2KB). Check it out [here](https://gitlab.com/curben/curben.gitlab.io/-/jobs/101703188/artifacts/browse/public/).

1. To compress, simply run the following command after you generate static files into the `public` folder,
	```bash
	find public -type f -iregex '.*\.\(htm\|html\|txt\|text\|js\|css\)$' -execdir gzip -f --keep {} \;
	```
2. If you use CI like `.gitlab-ci.yml` or `.travis.yml`, simply add the above command under `script:`, next line after `hexo deploy`.
3. Deploy.
