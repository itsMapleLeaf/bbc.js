import {expect} from 'chai'
import * as bbc from '../src'

describe('parser', () => {
  const parse = bbc.parser()

  it('parses bbc', () => {
    expect(parse('[b]hello[/b] [i]world[/i]')).to.equal(`<strong>hello</strong> <em>world</em>`)
  })

  it('parses complex bbc w/ params', () => {
    expect(parse('[url=http://google.com]test[/url]')).to.equal(`<a href="http://google.com">test</a>`)
  })

  it('supports nesting', () => {
    expect(parse('[color=red]foo [color=blue]bar[/color] [color=green]foobar[/color][/color]'))
      .to.equal(`<span style="color: red"></span>foo <span style="color: blue"></span>bar</span> <span style="color: green"></span>foobar</span></span>`)
  })

  it('supports nobbc', () => {
    expect(parse('[nobbc][url=http://google.com]hi mom[/url][/nobbc] [u]hi dad[/u]'))
      .to.equal('[url=http://google.com]hi mom[/url] <u>hi dad</u>')
  })
})
