type StickyMatcher = (input: string, pos: number) => string[]
type TokenMatcher = (input: string, pos: number) => string[]
type TokenMatcherPredicate = (...matches: string[]) => Object

type Token
  = { type: 'text', text: string }
  | { type: 'open-tag', text: string, name: string, attr: ?string }
  | { type: 'close-tag', text: string, name: string }

type TreeNode = { type: 'tree', nodes: Node[] }
type TagNode = { type: 'tag', name: string, content: ContentNode, text: string }
type ContentNode = { type: 'content', nodes: Node[], text: string, end: number }
type TextNode = { type: 'text', text: string }

type Node
  = TreeNode
  | TagNode
  | ContentNode
  | TextNode

type TagDefinition = {
  [tag: string]: {
    render: (text: string, attr?: string) => string,
    deep: boolean,
  }
}
