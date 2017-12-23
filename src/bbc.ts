import { Node, parse } from './parse'
import { tokenize } from './tokenize'

export function toTree(bbcString: string): Node[] {
  const tokens = tokenize(bbcString)
  const tree = parse(tokens)
  return tree
}

export * from './parse'
export * from './tokenize'
