// @flow
import {toTree, toHTML} from './parse'
import type {TagDefinition} from './types'

const defaultTags = {
  b: { render: text => `<span class="bbc-b">${text}</span>` },
  i: { render: text => `<span class="bbc-i">${text}</span>` },
  u: { render: text => `<span class="bbc-u">${text}</span>` },
  s: { render: text => `<span class="bbc-s">${text}</span>` },
  sup: { render: text => `<span class="bbc-sup">${text}</span>` },
  sub: { render: text => `<span class="bbc-sub">${text}</span>` },
  color: {
    render: (text, color) => (
      color
        ? `<span class="bbc-color bbc-color-${color}">${text}</span>`
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
