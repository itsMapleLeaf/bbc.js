import test from 'ava'
import { toTree } from './bbc'

test('text nodes', t => {
  t.deepEqual(toTree(`hello world`), [{ type: 'text', text: 'hello world' }])
})

test('tag nodes', t => {
  const input = `[b]hello[/b]`

  t.deepEqual(toTree(input), [
    {
      type: 'tag',
      tag: 'b',
      value: '',
      children: [{ type: 'text', text: 'hello' }],
    },
  ])
})

test('empty tag nodes', t => {
  const input = `[b][/b]`

  t.deepEqual(toTree(input), [
    {
      type: 'tag',
      tag: 'b',
      value: '',
      children: [],
    },
  ])
})

test('nested tag nodes', t => {
  const input = `[b]hello [i]world[/i] foobar[/b]`

  t.deepEqual(toTree(input), [
    {
      type: 'tag',
      tag: 'b',
      value: '',
      children: [
        { type: 'text', text: 'hello ' },
        {
          type: 'tag',
          tag: 'i',
          value: '',
          children: [{ type: 'text', text: 'world' }],
        },
        { type: 'text', text: ' foobar' },
      ],
    },
  ])
})

test('unended tag nodes', t => {
  const input = `[b]hello [i]world`

  t.deepEqual(toTree(input), [
    {
      type: 'tag',
      tag: 'b',
      value: '',
      children: [
        { type: 'text', text: 'hello ' },
        {
          type: 'tag',
          tag: 'i',
          value: '',
          children: [{ type: 'text', text: 'world' }],
        },
      ],
    },
  ])
})

test('no error on mixed tags', t => {
  const input = `[b]hello [i]world[/b] test[/i]`

  t.deepEqual(toTree(input), [
    {
      type: 'tag',
      tag: 'b',
      value: '',
      children: [
        { type: 'text', text: 'hello ' },
        {
          type: 'tag',
          tag: 'i',
          value: '',
          children: [
            { type: 'text', text: 'world' },
            { type: 'text', text: '[/b]' },
            { type: 'text', text: ' test' },
          ],
        },
      ],
    },
  ])
})
