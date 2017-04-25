'use strict'

const START_TAG = /^\[([a-z]+)(?:=([^[]+))?\]/
const END_TAG = /^\[\/([a-z]+)\]/

function collectText (input) {
  if (input.length < 1) return ''
  if (input.match(START_TAG) || input.match(END_TAG)) return ''
  return input[0] + collectText(input.slice(1))
}

function matchStartTag (input) {
  const [text, tag, param = null] = input.match(START_TAG) || []
  if (text) return {type: 'start-tag', text, tag, param}
}

function matchEndTag (input) {
  const [text, tag] = input.match(END_TAG) || []
  if (text) return {type: 'end-tag', text, tag}
}

function matchText (input) {
  const text = collectText(input)
  return {type: 'text', text}
}

function tokenize (input) {
  if (input.length < 1) return []

  const node = matchStartTag(input) || matchEndTag(input) || matchText(input)
  return [node].concat(tokenize(input.slice(node.text.length)))
}

function createTree (tokens) {
  function parseTextNode (parser) {
    const token = tokens[parser.position]
    if (token.type === 'text' || token.type === 'end-tag') {
      parser.position++
      return {type: 'text', text: token.text}
    }
  }

  function parseTagPair (parser) {
    let token = tokens[parser.position]
    if (token.type === 'start-tag') {
      const node = {
        type: 'tag-pair',
        tag: token.tag,
        param: token.param,
        children: [],
      }

      token = tokens[++parser.position]

      while (
        parser.position < tokens.length &&
        token.type !== 'end-tag' &&
        token.tag !== node.tag
      ) {
        node.children.push(walk(parser))
        token = tokens[parser.position]
      }

      parser.position++

      return node
    }
  }

  function walk (parser) {
    if (parser.position >= tokens.length) return
    return parseTextNode(parser) || parseTagPair(parser)
  }

  const parser = {position: 0, tree: []}
  while (parser.position < tokens.length) {
    parser.tree.push(walk(parser))
  }
  return parser.tree
}

function parse (tokens) {
  return createTree(tokens)
}

function parseText (text) {
  return parse(tokenize(text))
}

module.exports = {tokenize, parseText}
