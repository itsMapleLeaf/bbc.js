# bbc.js

> a tiny, flexible BBC parser for JavaScript

## Install

```bash
npm install --save bbc.js
```

## Usage

```js
// require the module
const bbc = require('bbc.js')

// create a new parser object
const parser = bbc.createParser()

// parse BBC to html
// you'll need to style the tags yourself
const bbc = '[b]hello[/b] [i]world![/i]'
const output = parser.parse(bbc) // <span class="bbc-b">hello</span> <span class="bbc-i">world!</span>

// advanced: create a syntax tree
// allows you to render the BBC output however you please!
const tree = parser.tree(bbc) // [ /* lots of info and stuff about the BBC */ ]
```

### Defining custom tags
```js
// create an object
const tags = {
  // convert [b] tags to <strong>
  b: { render: text => `<strong>${text}</strong>` },

  // [img] tags
  // [img=sometext] will use "sometext" as the image alt text
  img: {
    render: (text, alt) => {
      if (alt) {
        return `<img src="${text} alt="${alt}">`
      } else {
        return `<img src="${text}">`
      }
    },

    // make sure this tag doesn't parse any tags inside of it
    deep: false,
  },
}

// pass the tags to createParser
const parser = bbc.createParser(tags)
let output

// outputs <img src="http://funny.website/funny_cat_image.jpg">
output = parser.parse('[img]http://funny.website/funny_cat_image.jpg[/img]')

// default tags are still parsed, but overwritten by custom tags
// outputs: <strong>hello</strong> <span class="bbc-i">world</span>
output = parser.parse('[b]hello[/b] [i]world[/i]')
```

For default supported tags, refer to [`src/index.js`](https://github.com/just-nobody/bbc.js/blob/master/src/index.js).

## Caveats

- Doesn't support single line tags like `[*]` for list items
- Doesn't support advanced attributes, e.g. `[img width=500]...[/img]`
- No way to disable all default tags without overwriting them.

## License

Copyright (c) 2016 just-nobody

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
