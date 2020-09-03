/* eslint-env jest */
/* eslint-disable no-unused-vars */

import SourceText from '@/lib/data/source-text'
import AppController from '@/lib/controllers/app-controller.js'

describe('source-text.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  beforeAll(() => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })
    appC.defineL10Support()
  })

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

  it('2 SourceText - update the following fields - textType, text, direction, lang ', () => {
    let sourceText = new SourceText('origin', {
      text: 'some text', direction: 'ltr', lang: 'eng'
    })
  
    sourceText.update({
      text: 'target text', direction: 'rtl', lang: 'lat'
    })

    expect(sourceText).toHaveProperty('text', 'target text')
    expect(sourceText).toHaveProperty('direction', 'rtl')
    expect(sourceText).toHaveProperty('lang', 'lat')
  })

  it('3 SourceText - fullyDefined returns true if obligatory fields are defined ', () => {
    let sourceText = new SourceText('origin', {})
    expect(sourceText.fullyDefined).toBeFalsy()

    sourceText.update({
      text: 'target text'
    })
    expect(sourceText.fullyDefined).toBeFalsy()

    sourceText.update({
      text: 'target text', direction: 'rtl'
    })
    expect(sourceText.fullyDefined).toBeFalsy()

    sourceText.update({
      text: 'target text', direction: 'rtl', lang: 'lat'
    })
    expect(sourceText.fullyDefined).toBeTruthy()
  })

  it('4 SourceText - static convertFromJSON creates SourceText object from json if json is defined correctly', () => {
    // no data
    let sourceTextJson = {}
  
    let sourceText = SourceText.convertFromJSON('origin', sourceTextJson)
    expect(sourceText).toBeFalsy()

    // data is not fully defined
    sourceTextJson = { text: 'target text' }

    sourceText = SourceText.convertFromJSON('origin', sourceTextJson)
    expect(sourceText).toBeFalsy()

    sourceTextJson = { text: 'target text', direction: 'rtl' }

    sourceText = SourceText.convertFromJSON('origin', sourceTextJson)
    expect(sourceText).toBeFalsy()

    // data is correct

    sourceTextJson = { text: 'target text', direction: 'rtl', lang: 'lat' }

    sourceText = SourceText.convertFromJSON('origin', sourceTextJson)
    expect(sourceText).toBeInstanceOf(SourceText)
  })
})