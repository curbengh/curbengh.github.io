#!/bin/sh

if ! (set -o pipefail 2>/dev/null); then
  # dash does not support pipefail
  set -ex
else
  set -ex -o pipefail
fi

export PATH="$PATH:./node_modules/.bin"

hexo generate

if [ "$NODE_ENV" = "production" ] && [ -d "public/" ]; then
  # deploy site assets
  rm -rf "site/"
  git clone --depth 1 --branch site https://gitlab.com/curben/blog.git site
  cp -r site/* "public/"
  rm -f "public/README.md"

  # deploy microblog
  rm -rf "microblog/"
  git clone --depth 1 --branch microblog https://gitlab.com/curben/blog.git microblog
  cd "microblog/"
  export PATH="$PATH:../node_modules/.bin"
  hexo generate

  cat "rsync-include.txt" | while read include; do
    find "public/" -path "public/$include" -type f | while read file; do
      destdir="../public/$(dirname $file | sed -r 's|^public/?||')"
      mkdir -p "$destdir"
      cp "$file" "$destdir"
    done
  done
fi
