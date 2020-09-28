---
title: Javascript Unit Testing with Jest
excerpt: Jest = Chai + Mocha + NYC + Sinon
date: 2019-12-30
updated: 2020-09-28
tags:
- javascript
---

Recently, I finally implement unit tests for hexo-yam, which it lacked for too long than I would like. I've grown pretty familiar with Chai + Mocha as part of my work in HexoJS. But I'm not particularly fond of them, due to my [previous](https://github.com/hexojs/hexo-generator-sitemap/pull/66) [frustation](https://github.com/hexojs/hexo-generator-sitemap/pull/70). I started to look for alternatives. Initially, I was intrigued by [ava](https://github.com/avajs/ava) used in [hexo-filter-responsive-images](https://github.com/hexojs/hexo-filter-responsive-images) plugin, but the name just stuck as a todo as I work on more pressing issues in HexoJS.

I planned to release a new major version (v4) of hexo-yam immediately after NodeJS 8 is approaching end-of-life, which is the end of 2019. The highlight of v4 is solely using the native zlib API to do Brotli compression (supported since NodeJS 10.16) and not rely on the iltorb library. I also really, *really* wanted to have unit tests as part of that release too.

A few weeks ago, I stumbled upon Jest through [The State of Javascript 2019](https://2019.stateofjs.com/testing/) which was shared on HN. Jest has the highest satisfaction score among the testing frameworks. I had a quick look at [npmjs](https://www.npmjs.com/package/jest) and noticed the size is smaller than [mocha](https://www.npmjs.com/package/mocha) and [ava](https://www.npmjs.com/package/ava), which I felt weird as it offers much more features. I later found out it has [*a lot*](https://github.com/facebook/jest/blob/9419034d6b575fe2c157453fe8b7d2000be66aad/package.json#L4-L78) of dependencies. The size shown at npmjs is actually misleading when the installation size is 32MB (as of [v24.9](https://packagephobia.now.sh/result?p=jest@24.9.0)), much larger than mocha ([5.5MB](https://packagephobia.now.sh/result?p=mocha@6.2.2)) and ava ([14.8MB](https://packagephobia.now.sh/result?p=ava@2.4.0)). The reason for that is mentioned in the next paragraph.

A quick glance through its [homepage](https://jestjs.io/) shows it has built-in code coverage and mocking, which covers NYC and Sinon. Another look at the quick start [guide](https://jestjs.io/docs/en/getting-started) shows it can execute unit test, which covers Mocha and Chai. All-in-one. So far so good, let's take the plunge.

I skipped the example unit test and jumped right into testing the [`minifyHtml()`](https://github.com/curbengh/hexo-yam/blob/fa6f514a05c7fcff977745c6afeb02e07f59659b/lib/filter.js#L61). I had a rough start as Jest kept complaining it can't find the test, even though I've specified it `$ jest test/filter.test.js`. It was only after I initialised it `$ jest init` and selected "node" environment, that jest managed to execute the test. Jest defaults to ["jsdom"](https://jestjs.io/docs/en/configuration#testenvironment-string) environment, which is browser-like environment different to the scope of hexo-yam. The initialisation resulted in `jest.config.js` with the following content:

``` js
module.exports = {
  "clearMocks": true,
  "coverageDirectory": "coverage",
  "testEnvironment": "node"
}
```

Since it's only three lines and I prefer to minimise the files, I moved the config to package.json instead,

``` json
  "jest": {
    "clearMocks": true,
    "coverageDirectory": "./coverage/",
    "testEnvironment": "node"
  },
```

Now, hexo-yam has many defaults to maximise the compressions. I prefer not to repeat the same config in the unit test, so I declared them as objects and module-export.

Edit (28 Sep 2020): I now find using module-export simply for the purpose of unit testing to be a bit _unhygienic_, so I no longer use this approach, now default config is declared in each test instead.

``` js index.js
// the actual object has many properties, this is just a preview
const htmlDefault = {
  minifyJS: true,
  minifyCSS: true
}

hexo.config.minify.html = Object.assign(htmlDefault, hexo.config.minify.html)

module.exports = {
  htmlDefault
}
```

Then in the test, I simply import `htmlDefault` object,

``` js test/html.test.js
describe('html', () => {
  const { htmlDefault } = require('../index')

  // reset config before each test
  beforeEach(() => {
    hexo.config.minify.html = Object.assign({}, htmlDefault)
  })

  test('default', () => {
    expect(result).toBe(expected)
  })
})
```

On a side note,

``` js
hexo.config.minify.html = htmlDefault
/*
This line wouldn't work because any change to hexo.config.minify.html
also change htmlDefault, as it is a pointer.
In this case, htmlDefault shouldn't be modified, so Object.assign({}, htmlDefault)
is used to clone it and keep those two objects separated
/*
```

The next error I encountered is that `"hexo" is not declared`. This is expected as hexo-yam is a plugin that utilizes "hexo" global object. So, I simply need to install "hexo" as a dev dependency and declare it as a global object.

``` js
const Hexo = require('hexo')
// __dirname (in this case) refers to the test/ folder
// I use it to confine "hexo" to that folder
// In my case, there is actually no practical difference,
// since my unit test doesn't involve filesystem (yet)
// I keep it just in case
const hexo = new Hexo(__dirname)
global.hexo = hexo

describe('html', () => {
})
```

After that, the first unit test ran without any hitch, so I started to write unit tests. Here are some notable functions (called *matchers*) which I found useful,

## [.toContain(item)](https://jestjs.io/docs/en/expect#tocontainitem)

This is equivalent to `String.includes()` and `Array.includes()`.

``` js
const foo = 'Cras dictum feugiat tellus eget convallis'
// Instead of
expect(foo.includes('tellus').toBe(true))

// you can use
expect(foo).toContain('tellus'))
```

When used to check an array, it only checks for *an element*. If you need to check for multiple elements, use `expect.arrayContaining(array)`

## [expect.arrayContaining(array)](https://jestjs.io/docs/en/expect#expectarraycontainingarray)

Check for multiple elements

``` js
const result = ['aliquet', 'leo', 'sit', 'amet']
const expected = ['aliquet', 'amet']
expect(result).toEqual(expect.arrayContaining(expected))
```

## [expect.not.arrayContaining(array)](https://jestjs.io/docs/en/expect#expectnotarraycontainingarray)

``` js
const result = ['aliquet', 'leo', 'sit', 'amet']
const expected = ['blandit', 'tellus']
expect(result).toEqual(expect.not.arrayContaining(expected))
```

## [mock.calls](https://jestjs.io/docs/en/mock-function-api#mockfnmockcalls)

When `verbose:` option is enabled, the plugin would output `${feature}: {path} [${percentage}% saved]` to stdout using `hexo.log.log()`. The percentage is the size difference between the original and minified file.

Example output:

```
html: foo/bar/baz.html [10.10% saved]
```

``` js
test('option - verbose', () => {
  // enable verbose
  hexo.config.minify.html.verbose = true

  // first we mock the hexo.log.log
  hexo.log.log = jest.fn()

  // call the minifier function
  minifyHtml()
})
```

Initially I tested it by using [`.toHaveBeenCalledWith(arg)`](https://jestjs.io/docs/en/expect#tohavebeencalledwitharg1-arg2-)

``` js
expect(hexo.log.log).toHaveBeenCalledWith(`html: foo/bar/baz.html [10.10% saved]`);
```

Then I realized the percentage could change as upstream minifiers get enhanced or even regressed. However, since the test input is just a line of code, it's practically impossible that the percentage will change. Yet, to be safe, I skip checking the percentage,

``` js
expect(hexo.log.log.mock.calls[0][0]).toContain('html: foo/bar/baz.html')
```

`[0][0]`, first dimension [0] refers to the first argument, second dimension [0] referts to the first call. I use this because there is only one argument and the mock call is cleared before every test ([`clearMocks: true`](https://jestjs.io/docs/en/configuration#clearmocks-boolean)) so there is no second call.

## [.toBeDefined()](https://jestjs.io/docs/en/expect#tobedefined)

This is equivalent to `typeof result !== 'undefined'`.

If you want to check for `undefined`, use [`.toBeUnfefined()`](https://jestjs.io/docs/en/expect#tobeundefined)

## [Buffer.equals()](https://nodejs.org/docs/latest-v12.x/api/buffer.html#buffer_buf_equals_otherbuffer)

It's not directly related Jest, but I stumbled upon it through its docs. This is useful when comparing two Buffer objects with different encoding.

``` js
const result = Buffer.from(foo, 'binary')
const expected = Buffer.from(foo, 'base64')

// instead of
expect(result.toString('base64')).toBe(expected)

// use
expect(result.equals(expected)).toBe(true)
```

## Coverage

To show coverage report,

``` diff
package.json
"jest": {
  "clearMocks": true,
+  "collectCoverage": true,
  "coverageDirectory": "coverage",
  "testEnvironment": "node"
},
```

``` diff
.gitignore
+coverage/
```

To upload it codecov, add the following lines to CI config,

``` yml
after_script:
  - npm install codecov
  - codecov
```

and add `CODECOV_TOKEN` to the CI environment variable.

Currently, there are 58 unit tests in hexo-yam which gives 99% of coverage. [This line](https://github.com/curbengh/hexo-yam/blob/fa6f514a05c7fcff977745c6afeb02e07f59659b/lib/filter.js#L207) is the only one not covered. The catches any error thrown by [`zlib.brotliCompress`](https://nodejs.org/docs/latest-v12.x/api/zlib.html#zlib_zlib_brotlicompress_buffer_options_callback).

One way to make it throw error is to pass invalid argument as its option. So far, the only option hexo-yam supported is compression level which takes the value from 1 to 11. One example of invalid argument is to pass non-numeric (e.g. a string) as compression level, but I have a type checking on that which makes it default to 11 if the value is not a number. Another alternative is to use out-of-range level like 9000, but it still doesn't crash even when I put negative number (it does crash `zlib.gzip` though). Another approach is to pass non-string as input, but that crashes hexo's router instead of brotli.
