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

function createNodeList(tokens, pos = 0, nodes = [], currentTag) {
  if (pos >= tokens.length - 1) {
    return nodes
  }

  const token = tokens[pos]
  if (token.type === 'text') {
    const node = { ...token }
    return createNodeList(tokens, pos + 1, nodes.concat([ node ]), currentTag)
  }
  if (token.type === 'open-tag') {
    const children = createNodeList(tokens, pos + 1, [], token.name)

    const { name, start } = token
    const tail = children[children.length - 1]
    const end = tail ? tail.end : token.end
    const node = { type: 'tag', name, children, start, end }

    return createNodeList(tokens, pos + children.length + 2, nodes.concat([ node ]), currentTag)
  }
  if (token.type === 'close-tag') {
    if (token.name === currentTag) {
      return nodes
    }
    else {
      const { text, start, end } = token
      const node = { type: 'text', text, start, end }
      return createNodeList(tokens, pos + 1, nodes.concat([ node ]), currentTag)
    }
  }
}

function renderNode(node) {
  const { type, text, name, children } = node
  if (type === 'text') {
    return text
  }
  else if (type === 'tag') {
    const content = renderNodeList(children)
    return `<${name}>${content}</${name}>`
  }
}

function renderNodeList(nodes) {
  return nodes.map(renderNode).join('')
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

const tree = createNodeList(tokens)

const output = renderNodeList(tree)

// console.log(tokens)
console.log(inspect(tree, { depth: null }))
// console.log(output)
