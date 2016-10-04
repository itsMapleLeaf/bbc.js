import {expect} from 'chai'
import {createParser, toTree} from '../src'

const parse = createParser()

function compare(input, output) {
  expect(parse(input)).to.equal(output)
}

/* eslint no-undef: off */
describe('parser', () => {
  it('parses bbc', () => {
    compare('[b]hello[/b]', '<span class="bbc-b">hello</span>')
    compare('[i]world[/i]', '<span class="bbc-i">world</span>')
  })

  it('parses complex bbc w/ params', () => {
    compare('[url=http://google.com]test[/url]', '<a class="bbc-url" href="http://google.com">test</a>')
  })

  it('supports nesting', () => {
    compare(
      '[color=red]foo [color=blue]bar[/color] [color=green]foobar[/color][/color]',
      '<span class="bbc-color bbc-color-red">foo <span class="bbc-color bbc-color-blue">bar</span> <span class="bbc-color bbc-color-green">foobar</span></span>'
    )
  })

  it('supports nobbc', () => {
    compare(
      '[nobbc][url=http://google.com]hi mom[/url][/nobbc] [u]hi dad[/u]',
      '[url=http://google.com]hi mom[/url] <span class="bbc-u">hi dad</span>'
    )
  })

  it('generates a syntax tree', () => {
    expect(toTree('[b]bolded [i]italicbolded[/i][/b]')).to.deep.equal([
      {
        type: 'tag',
        name: 'b',
        attr: undefined,
        innerText: 'bolded [i]italicbolded[/i]',
        outerText: '[b]bolded [i]italicbolded[/i][/b]',
        open: '[b]',
        close: '[/b]',
        children: [
          {
            type: 'text',
            text: 'bolded ',
          },
          {
            type: 'tag',
            name: 'i',
            attr: undefined,
            innerText: 'italicbolded',
            outerText: '[i]italicbolded[/i]',
            open: '[i]',
            close: '[/i]',
            children: [
              {
                text: 'italicbolded',
                type: 'text',
              },
            ],
          },
        ],
      },
    ])
  })

  it('allows custom tags', () => {
    const parser = createParser({
      awesome: { render: (text, attr) => attr ? `${text} is ${attr} awesome` : `${text} is awesome` },
    })
    expect(parser('[awesome]stuff[/awesome]')).to.equal('stuff is awesome')
    expect(parser('[awesome=super]stuff[/awesome]')).to.equal('stuff is super awesome')
  })

  it('handles unending tags', () => {
    compare(
      '[b]bold [i]italic [url=http://google.com]link',
      '<span class="bbc-b">bold <span class="bbc-i">italic <a class="bbc-url" href="http://google.com">link</a></span></span>'
    )
  })

  it('handles undefined tags', () => {
    compare(
      '[what]???[/what]',
      '[what]???[/what]'
    )
  })

  it('is case insensitive', () => {
    compare(
      '[b]bold[/B]',
      '<span class="bbc-b">bold</span>'
    )
  })
})
