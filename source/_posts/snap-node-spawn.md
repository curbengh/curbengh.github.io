---
title: Snap-installed Node.js cannot spawn() a Node.js app
excerpt: spawn()ing node binary itself also doesn't work
date: 2020-08-19
tags:
- javascript
- node.js
---

There is an issue with [Snap-installed](https://github.com/nodesource/distributions#snap) Node.js that has been plaguing me for quite some time. I can [`child_process.spawn()`](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) to execute a system binary (`cat`, `ls`, etc) but not Node.js app binaries (like `npm`)

``` js
const { spawn } = require('child_process')
const npm = spawn('npm', ['--version'])

npm.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`)
})

npm.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`)
})

npm.on('close', (code) => {
  console.log(`child process exited with code ${code}`)
})
```

In above example, `spawn()` simply went straight to the `close` event; this issue also affects `node` binary (`spawn('node', ['--version']`). Initially, I faulted Solus for having outdated version of snapd and moved one.

Recently, I tried to benchmark [hexojs/hexo-renderer-marked#159](https://github.com/hexojs/hexo-renderer-marked/pull/159) using [benchmark.js](https://github.com/hexojs/hexo/blob/3a56d29e59598dd14c5b62efb3edd16b43944c5e/test/benchmark.js) currently used by Hexo to run regression testing. Since benchmark.js heavily utilise `spawn()`, so I could not run the benchmark on my Solus. Then, I tried again on a Ubuntu 20.04 VM and I got the same error message. By then, I realised it wasn't Solus' fault. Since Node.js was also installed via Snap (Ubuntu's apt repo is still hosting v10) in that VM, the issue could be due to Snap with its additional confinement. I reinstalled Node.js using [nvs](https://github.com/jasongin/nvs) and then `spawn()` worked as expected.

This issue had been reported previously to NodeSource (maintainer of Node.js's snap) in [nodesource/distributions#843](https://github.com/nodesource/distributions/issues/843), but unfortunately there was no interest in fixing it.
