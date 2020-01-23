---
title: Make PDF files smaller
excerpt: Convert to grayscale and reduce the resolution.
date: 2019-01-05
tags:
- pdf
---

The most effective ways of reducing the file size of a PDF is by converting to grayscale and reduce the resolution.

Requirement: ghostscript (installed by default in Ubuntu)

## Single PDF

Save the following script as "pdfcompress.sh".

Usage: `sh pdfcompress.sh input.pdf`

The output compressed file is named as "input.compressed.pdf"

```bash
#!/bin/sh

filename=$(basename "$1")
dir=$(dirname "$1")

gs \
  -sOutputFile="$dir/${filename%.*}.compressed.pdf" \
  -sDEVICE=pdfwrite \
  -dPDFSETTINGS=/ebook \
  -sColorConversionStrategy=Gray \
  -sColorConversionStrategyForImages=/Gray \
  -dProcessColorModel=/DeviceGray \
  -dCompatibilityLevel=1.4 \
  -dNOPAUSE -dBATCH -dQUIET \
  "$1"
```


Options ([more info](https://ghostscript.com/doc/current/Ps2pdf.htm#Options)):

- Remove **ColorConversionStrategy**, **ColorConversionStrategyForImages** and **ProcessColorModel** lines to retain colour.
- **PDFSETTINGS**:
  - */default* selects output intended to be useful across a wide variety of uses. 72 DPI.
  - */screen* selects low-resolution output similar to the Acrobat Distiller "Screen Optimized" setting. 72 DPI.
  - */ebook* selects medium-resolution output similar to the Acrobat Distiller "eBook" setting. 150 DPI.
  - */printer* selects output similar to the Acrobat Distiller "Print Optimized" setting. 300 DPI.
  - */prepress* selects output similar to Acrobat Distiller "Prepress Optimized" setting. 300 DPI.

## PDFs in a folder

Use the following script to compress all PDFs in a folder.

Usage: `sh pdfcompress.sh 'target folder'`

*If `'target folder'` is not specified, defaults to current directory.*

```bash
#!/bin/sh

if [ -n "$1" ]; then
  cd "$1"
fi

for i in *.pdf; do
    [ -f "$i" ] || break

  # Skip compressed PDFs
  echo "$i" | grep --quiet ".compressed.pdf"

  if [ $? = 1 ]; then
    gs \
      -sOutputFile="${i%.*}.compressed.pdf" \
      -sDEVICE=pdfwrite \
      -dPDFSETTINGS=/ebook \
      -sColorConversionStrategy=Gray \
      -sColorConversionStrategyForImages=/Gray \
      -dProcessColorModel=/DeviceGray \
      -dCompatibilityLevel=1.4 \
      -dNOPAUSE -dBATCH -dQUIET \
      "$i"
  fi
done
```

If you prefer to use the original filename as the compressed version and rename the original uncompressed's to "*.original.pdf",

*Following script doesn't skip previously compressed PDFs*

```bash
#!/bin/sh

if [ -n "$1" ]; then
  cd "$1"
fi

for i in *.pdf; do
  [ -f "$i" ] || break

  # Rename original file to *.original.pdf
  original="${i%.*}.original.pdf"
  mv "$i" "$original"

  gs \
    -sOutputFile="$i" \
    -sDEVICE=pdfwrite \
    -dPDFSETTINGS=/ebook \
    -sColorConversionStrategy=Gray \
    -sColorConversionStrategyForImages=/Gray \
    -dProcessColorModel=/DeviceGray \
    -dCompatibilityLevel=1.4 \
    -dNOPAUSE -dBATCH -dQUIET \
    "$original"
done
```

<br/><br/>
Source: [Internal Pointers](https://www.internalpointers.com/post/compress-pdf-file-ghostscript-linux), [firstdoit](https://gist.github.com/firstdoit/6390547), [ahmed-musallam](https://gist.github.com/ahmed-musallam/27de7d7c5ac68ecbd1ed65b6b48416f9), [Ghostscript Docs](https://ghostscript.com/doc/current/Ps2pdf.htm)
