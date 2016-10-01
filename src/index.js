const defaultTags = {
  b: { start: '<strong>', end: '</strong>' },
  i: { start: '<em>', end: '</em>' },
  u: { start: '<u>', end: '</u>' },
  url: { start: (_, url) => `<a href="${url}">`, end: '</a>' },
  color: { start: (_, color) => `<span style="color: ${color}">`, end: '</span>' },
  nobbc: { nobbc: true },
}

function parser(tags = defaultTags) {
  const nobbcExp = new RegExp(Object.keys(tags)
    .filter(tag => tags[tag].nobbc)
    .map(tag => `\\[${tag}(?:=.*?)?]|\\[\\/${tag}]`)
    .join('|'))

  const tagExpressions = {}
  Object.keys(tags).forEach(tag => {
    tagExpressions[tag] = {
      startexp: new RegExp(`\\[${tag}(?:=(.*?))?]`, 'i'),
      endexp: new RegExp(`\\[\\/${tag}]`, 'i'),
    }
  })

  return input => {
    const regions = input.split(nobbcExp)

    for (let i = 0; i < regions.length; i += 2) {
      for (const tag in tags) {
        const { start = '', end = '' } = tags[tag]
        const { startexp, endexp } = tagExpressions[tag]
        while (startexp.test(regions[i]) && endexp.test(regions[i])) {
          regions[i] = regions[i].replace(startexp, start).replace(endexp, end)
        }
      }
    }

    return regions.join('')
  }
}

export { parser }
