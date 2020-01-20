---
title: How to use Camaro to parse XML to JSON
excerpt: A brief guide on XPath
date: 2020-01-20
tags:
- javascript
---

[Camaro](https://github.com/tuananh/camaro) is a NodeJS library to transform XML to JSON using [XPath](https://developer.mozilla.org/en-US/docs/Web/XPath) template format.

### Usage

``` js
const { transform } = require('camaro')

const parseFeed = async (input) => {
  // Specify input in the 1st parameter, template in the 2nd parameter
  const output = await transform(input, { text: 'feed' })
  console.log(output)
}

parseFeed(`
<feed>foo</feed>
`)

// { text: 'foo' }
```

The following examples use Atom/RSS2 format for illustration purpose only and do not necessarily conform to the W3C standard.

### Text

Text value of an element

- Input:

  ``` xml
  <feed>foo</feed>
  ```

- Template: `{ text: 'feed' }`
- Output: `{ text: 'foo' }`

### Text (second level)

Text value of an element located in second level

- Input:

  ``` xml
  <feed>
    <title>foo</title>
  </feed>
  ```

- Template: `{ text: 'feed/title' }`
- Output: `{ text: 'foo' }`

### Text (all level)

If the element is located in very deep level, instead of using `locate/very/deep/level`, you can use double-slash prefix. This only works if the element name is unique.

- Input:

  ``` xml
  <rss>
    <channel>
      <title>foo</title>
    </channel>
  </rss>
  ```

- Template: `{ text: '//title' }`
- Output: `{ text: 'foo' }`

### Text (distinct elements)

- Input:

  ``` xml
  <feed>
    <title>foo</title>
    <updated>2020</updated>
  </feed>
  ```

- Template: `{ title: 'feed/title', updated: 'feed/updated' }`
- Output: `{ title: 'foo', updated: '2020' }`

### Attribute

Parse value of an attribute

- Input:

  ``` xml
  <feed>
    <link href="example.com"/>
  </feed>
  ```

- Template: `{ feedLnk: 'feed/link/@href' }`
- Output: `{ feedLnk: 'example.com' }`

### Text (multiple elements)

Parse all entries of a specified element

- Input:

  ``` xml
  <feed>
    <entry>
      <title>first</title>
    </entry>
    <entry>
      <title>second</title>
    </entry>
  </feed>
  ```

- Template:

  ``` js
  { items: [ 'feed/entry', { title: 'title' } ] }
  ```

- Output:

  ``` json
  {
    "items": [
      {
        "title": "first"
      },
      {
        "title": "second"
      }
    ]
  }
  ```

### Text (similar elements, similar sub-entries)

Parse all sub-entries of a specified element

- Input:

  ``` xml
  <feed>
    <entry>
      <title>title A</title>
      <category>apple</category>
      <category>orange</category>
    </entry>
    <entry>
      <title>title B</title>
      <category>peach</category>
      <category>mango</category>
    </entry>
  </feed>
  ```

- Template:

  ``` js
  {
    items: [
      'feed/entry',
      {
        title: 'title',
        category: [
          'category',
          '.'
        ]
      }
    ]
  }
  ```

- Output:

  ``` json
  {
    "items": [
      {
        "title": "title A",
        "category": [
          "apple",
          "orange"
        ]
      },
      {
        "title": "title B",
        "category": [
          "peach",
          "mango"
        ]
      }
    ]
  }
  ```

### Attribute (multiple elements, multiple sub-entries)

Parse all sub-entries of a specified element

- Input:

  ``` xml
  <feed>
    <entry>
      <title>title A</title>
      <category term="apple"/>
      <category term="orange"/>
    </entry>
    <entry>
      <title>title B</title>
      <category term="peach"/>
      <category term="mango"/>
    </entry>
  </feed>
  ```

- Template:

  ``` js
  {
    items: [
      'feed/entry',
      {
        title: 'title',
        category: [
          'category',
          '@term'
        ]
      }
    ]
  }
  ```

- Output:

  ``` json
  {
    "items": [
      {
        "title": "title A",
        "category": [
          "apple",
          "orange"
        ]
      },
      {
        "title": "title B",
        "category": [
          "peach",
          "mango"
        ]
      }
    ]
  }
  ```
