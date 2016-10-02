import {parse, render} from './parse'

export function toHTML(source) {
  return render(source)
}

export function createTree(source) {
  return parse(source)
}
