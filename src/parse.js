import {newTokenMatcher} from './util'
import type {Token, Node, ContentNode, TagDefinition} from './types'

const identity = value => value

const parseOpenTag = newTokenMatcher('open-tag', /\[([a-z]+?)(?:=(.+?))?]/i, (name, attr) => ({ name, attr }))
const parseCloseTag = newTokenMatcher('close-tag', /\[\/([a-z]+?)]/i, name => ({ name }))
const parseText = newTokenMatcher('text', /(\[*[^\[]+)/i, () => ({}))

function parseToken(input: string, position: number): ?Token {
  const token = parseOpenTag(input, position)
    || parseCloseTag(input, position)
    || parseText(input, position)
  if (token) return token
  else throw new Error('we fucked up')
}

function parseTokens(source: string, position = 0, tokens = []): Token[] {
  if (position >= input.length - 1) {
    return tokens
  }
  const token = parseToken(source, position)
  return parseTokens(source, token.end, tokens.concat([token]))
}

function createTree(tokens: Token[], pos = 0, nodes = [], currentTag?: string): Node {
  if (pos >= tokens.length) {
    return { type: 'tree', nodes }
  }

  const token = tokens[pos]
  if (token.type === 'open-tag') {
    const { name, start } = token
    const content: ContentNode = createTree(tokens, pos + 1, [], name)

    if (content) {
      const text = token.text + content.text
      const node = { type: 'tag', name, content, text }
      return createTree(tokens, content.end + 1, nodes.concat([ node ]), currentTag)
    }
  }
  if (token.type === 'close-tag') {
    if (token.name === currentTag) {
      const text = nodes.map(node => node.text).join('') + token.text
      return { type: 'content', nodes, text, end: pos }
    }
  }

  // render as a text node if other cases failed
  const node = { type: 'text', text: token.text }
  return createTree(tokens, pos + 1, nodes.concat([ node ]), currentTag)
}

export function renderNode(node: Node, tags: TagDefinition): string {
  const { type } = node
  if (type === 'text') {
    return node.text
  }
  else if (node.type === 'tag') {
    const { render = identity, deep = true } = tags[node.name]
    const content = deep ? renderNode(node.content, tags) : node.text
    return render(content)
  }
  else if (type === 'content' || type === 'tree') {
    return node.nodes.map(renderNode).join('')
  }
}

export function parse(source: string): Node {
  const tokens = parseTokens(source)
  return createTree(tokens)
}
