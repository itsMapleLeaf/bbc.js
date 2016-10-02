// @flow
import type {Token, Node, ContentNode, TagDefinition} from './types'
import {newTokenMatcher} from './util'

const identity = value => value

const parseOpenTag = newTokenMatcher('open-tag', /\[([a-z]+?)(?:=(.+?))?]/i, (name, attr) => ({ name, attr }))
const parseCloseTag = newTokenMatcher('close-tag', /\[\/([a-z]+?)]/i, name => ({ name }))
const parseText = newTokenMatcher('text', /(\[*[^\[]+)/i, () => ({}))

function parseToken(input: string, position: number): Token {
  const token = parseOpenTag(input, position)
    || parseCloseTag(input, position)
    || parseText(input, position)
  return token
}

function parseTokens(source: string, position = 0, tokens = []): Token[] {
  if (position >= source.length - 1) {
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
    const { name, attr } = token
    const content: ContentNode = createTree(tokens, pos + 1, [], name)

    if (content) {
      const {text} = content

      const outerText = token.attr
        ? `[${name}=${token.attr}]${text}[/${name}]`
        : `[${name}]${text}[/${name}]`

      const node = { type: 'tag', name, attr, content, text, outerText }
      return createTree(tokens, content.end + 1, nodes.concat([ node ]), currentTag)
    }
  }
  if (token.type === 'close-tag') {
    if (token.name === currentTag) {
      const text = nodes.map(node => node.outerText || node.text).join('')
      return { type: 'content', nodes, text, end: pos }
    }
  }

  // render as a text node if other cases failed
  const node = { type: 'text', text: token.text }
  return createTree(tokens, pos + 1, nodes.concat([ node ]), currentTag)
}

export function renderNode(node: Node, tags: TagDefinition): string {
  if (node.type === 'text') {
    return node.text
  }
  else if (node.type === 'tag') {
    const { render = identity, deep } = tags[node.name] || {}
    const content = deep === false ? node.text : renderNode(node.content, tags)
    const output = render(content, node.attr, node.outerText)
    return output
  }
  else if (node.type === 'content' || node.type === 'tree') {
    return node.nodes.map(node => renderNode(node, tags)).join('')
  }
  else {
    throw new Error(`Unknown node type ${node.type}. Node: ${node}`)
  }
}

export function toTree(source: string): Node {
  const tokens = parseTokens(source)
  return createTree(tokens)
}

export function toHTML(source: string, tags: TagDefinition): string {
  return renderNode(toTree(source), tags)
}
