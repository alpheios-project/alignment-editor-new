/* eslint-env jest */
/* eslint-disable no-unused-vars */

import SourceText from '@/lib/data/source-text'

describe('source-text.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
    
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 SourceText - constructor uploads the following fields - textType, text, direction, lang ', () => {
    const sourceText = new SourceText('origin', {
      text: 'some text', direction: 'ltr', lang: 'eng'
    })
  
    expect(sourceText).toHaveProperty('textType', 'origin')
    expect(sourceText).toHaveProperty('text', 'some text')
    expect(sourceText).toHaveProperty('direction', 'ltr')
    expect(sourceText).toHaveProperty('lang', 'eng')
  })
})