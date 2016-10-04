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
  function getInnerText(children) {
    return children.map(v => v.outerText || v.text).join('')
  }

  function collectChildren(pos, children, currentTag) {
    if (pos >= tokens.length) {
      if (currentTag) {
        const innerText = getInnerText(children)
        const outerText = currentTag.text + innerText
        return [children, pos + 1, innerText, outerText]
      }
      else {
        return [children]
      }
    }

    const token = tokens[pos]

    if (token.type === 'open-tag') {
      const [tagChildren, next, outerText, innerText] = collectChildren(pos + 1, [], token)
      const { name, attr } = token
      const node = { type: 'tag', name, attr, children: tagChildren, outerText, innerText }
      return collectChildren(next, children.concat([ node ]), currentTag)
    }

    if (token.type === 'close-tag' && token.name === currentTag.name) {
      const innerText = getInnerText(children)
      const outerText = currentTag.text + innerText + token.text
      return [children, pos + 1, outerText, innerText]
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
      return node.children.map(node => renderNode(node, tags)).join('')
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
