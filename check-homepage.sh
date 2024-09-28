#!/bin/sh

## Homepage should exists and non-empty

HOMEPAGE="public/microblog/index.html"

if [ ! -f "$HOMEPAGE" ]; then
  echo "Error: microblog doesn't exist"
  exit 1
else
  FILE_SIZE=$(ls -s "$HOMEPAGE" | cut -d" " -f1)
  if [ "$FILE_SIZE" = 0 ]; then
    echo "Error: microblog is empty"
    exit 1
  fi
fi
