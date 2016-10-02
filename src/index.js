import {parse, render} from './parse'

export function createParser(tags) {
  return source => {
    return toHTML(source, tags)
  }
}

export function toHTML(source, tags) {
  return render(source, tags)
}

export function toTree(source) {
  return parse(source)
}
