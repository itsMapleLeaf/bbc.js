import type {Token, TreeNode, TagNode, TagDefinition} from './types'
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

function parseTokens(source: string, position: number = 0, tokens: Token[] = []): Token[] {
  if (position >= source.length - 1) {
    return tokens
  }
  const token = parseToken(source, position)
  return parseTokens(source, token.end, tokens.concat([token]))
}

function createTree(tokens: Token[]): Node[] {
  function getInnerText(nodes) {
    return nodes.map(v => v.outerText || v.text).join('')
  }

  function collectChildren(pos, children, currentTag) {
    if (pos >= tokens.length) {
      if (currentTag) {
        return [children, pos + 1]
      }
      else {
        return [children]
      }
    }

    const token = tokens[pos]

    if (token.type === 'open-tag') {
      const [tagChildren, next, endToken] = collectChildren(pos + 1, [], token)
      const { name, attr } = token
      const open = token.text
      const close = endToken ? endToken.text : ''
      const innerText = getInnerText(tagChildren)
      const outerText = open + innerText + close
      const node = { type: 'tag', name, attr, children: tagChildren, open, close, innerText, outerText }
      return collectChildren(next, children.concat([ node ]), currentTag)
    }

    if (token.type === 'close-tag' && token.name === currentTag.name) {
      return [children, pos + 1, token]
    }

    // render as a text node if other cases failed
    const node = { type: 'text', text: token.text }
    return collectChildren(pos + 1, children.concat([ node ]), currentTag)
  }

  const [children] = collectChildren(0, [])
  return children
}

export function renderNode(node: Node, tags: TagDefinition): string {
  if (node.type === 'text') {
    return node.text
  }
  else if (node.type === 'tag') {
    const tag = tags[node.name]
    if (tag != null) {
      const innerText = tag.deep === false ? node.innerText : node.children.map(node => renderNode(node, tags)).join('')
      const output = tag.render ? tag.render(innerText, node.attr, node.outerText) : innerText
      return output
    } else {
      return node.open + node.children.map(node => renderNode(node, tags)).join('') + node.close
    }
  }
  else {
    throw new Error(`Unknown node type ${node.type}. ${node}`)
  }
}

export function toTree(source: string): Node {
  const tokens = parseTokens(source)
  return createTree(tokens)
}

export function toHTML(source: string, tags: TagDefinition): string {
  const nodes = toTree(source)
  return nodes.map(node => renderNode(node, tags)).join('')
}
