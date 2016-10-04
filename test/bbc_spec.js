import {expect} from 'chai'
import {createParser} from '../src'

const parse = createParser()

function compare(input, output) {
  expect(parse(input)).to.equal(output)
}

/* eslint no-undef: off */
describe('parser', () => {
  it('parses bbc', () => {
    compare('[b]hello[/b]', '<span class="bbc-b" style="font-weight: bold">hello</span>')
    compare('[i]world[/i]', '<span class="bbc-i" style="font-style: italic">world</span>')
  })

  it('parses complex bbc w/ params', () => {
    compare('[url=http://google.com]test[/url]', '<a class="bbc-url" href="http://google.com">test</a>')
  })

  it('supports nesting', () => {
    compare(
      '[color=red]foo [color=blue]bar[/color] [color=green]foobar[/color][/color]',
      '<span class="bbc-color bbc-color-red" style="color: red">foo <span class="bbc-color bbc-color-blue" style="color: blue">bar</span> <span class="bbc-color bbc-color-green" style="color: green">foobar</span></span>'
    )
  })

  it('supports nobbc', () => {
    compare(
      '[nobbc][url=http://google.com]hi mom[/url][/nobbc] [u]hi dad[/u]',
      '[url=http://google.com]hi mom[/url] <span class="bbc-u" style="text-decoration: underline">hi dad</span>'
    )
  })

  // TODO: test treegen
  // TODO: test custom tags
  // TODO: test unended tags
  // TODO: test undefined tags
})
