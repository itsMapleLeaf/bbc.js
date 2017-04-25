const test = require('ava')
const bbc = require('./index')

test('matching tags', t => {
  t.deepEqual(bbc.tokenize(`[b]hello[/b] [i]world[/i] foobar`), [
    {type: 'start-tag', text: '[b]', tag: 'b', param: null},
    {type: 'text', text: 'hello'},
    {type: 'end-tag', text: '[/b]', tag: 'b'},
    {type: 'text', text: ' '},
    {type: 'start-tag', text: '[i]', tag: 'i', param: null},
    {type: 'text', text: 'world'},
    {type: 'end-tag', text: '[/i]', tag: 'i'},
    {type: 'text', text: ' foobar'},
  ])
})

test('matching tag params', t => {
  t.deepEqual(bbc.tokenize('[color=red]i am red[/color]'), [
    {type: 'start-tag', text: '[color=red]', tag: 'color', param: 'red'},
    {type: 'text', text: 'i am red'},
    {type: 'end-tag', text: '[/color]', tag: 'color'},
  ])
})

test('parsing a single text node', t => {
  t.deepEqual(bbc.parseBBC('foo bar'), [{type: 'text', text: 'foo bar'}])
})

test('parsing unmatched end tags as text', t => {
  t.deepEqual(bbc.parseBBC('[/foo][/bar]'), [
    {type: 'text', text: '[/foo]'},
    {type: 'text', text: '[/bar]'},
  ])
  t.deepEqual(bbc.parseBBC('[/foo] test [/bar]'), [
    {type: 'text', text: '[/foo]'},
    {type: 'text', text: ' test '},
    {type: 'text', text: '[/bar]'},
  ])
})

test('parsing flat tag pairs', t => {
  t.deepEqual(bbc.parseBBC('[b]foo[/b] [color=red]bar[/color]'), [
    {
      type: 'tag-pair',
      tag: 'b',
      param: null,
      children: [{type: 'text', text: 'foo'}],
    },
    {
      type: 'text',
      text: ' ',
    },
    {
      type: 'tag-pair',
      tag: 'color',
      param: 'red',
      children: [{type: 'text', text: 'bar'}],
    },
  ])
})

test('parsing nesty tag pairs', t => {
  t.deepEqual(bbc.parseBBC('[foo][bar]test[/bar][/foo]'), [
    {
      type: 'tag-pair',
      tag: 'foo',
      param: null,
      children: [
        {
          type: 'tag-pair',
          tag: 'bar',
          param: null,
          children: [{type: 'text', text: 'test'}],
        },
      ],
    },
  ])
})

test('parsing unclosed tags', t => {
  t.deepEqual(bbc.parseBBC('[foo][bar]test'), [
    {
      type: 'tag-pair',
      tag: 'foo',
      param: null,
      children: [
        {
          type: 'tag-pair',
          tag: 'bar',
          param: null,
          children: [{type: 'text', text: 'test'}],
        },
      ],
    },
  ])
})

test('rendering', t => {
  t.is(bbc.renderBBC('[b]foo[/b] [i]bar[/i]'), '<b>foo</b> <i>bar</i>')
})
