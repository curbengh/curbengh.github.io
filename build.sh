#!/bin/sh

if ! (set -o pipefail 2>/dev/null); then
  # dash does not support pipefail
  set -ex
else
  set -ex -o pipefail
fi

export PATH="$PATH:./node_modules/.bin"

hexo generate

# deploy site assets
if [ "$NODE_ENV" = "production" ] && [ -d "public/" ]; then
  git clone --depth 1 --branch site https://gitlab.com/curben/blog.git site
  cp -r site/* "public/"
  rm -f "public/README.md"
fi
