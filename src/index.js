import {parse, render} from './parse'

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
    recursive: false,
  },
  nobbc: {
    render: text => text,
    recursive: false,
  },
}

export function createParser(tags = defaultTags) {
  return source => {
    return toHTML(source, tags)
  }
}

export function toHTML(source, tags = defaultTags) {
  return render(source, tags)
}

export function toTree(source) {
  return parse(source)
}
