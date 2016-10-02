import {parse, renderNode} from './parse'

const defaultTags = {
  b: { render: text => `<span class="bbc-b" style="font-weight: bold">${text}</span>` },
  i: { render: text => `<span class="bbc-i" style="font-style: italic">${text}</span>` },
  u: { render: text => `<span class="bbc-u" style="text-decoration: underline">${text}</span>` },
  s: { render: text => `<span class="bbc-s" style="text-decoration: line-through">${text}</span>` },
  color: {
    render: (text, color) => (
      `<span class="bbc-color bbc-color-${color}" style="color: ${color}">${text}</span>`
    )
  },
  url: {
    render: (text, url = text) => `<a class="bbc-url" href="${url}">${text}</a>`,
    deep: false,
  },
  nobbc: {
    render: text => text,
    deep: false,
  },
}

export function createParser(tags: TagDefinition = defaultTags) {
  return source => {
    return toHTML(source, tags)
  }
}

export function toHTML(source: string, tags: TagDefinition = defaultTags) {
  return renderNode(source, tags)
}

export function toTree(source: string) {
  return parse(source)
}
