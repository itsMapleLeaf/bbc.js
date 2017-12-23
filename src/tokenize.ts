import { matchAt } from './helpers'

export interface OpenTagToken {
  type: 'open-tag'
  text: string
  tag: string
  value: string
}

export interface CloseTagToken {
  type: 'close-tag'
  text: string
  tag: string
}

export interface TextToken {
  type: 'text'
  text: string
}

export type Token = OpenTagToken | CloseTagToken | TextToken

const openTagExpression = /^\[([a-z]+?)(?:=([^\]]+))?\]/i
const closeTagExpression = /^\[\/([a-z]+?)\]/i

function captureOpenTag(bbcString: string, position: number): OpenTagToken | undefined {
  const openTagMatch = matchAt(bbcString, openTagExpression, position)
  if (openTagMatch) {
    const [text, tag, value = ''] = openTagMatch
    const token: OpenTagToken = { type: 'open-tag', text, tag, value }
    return token
  }
}

function captureCloseTag(bbcString: string, position: number): CloseTagToken | undefined {
  const closeTagMatch = matchAt(bbcString, closeTagExpression, position)
  if (closeTagMatch) {
    const [text, tag] = closeTagMatch
    const token: CloseTagToken = { type: 'close-tag', text, tag }
    return token
  }
}

export function tokenize(bbcString: string): Token[] {
  let tokens = [] as Token[]
  let position = 0

  while (position < bbcString.length) {
    const openTagToken = captureOpenTag(bbcString, position)
    if (openTagToken) {
      tokens.push(openTagToken)
      position += openTagToken.text.length
      continue
    }

    const closeTagToken = captureCloseTag(bbcString, position)
    if (closeTagToken) {
      tokens.push(closeTagToken)
      position += closeTagToken.text.length
      continue
    }

    let lastToken = tokens[tokens.length - 1]
    if (lastToken === undefined || lastToken.type !== 'text') {
      lastToken = {
        type: 'text',
        text: '',
      }
      tokens.push(lastToken)
    }

    lastToken.text += bbcString[position]
    position += 1
  }

  return tokens
}
