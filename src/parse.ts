import { Token } from './tokenize'

export interface TextNode {
  type: 'text'
  text: string
}

export interface TagNode {
  type: 'tag'
  tag: string
  value: string
  children: Node[]
}

export type Node = TextNode | TagNode

export function parse(tokens: Token[]): Node[] {
  let position = 0

  function walk() {
    let token = tokens[position]

    if (token.type === 'open-tag') {
      let node: TagNode = {
        type: 'tag',
        tag: token.tag,
        value: token.value,
        children: [],
      }

      position += 1
      token = tokens[position]

      while (token !== undefined && !(token.type === 'close-tag' && token.tag === node.tag)) {
        node.children.push(walk())
        token = tokens[position]
      }

      position += 1

      return node
    }

    // If we reach this point, the token in question is either a text node, or somehow invalid
    // so we'll just treat it as a text node in any case
    position += 1

    return { type: 'text', text: token.text } as TextNode
  }

  let tree: Node[] = []

  while (position < tokens.length) {
    tree.push(walk())
  }

  return tree
}
