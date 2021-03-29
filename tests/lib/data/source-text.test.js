/* eslint-env jest */
/* eslint-disable no-unused-vars */

import SourceText from '@/lib/data/source-text'
import AppController from '@/lib/controllers/app-controller.js'
import Metadata from '@/lib/data/metadata.js'
import MetadataTerm from '@/lib/data/metadata-term.js'

describe('source-text.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  let appC
  beforeAll(async () => {
    appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })
    appC.defineStore()
    appC.defineL10Support()
    appC.defineNotificationSupport(appC.store)
    await appC.defineSettingsController()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 SourceText - constructor uploads the following fields - textType, text, direction, lang ', () => {
    const sourceText = new SourceText('origin', {
      text: 'some text', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
  
    expect(sourceText).toHaveProperty('textType', 'origin')
    expect(sourceText).toHaveProperty('text', 'some text')
    expect(sourceText).toHaveProperty('direction', 'ltr')
    expect(sourceText).toHaveProperty('lang', 'eng')
    expect(sourceText).toHaveProperty('sourceType', 'text')
    expect(sourceText).toHaveProperty('tokenization', { tokenizer: "simpleLocalTokenizer" })
  })

  it('2 SourceText - update the following fields - textType, text, direction, lang ', () => {
    let sourceText = new SourceText('origin', {
      text: 'some text', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
  
    sourceText.update({
      text: 'target text', direction: 'rtl', lang: 'lat', sourceType: 'tei', tokenization: { tokenizer: "alpheiosRemoteTokenizer", segments: "doubline" }
    })

    expect(sourceText).toHaveProperty('text', 'target text')
    expect(sourceText).toHaveProperty('direction', 'rtl')
    expect(sourceText).toHaveProperty('lang', 'lat')
    expect(sourceText).toHaveProperty('sourceType', 'tei')
    expect(sourceText).toHaveProperty('tokenization', { tokenizer: "alpheiosRemoteTokenizer", segments: "doubline" })

    sourceText.update({
      tokenization: { tokenizer: "alpheiosRemoteTokenizer", segments: "singleline" }
    })

    expect(sourceText).toHaveProperty('text', 'target text')
    expect(sourceText).toHaveProperty('direction', 'rtl')
    expect(sourceText).toHaveProperty('lang', 'lat')
    expect(sourceText).toHaveProperty('sourceType', 'tei')
    expect(sourceText).toHaveProperty('tokenization', { tokenizer: "alpheiosRemoteTokenizer", segments: "singleline" })
  })

  it('3 SourceText - fullyDefined returns true if obligatory fields are defined ', () => {
    let sourceText = new SourceText('origin', {})
    expect(sourceText.fullyDefined).toBeFalsy()

    sourceText.update({
      text: ''
    })
    expect(sourceText.fullyDefined).toBeFalsy()

    sourceText.update({
      text: 'target text'
    })
    expect(sourceText.fullyDefined).toBeFalsy()

    expect(sourceText.direction).toEqual('ltr')
    expect(sourceText.lang).toEqual('eng')

    sourceText.update({
      text: 'target text', direction: 'rtl', lang: 'lat'
    })
    expect(sourceText.fullyDefined).toBeFalsy()

    sourceText.update({
      sourceType: 'text', tokenization: { tokenizer: "alpheiosRemoteTokenizer" }
    })

    expect(sourceText.fullyDefined).toBeTruthy()
  })

  it('4 SourceText - static convertFromJSON creates SourceText object from json if json is defined correctly', () => {
    // no data
    let sourceTextJson = {}
  
    let sourceText = SourceText.convertFromJSON('target', sourceTextJson)
    expect(sourceText).toBeFalsy()

    // data is not fully defined
    sourceTextJson = { text: 'target text' }

    sourceText = SourceText.convertFromJSON('target', sourceTextJson)
    expect(sourceText).toBeInstanceOf(SourceText)
    expect(sourceText).toHaveProperty('text', 'target text')
    expect(sourceText).toHaveProperty('direction', 'ltr')
    expect(sourceText).toHaveProperty('lang', 'eng')
    expect(sourceText).toHaveProperty('sourceType', 'text')

    sourceTextJson = { text: 'target text2', direction: 'rtl', lang: 'grc', sourceType: 'text', tokenization: { tokenizer: "alpheiosRemoteTokenizer", segments: "singleline" } }

    sourceText = SourceText.convertFromJSON('target', sourceTextJson)
    expect(sourceText).toBeInstanceOf(SourceText)
    expect(sourceText).toHaveProperty('text', 'target text2')
    expect(sourceText).toHaveProperty('direction', 'rtl')
    expect(sourceText).toHaveProperty('lang', 'grc')
    expect(sourceText).toHaveProperty('sourceType', 'text')


    
    expect(sourceText).toHaveProperty('tokenization', { tokenizer: "alpheiosRemoteTokenizer", segments: "singleline" })
  })

  it('5 SourceText - add metadata - supports adding metadata in DCMI format', () => {
    const sourceTextJson = { text: 'target text2', direction: 'rtl', lang: 'grc', sourceType: 'text', tokenization: { tokenizer: "alpheiosRemoteTokenizer", segments: "singleline" } }
    let sourceText = SourceText.convertFromJSON('target', sourceTextJson)
    
    sourceText.addMetadata(MetadataTerm.property.TITLE, 'Some test title')

    expect(sourceText.metadata).toEqual(expect.any(Metadata))
    expect(sourceText.getMetadataValue(MetadataTerm.property.TITLE)).toEqual('Some test title')

    sourceText.addMetadata(MetadataTerm.property.TITLE, 'Some another title')
    expect(sourceText.getMetadataValue(MetadataTerm.property.TITLE)).toEqual('Some another title')

    sourceText.addMetadata(MetadataTerm.property.CREATOR, 'The first creator')
    sourceText.addMetadata(MetadataTerm.property.CREATOR, 'The second creator')

    expect(sourceText.getMetadataValue(MetadataTerm.property.CREATOR)).toEqual(['The first creator', 'The second creator'])
  })

})
