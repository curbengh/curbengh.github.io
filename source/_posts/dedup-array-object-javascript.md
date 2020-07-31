---
title: Remove duplicate objects in an array - JavaScript
excerpt: When all objects have the same keys
date: 2020-07-31
tags:
- javascript
---

Let's say you have an array of objects with duplicate entries:

``` js
const input = [
  { name: 'lorem', item: 'ipsum' },
  { name: 'per', item: 'doming' },
  { name: 'dolor', item: 'lorem' },
  { name: 'usu', item: 'pericula' },
  { name: 'per', item: 'doming' },
  { item: 'doming', name: 'per' },
  { name: 'dolor', item: 'lorem' },
  { name: 'quem', item: 'graece' },
  { item: 'graece', name: 'quem' },
  { name: 'sonet', item: 'labitur' }
];
```

A usual way of removing the duplicate objects is to use [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) and insert each entry into a [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#Remove_duplicate_elements_from_the_array) then convert back to array. This approach can work if the keys are in the same order, but notice that input has two objects with different order than the rest:

{% codeblock lang:js mark:7,10 %}
const input = [
  { name: 'lorem', item: 'ipsum' },
  { name: 'per', item: 'doming' },
  { name: 'dolor', item: 'lorem' },
  { name: 'usu', item: 'pericula' },
  { name: 'per', item: 'doming' },
  { item: 'doming', name: 'per' },
  { name: 'dolor', item: 'lorem' },
  { name: 'quem', item: 'graece' },
  { item: 'graece', name: 'quem' },
  { name: 'sonet', item: 'labitur' }
]
{% endcodeblock %}

In this case, we can use `Object.fromEntries()` and `Object.entries()` to deal with duplicates. This involves two processes:

1. Convert an array of objects to an object.
2. Convert the object back to an array of objects.

The trick here lies with the first step because an object cannot have duplicate keys. Before we use `Object.fromEntries()`, we first remove the keys:

``` js
const stepOne = input.map(({ name, item }) => [name, item])
console.log(stepOne)

[
  [ 'lorem', 'ipsum' ],
  [ 'per', 'doming' ],
  [ 'dolor', 'lorem' ],
  [ 'usu', 'pericula' ],
  [ 'per', 'doming' ],
  [ 'per', 'doming' ],
  [ 'dolor', 'lorem' ],
  [ 'quem', 'graece' ],
  [ 'quem', 'graece' ],
  [ 'sonet', 'labitur' ]
]
```

I'm using Object [destructure](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) here:

``` js
input.map(({ name, item }) => [name, item])

// is equivalent to
input.map((element) => [element.name, element.item])
```

Then we pass `stepOne` to `Object.entries`:

``` js
const stepTwo = Object.entries(stepOne)
console.log(stepTwo)

{
  lorem: 'ipsum',
  per: 'doming',
  dolor: 'lorem',
  usu: 'pericula',
  quem: 'graece',
  sonet: 'labitur'
}
```

Now we have a de-duplicated object. Then, we use `Object.entries()` to convert it to an array:

``` js
const stepThree = Object.entries(stepTwo)
console.log(stepThree)

[
  [ 'lorem', 'ipsum' ],
  [ 'per', 'doming' ],
  [ 'dolor', 'lorem' ],
  [ 'usu', 'pericula' ],
  [ 'quem', 'graece' ],
  [ 'sonet', 'labitur' ]
]
```

Finally, we loop through each element to convert it back to object:

``` js
const stepFour = stepThree.map(([name, item]) => {
  return { name, item }
})

console.log(stepFour)

[
  { name: 'lorem', item: 'ipsum' },
  { name: 'per', item: 'doming' },
  { name: 'dolor', item: 'lorem' },
  { name: 'usu', item: 'pericula' },
  { name: 'quem', item: 'graece' },
  { name: 'sonet', item: 'labitur' }
]
```

``` js
const stepFour = stepThree.map(([name, item]) => {
  return {
    name,
    item
  }
})

// is equivalent to
const stepFour = stepThree.map((element) => {
  return {
    name: element[0],
    item: element[1]
  }
})
```

To put everything together:

``` js
// in one-line
const output = Object.entries(Object.fromEntries(input.map(({ name, item }) => [name, item]))).map(([name, item]) => { return { name, item } })

// in a function
const dedup = (inArray) => {
  return Object.entries(Object.fromEntries(input.map(({ name, item }) => {
    return [name, item]
  })))
    .map(([name, item]) => {
      return { name, item }
    })
}

const output = dedup(input)
```
