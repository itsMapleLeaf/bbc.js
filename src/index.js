import {inspect} from 'util'

function stickyMatcher(pattern) {
  const exp = new RegExp(pattern, 'y')
  return (input, pos) => {
    exp.lastIndex = pos
    return exp.exec(input)
  }
}

function tokenMatcher(type, pattern, predicate) {
  const getMatch = stickyMatcher(pattern)
  return (input, position) => {
    const match = getMatch(input, position)
    if (match) {
      const props = predicate(...match.slice(1))
      return {
        type,
        text: match[0],
        start: position,
        end: position + match[0].length,
        ...props,
      }
    }
  }
}

const getOpenTag = tokenMatcher('open-tag', /\[([a-z]+?)(?:=(.+?))?]/i, (name, attr) => ({ name, attr }))
const getCloseTag = tokenMatcher('close-tag', /\[\/([a-z]+?)]/i, name => ({ name }))
const getText = tokenMatcher('text', /(\[*[^\[]+)/i, () => ({}))

function getToken(input, position) {
  return getOpenTag(input, position) || getCloseTag(input, position) || getText(input, position)
}

function getTokens(input, position = 0, tokens = []) {
  if (position >= input.length - 1) {
    return tokens
  }
  const token = getToken(input, position)
  if (token) {
    return getTokens(input, token.end, tokens.concat([token]))
  } else {
    throw new Error('we fucked up')
  }
}

function createNode(tokens, pos = 0, nodes = [], currentTag) {
  if (pos >= tokens.length) {
    return { type: 'tree', nodes }
  }

  const token = tokens[pos]
  if (token.type === 'open-tag') {
    const { name, start } = token
    const content = createNode(tokens, pos + 1, [], name)

    if (content) {
      const tail = content.nodes[content.nodes.length - 1]
      const end = tail ? tail.end : token.end
      const node = { type: 'tag', name, content }
      return createNode(tokens, content.endPosition + 1, nodes.concat([ node ]), currentTag)
    }
  }
  if (token.type === 'close-tag') {
    if (token.name === currentTag) {
      return { type: 'content', nodes, endPosition: pos }
    }
  }

  // render as a text node if other cases failed
  const node = { type: 'text', text: token.text }
  return createNode(tokens, pos + 1, nodes.concat([ node ]), currentTag)
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

const tokens = getTokens(`
  [b]some bold text[/b]
  [i]some italics[/i]
  [color=red]
    i am red
    [color=green]i am green[/color]
  [/color]
  [url=http://www.google.com]go to google[/url]
`)

const tree = createNode(tokens)

const output = renderNode(tree)

// console.log(tokens)
// console.log(inspect(tree, { depth: null }))
console.log(output)
