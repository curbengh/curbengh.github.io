#!/bin/sh

## Homepage should exists and non-empty

HOMEPAGE="public/index.html"

if [ ! -f "$HOMEPAGE" ]; then
  echo "Error: homepage doesn't exist"
  exit 1
else
  FILE_SIZE=$(ls -s "$HOMEPAGE" | cut -d" " -f1)
  if [ "$FILE_SIZE" = 0 ]; then
    echo "Error: homepage is empty"
    exit 1
  fi
fi
