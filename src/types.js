// @flow
export type StickyMatcher = (input: string, pos: number) => string[]
export type TokenMatcher = (input: string, pos: number) => Token
export type TokenMatcherPredicate = (...matches: string[]) => Object

export type Token
  = { type: 'text', text: string, start: number, end: number }
  | { type: 'open-tag', text: string, start: number, end: number, name: string, attr: string }
  | { type: 'close-tag', text: string, start: number, end: number, name: string }

export type TreeNode = {
  type: 'tree',
  nodes: Node[],
}

export type TagNode = {
  type: 'tag',
  name: string,
  attr?: string,
  content: ContentNode,
  text: string,
  outerText: string,
}

export type ContentNode = {
  type: 'content',
  nodes: Node[],
  text: string,
  end: number,
}
export type TextNode = {
  type: 'text',
  text: string,
}

export type Node
  = TreeNode
  | TagNode
  | ContentNode
  | TextNode

export type TagDefinition = {
  [tag: string]: {
    render: (text: string, attr: ?string, outerText: string) => string,
    deep?: boolean,
  }
}
