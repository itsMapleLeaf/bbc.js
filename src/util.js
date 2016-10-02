import type {StickyMatcher, TokenMatcher, TokenMatcherPredicate} from './types'

export function newStickyMatcher(pattern: string | RegExp): StickyMatcher {
  const exp = new RegExp(pattern, 'y')
  return (input, pos) => {
    exp.lastIndex = pos
    return exp.exec(input)
  }
}

export function newTokenMatcher(type: string, pattern: string | RegExp, predicate: TokenMatcherPredicate): TokenMatcher {
  const getMatch = newStickyMatcher(pattern)
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
