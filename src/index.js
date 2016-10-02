// @flow
import {toTree, toHTML} from './parse'
import type {TagDefinition} from './types'

const defaultTags = {
  b: { render: text => `<span class="bbc-b" style="font-weight: bold">${text}</span>` },
  i: { render: text => `<span class="bbc-i" style="font-style: italic">${text}</span>` },
  u: { render: text => `<span class="bbc-u" style="text-decoration: underline">${text}</span>` },
  s: { render: text => `<span class="bbc-s" style="text-decoration: line-through">${text}</span>` },
  color: {
    render: (text, color) => (
      color
        ? `<span class="bbc-color bbc-color-${color}" style="color: ${color}">${text}</span>`
        : text
    ),
  },
  url: {
    render: (text, url) => `<a class="bbc-url" href="${url || text}">${text}</a>`,
    deep: false,
  },
  nobbc: {
    render: text => text,
    deep: false,
  },
}

function createParser(tags: TagDefinition = defaultTags) {
  return (source: string) => {
    return toHTML(source, tags)
  }
}

export { createParser, toTree, toHTML }
