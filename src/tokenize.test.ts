import test from 'ava'
import * as bbc from './tokenize'

test('tokenizing open tags', t => {
  t.deepEqual(bbc.tokenize(`[b]`), [{ type: 'open-tag', text: '[b]', tag: 'b', value: '' }])
})

test('tokenizing close tags', t => {
  t.deepEqual(bbc.tokenize(`[/b]`), [{ type: 'close-tag', text: '[/b]', tag: 'b' }])
})

test('tokenizing text', t => {
  t.deepEqual(bbc.tokenize('hello world'), [{ type: 'text', text: 'hello world' }])
})

test('tokenizing everything', t => {
  t.deepEqual(bbc.tokenize('test [b]hello[/b] [i]world[/i] test'), [
    { type: 'text', text: 'test ' },
    { type: 'open-tag', tag: 'b', text: '[b]', value: '' },
    { type: 'text', text: 'hello' },
    { type: 'close-tag', tag: 'b', text: '[/b]' },
    { type: 'text', text: ' ' },
    { type: 'open-tag', tag: 'i', text: '[i]', value: '' },
    { type: 'text', text: 'world' },
    { type: 'close-tag', tag: 'i', text: '[/i]' },
    { type: 'text', text: ' test' }
  ])
})

test('open tag value', t => {
  const token = bbc.tokenize(`[url=my.website]google[/url]`)[0] as bbc.OpenTagToken
  t.is(token.type, 'open-tag')
  t.is(token.value, 'my.website')
})
