import {newTokenMatcher} from './util'

const parseOpenTag = newTokenMatcher('open-tag', /\[([a-z]+?)(?:=(.+?))?]/i, (name, attr) => ({ name, attr }))
const parseCloseTag = newTokenMatcher('close-tag', /\[\/([a-z]+?)]/i, name => ({ name }))
const parseText = newTokenMatcher('text', /(\[*[^\[]+)/i, () => ({}))

function parseToken(input, position) {
  return parseOpenTag(input, position)
    || parseCloseTag(input, position)
    || parseText(input, position)
}

function parseTokens(source, position = 0, tokens = []) {
  if (position >= input.length - 1) {
    return tokens
  }
  const token = parseToken(source, position)
  if (token) {
    return getTokensFromSource(source, token.end, tokens.concat([token]))
  } else {
    throw new Error('we fucked up')
  }
}

function createTree(tokens, pos = 0, nodes = [], currentTag) {
  if (pos >= tokens.length) {
    return { type: 'tree', nodes }
  }

  const token = tokens[pos]
  if (token.type === 'open-tag') {
    const { name, start } = token
    const content = createTree(tokens, pos + 1, [], name)

    if (content) {
      const tail = content.nodes[content.nodes.length - 1]
      const end = tail ? tail.end : token.end
      const node = { type: 'tag', name, content }
      return createTree(tokens, content.endPosition + 1, nodes.concat([ node ]), currentTag)
    }
  }
  if (token.type === 'close-tag') {
    if (token.name === currentTag) {
      return { type: 'content', nodes, endPosition: pos }
    }
  }

  // render as a text node if other cases failed
  const node = { type: 'text', text: token.text }
  return createTree(tokens, pos + 1, nodes.concat([ node ]), currentTag)
}

function renderNode(node) {
  const { type } = node
  if (type === 'text') {
    return node.text
  }
  else if (node.type === 'tag') {
    return `<${node.name}>${renderNode(node.content)}</${node.name}>`
  }
  else if (type === 'content' || type === 'tree') {
    return node.nodes.map(renderNode).join('')
  }
}

export function parse(source) {
  const tokens = parseTokens(source)
  return createTree(tokens)
}

export function render(tree) {
  return renderNode(tree)
}
