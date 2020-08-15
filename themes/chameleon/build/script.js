'use strict'

/*
* Normalize chameleon.css using sanitize.css
* Add browser prefixes using autoprefixer
*/

const { readFile, writeFile } = require('fs').promises
const { join, resolve } = require('path')

const deps = ['autoprefixer', 'postcss', 'postcss-normalize']
deps.forEach((dep) => {
  try {
    require.resolve(dep)
  } catch (err) {
    console.error(`Missing "${dep}" dependency. Please install it by running "npm install ${dep}".`)
  }
})

const autoprefixer = require('autoprefixer')
const normalize = require('postcss-normalize')
const postcss = require('postcss')

const build = async () => {
  const cssPath = resolve(__dirname, '../source/css/')
  const cssSource = join(cssPath, '_source.css')
  const cssSave = join(cssPath, 'chameleon.css')
  const inCss = await readFile(cssSource)
  const { css: outCss } = await postcss([normalize, autoprefixer]).process(inCss, { from: cssSource })
  await writeFile(cssSave, outCss)
}

build()
