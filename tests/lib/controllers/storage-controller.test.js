/* eslint-env jest */
/* eslint-disable no-unused-vars */

import AppController from '@/lib/controllers/app-controller.js'
import StorageController from '@/lib/controllers/storage-controller.js'
import SettingsController from '@/lib/controllers/settings-controller.js'

import Alignment from '@/lib/data/alignment.js'
import SourceText from '@/lib/data/source-text.js'
import MetadataTerm from '@/lib/data/metadata-term.js'
import GrcEngKat from '@tests/lib/storage/alignments/grc-eng-kat.json'

import IndexedDB from 'fake-indexeddb'
import IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange'

describe('storage-controller.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
    
  let alignment1
  let userID
  beforeAll(async () => {
    const appC = new AppController({
      appId:'alpheios-alignment-editor'
    })
    
    appC.defineStore()
    appC.defineL10Support()
    appC.defineNotificationSupport(appC.store)
    await appC.defineSettingsController(appC.store)

    alignment1 = Alignment.convertFromJSON(GrcEngKat)
    userID = Alignment.defaultUserID

    window.indexedDB = IndexedDB
    window.IDBKeyRange = IDBKeyRange

  })
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 StorageController - use case - create new alignment and save to IndexedDB', async () => {
    StorageController.definedDBAdapter()

    const alignment = new Alignment()
    const originDocSource = new SourceText('origin', {
      text: 'origin test text', sourceType: 'text', lang: 'grc', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })
    alignment.updateOriginDocSource(originDocSource)

    let result = await StorageController.update(alignment, false, false)
    expect(result).toBeTruthy()

    let alList = await StorageController.select({ userID }) // returns list of alignments

    expect(alList.length).toEqual(1)
    expect(alList[0].langsList).toEqual('grc')

    const targetDocSource = new SourceText('target', {
      text: 'target test text', sourceType: 'text', lang: 'aha', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })
    alignment.updateTargetDocSource(targetDocSource)

    result = await StorageController.update(alignment, false, false)
    expect(result).toBeTruthy()

    alList = await StorageController.select({ userID })

    expect(alList.length).toEqual(1)
    expect(alList[0].langsList).toEqual('grc-aha')


    const alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.docSource.length).toEqual(2)
    expect(alignmentDB.docSource).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'origin', text: 'origin test text', lang: 'grc'
    })]))
    expect(alignmentDB.docSource).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'target', text: 'target test text', lang: 'aha'
    })]))

    await StorageController.clear()

  })

  it('2 StorageController - use case - update existed docSource in IndexedDB', async () => {
    StorageController.definedDBAdapter()
    const alignment = new Alignment()
    const originDocSource = new SourceText('origin', {
      text: 'origin test text', sourceType: 'text', lang: 'grc', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target test text', sourceType: 'text', lang: 'aha', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)

    await StorageController.update(alignment, false, false)

    // initial state of alignment
    let alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 
    expect(alignmentDB.docSource.length).toEqual(2)
    expect(alignmentDB.docSource).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'origin', text: 'origin test text', lang: 'grc'
    })]))
    expect(alignmentDB.docSource).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'target', text: 'target test text', lang: 'aha'
    })]))

    let alList = await StorageController.select({ userID }) // returns list of alignments
    expect(alList[0].langsList).toEqual('grc-aha')


    // let's update origin
    alignment.updateOriginDocSource({
      id: originDocSource.id,
      text: 'new origin text',
      lang: 'kat'
    })

    await StorageController.update(alignment, false, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.docSource.length).toEqual(2)
    expect(alignmentDB.docSource).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'origin', text: 'new origin text', lang: 'kat'
    })]))

    alList = await StorageController.select({ userID }) // returns list of alignments
    expect(alList[0].langsList).toEqual('kat-aha')

    // let's update target
    alignment.updateTargetDocSource({
      id: targetDocSource.id,
      text: 'new target text',
      lang: 'ara'
    })

    await StorageController.update(alignment, false, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.docSource.length).toEqual(2)
    expect(alignmentDB.docSource).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'target', text: 'new target text', lang: 'ara'
    })]))

    alList = await StorageController.select({ userID }) // returns list of alignments
    expect(alList[0].langsList).toEqual('kat-ara')

    await StorageController.clear()

  })

  it('3 StorageController - use case - update metadata on docSource step in IndexedDB', async () => {
    StorageController.definedDBAdapter()
    const alignment = new Alignment()
    const originDocSource = new SourceText('origin', {
      text: 'origin test text', sourceType: 'text', lang: 'grc', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target test text', sourceType: 'text', lang: 'aha', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)

    await StorageController.update(alignment, false, false)

    // add title property - single
    alignment.changeMetadataTerm({ template: true, property: MetadataTerm.property.TITLE }, 'testOriginTitle', 'origin', originDocSource.id)

    await StorageController.update(alignment, false, false)

    let alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.metadata.length).toEqual(1)
    expect(alignmentDB.metadata).toEqual(expect.arrayContaining([expect.objectContaining({
      property: 'title',
      value: 'testOriginTitle'
    })]))

    // update title property - single
    alignment.changeMetadataTerm( alignment.origin.docSource.metadata.getProperty({ id: 'TITLE' }), 'testOriginTitle2', 'origin', originDocSource.id)

    await StorageController.update(alignment, false, false)

    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.metadata.length).toEqual(1)
    expect(alignmentDB.metadata).toEqual(expect.arrayContaining([expect.objectContaining({
      property: 'title',
      value: 'testOriginTitle2'
    })]))

    // add creator - multivalued
    alignment.changeMetadataTerm({ template: true, property: MetadataTerm.property.CREATOR }, 'Original Creator 1', 'origin', originDocSource.id)

    await StorageController.update(alignment, true, false)

    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.metadata.length).toEqual(2)
    expect(alignmentDB.metadata).toEqual(expect.arrayContaining([expect.objectContaining({
      property: 'creator',
      value: [ 'Original Creator 1' ]
    })]))

    // delete title term
    alignment.changeMetadataTerm( alignment.origin.docSource.metadata.getProperty({ id: 'TITLE' }), '', 'origin', originDocSource.id)
    await StorageController.update(alignment, true, false)
    
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.metadata.length).toEqual(1)
    expect(alignmentDB.metadata).toEqual(expect.arrayContaining([expect.objectContaining({
      property: 'creator',
      value: [ 'Original Creator 1' ]
    })]))

    // update creator term - multivalued
    alignment.changeMetadataTerm( alignment.origin.docSource.metadata.getProperty({ id: 'CREATOR' }), 'Original Creator 2', 'origin', originDocSource.id)

    await StorageController.update(alignment, true, false)

    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.metadata.length).toEqual(1)
    expect(alignmentDB.metadata).toEqual(expect.arrayContaining([expect.objectContaining({
      property: 'creator',
      value: [ 'Original Creator 1', 'Original Creator 2' ]
    })]))
    
    // delete all values creator
    alignment.deleteValueByIndex(alignment.origin.docSource.metadata.getProperty({ id: 'CREATOR' }), 0, 'origin')
    alignment.deleteValueByIndex(alignment.origin.docSource.metadata.getProperty({ id: 'CREATOR'}), 0, 'origin')

    await StorageController.update(alignment, true, false)

    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 
   
    StorageController.clear()
  })

  it('4 StorageController - use case - add/delete docSource in IndexedDB', async () => {
    StorageController.definedDBAdapter()
    const alignment = new Alignment()
    const originDocSource = new SourceText('origin', {
      text: 'origin test text', sourceType: 'text', lang: 'grc', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target test text', sourceType: 'text', lang: 'aha', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    // origin and one target
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)

    await StorageController.update(alignment, false, false)
    
    let alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 
    expect(alignmentDB.docSource.length).toEqual(2)
    expect(alignmentDB.docSource).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'origin', text: 'origin test text', lang: 'grc'
    })]))
    expect(alignmentDB.docSource).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'target', text: 'target test text', lang: 'aha'
    })]))


    // add the second target
    const targetDocSource2 = new SourceText('target', {
      text: '2 target test text', sourceType: 'text', lang: 'kat', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    alignment.updateTargetDocSource(targetDocSource2)
    await StorageController.update(alignment, false, false)
    
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 
    expect(alignmentDB.docSource.length).toEqual(3)
    expect(alignmentDB.docSource).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'target', text: '2 target test text', lang: 'kat'
    })]))

    // delete the first target
    alignment.deleteText('target', targetDocSource.id)
    await StorageController.update(alignment, true, false)

    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 
    expect(alignmentDB.docSource.length).toEqual(2)
    expect(alignmentDB.docSource).not.toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'target', text: 'target test text', lang: 'aha'
    })]))

    StorageController.clear()
  })


  it('5 StorageController - use case - prepare texts for alignment in IndexedDB', async () => {
    StorageController.definedDBAdapter()
    const alignment = new Alignment()
    const originDocSource = new SourceText('origin', {
      text: 'origin test text', sourceType: 'text', lang: 'grc', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target test text', sourceType: 'text', lang: 'aha', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)
    await StorageController.update(alignment, false, false)

    await alignment.createAlignedTexts()
    await StorageController.update(alignment, false, false)

    let alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 
    expect(alignmentDB.alignedText.length).toEqual(2)
    expect(alignmentDB.segments.length).toEqual(2)
    expect(alignmentDB.tokens.length).toEqual(6)

    StorageController.clear()
  })
 

  it('6 StorageController - use case - create/update alignment groups in IndexedDB', async () => {
    StorageController.definedDBAdapter()
    const alignment = new Alignment()
    const originDocSource = new SourceText('origin', {
      text: 'origin test text', sourceType: 'text', lang: 'grc', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target test text', sourceType: 'text', lang: 'aha', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)
    await alignment.createAlignedTexts()

    await StorageController.update(alignment, false, false)
    let alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.alignmentGroups).not.toBeDefined()
    
    const originTokens = alignment.origin.alignedText.segments[0].tokens
    const targetTokens = Object.values(alignment.targets)[0].alignedText.segments[0].tokens

    // create an alignment group
    alignment.startNewAlignmentGroup(originTokens[0])
    alignment.addToAlignmentGroup(targetTokens[0])
    alignment.addToAlignmentGroup(targetTokens[1])
    alignment.finishActiveAlignmentGroup()

    await StorageController.update(alignment, false, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 
    
    expect(alignmentDB.alignmentGroups.length).toEqual(1)
    expect(alignmentDB.alignmentGroups[0].origin.length).toEqual(1)
    expect(alignmentDB.alignmentGroups[0].target.length).toEqual(2)

    // create another alignment group
    alignment.startNewAlignmentGroup(originTokens[1])
    alignment.addToAlignmentGroup(targetTokens[2])
    alignment.finishActiveAlignmentGroup()

    await StorageController.update(alignment, false, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 
    
    expect(alignmentDB.alignmentGroups.length).toEqual(2)

    // activate one group - would be deleted
    alignment.activateGroupByToken(originTokens[0])
    await StorageController.update(alignment, true, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.alignmentGroups.length).toEqual(1)
    expect(alignmentDB.alignmentGroups[0].origin.length).toEqual(1)
    expect(alignmentDB.alignmentGroups[0].target.length).toEqual(1)

    // remove token from active group and save it again
    alignment.removeFromAlignmentGroup(targetTokens[1])
    alignment.finishActiveAlignmentGroup()

    await StorageController.update(alignment, false, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.alignmentGroups.length).toEqual(2)
    expect(alignmentDB.alignmentGroups[0].origin.length).toEqual(1)
    expect(alignmentDB.alignmentGroups[0].target.length).toEqual(1)
    expect(alignmentDB.alignmentGroups[1].origin.length).toEqual(1)
    expect(alignmentDB.alignmentGroups[1].target.length).toEqual(1)

    // merge groups
    alignment.activateGroupByToken(originTokens[0])
    alignment.mergeActiveGroupWithAnotherByToken(originTokens[1])
    alignment.finishActiveAlignmentGroup()

    await StorageController.update(alignment, true, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.alignmentGroups.length).toEqual(1)
    expect(alignmentDB.alignmentGroups[0].origin.length).toEqual(2)
    expect(alignmentDB.alignmentGroups[0].target.length).toEqual(2)
    StorageController.clear()
  })


  it('7 StorageController - use case - edit tokens in IndexedDB - update', async () => {
    StorageController.definedDBAdapter()
    const alignment = new Alignment()
    const originDocSource = new SourceText('origin', {
      text: 'origin test text', sourceType: 'text', lang: 'grc', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target test text', sourceType: 'text', lang: 'aha', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)
    await alignment.createAlignedTexts()

    await StorageController.update(alignment, false, false)
    let alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.tokens.length).toEqual(6)
    const originTokens = alignment.origin.alignedText.segments[0].tokens
    const targetTokens = Object.values(alignment.targets)[0].alignedText.segments[0].tokens

    // update token word
    alignment.updateTokenWord(originTokens[0], 'not-origin')
    await StorageController.update(alignment, true, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.tokens.length).toEqual(6)
    expect(alignmentDB.tokens).toEqual(expect.arrayContaining([expect.objectContaining({
        textType: 'origin', word: 'not-origin'
      })]))

    StorageController.clear()
  })

  it('8 StorageController - use case - move tokens to segment in IndexedDB - merge', async () => {
    StorageController.definedDBAdapter()
    const alignment = new Alignment()
    const originDocSource = new SourceText('origin', {
      text: 'origin test text', sourceType: 'text', lang: 'grc', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target test text', sourceType: 'text', lang: 'aha', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)
    await alignment.createAlignedTexts()

    await StorageController.update(alignment, false, false)
    let alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.tokens.length).toEqual(6)
    const originTokens = alignment.origin.alignedText.segments[0].tokens
    const targetTokens = Object.values(alignment.targets)[0].alignedText.segments[0].tokens

    // merge token
    alignment.mergeToken(originTokens[1], 'next')

    await StorageController.update(alignment, true, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.tokens.length).toEqual(5)
    expect(alignmentDB.tokens).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'origin', word: 'test text'
    })]))

    StorageController.clear()
  })

  it('9 StorageController - use case - move tokens to segment in IndexedDB - split', async () => {
    StorageController.definedDBAdapter()
    const alignment = new Alignment()
    const originDocSource = new SourceText('origin', {
      text: 'origin test text', sourceType: 'text', lang: 'grc', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target test text', sourceType: 'text', lang: 'aha', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)
    await alignment.createAlignedTexts()

    await StorageController.update(alignment, false, false)
    let alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.tokens.length).toEqual(6)
    const originTokens = alignment.origin.alignedText.segments[0].tokens
    const targetTokens = Object.values(alignment.targets)[0].alignedText.segments[0].tokens

    // splitToken token
    alignment.splitToken(targetTokens[0], 'tar get')
    await StorageController.update(alignment, true, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.tokens.length).toEqual(7)
    expect(alignmentDB.tokens).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'target', word: 'tar'
    })]))
    expect(alignmentDB.tokens).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'target', word: 'get'
    })]))

    StorageController.clear()
  })

  it('10 StorageController - use case - move tokens to segment in IndexedDB - line break', async () => {
    StorageController.definedDBAdapter()
    const alignment = new Alignment()
    const originDocSource = new SourceText('origin', {
      text: 'origin test text', sourceType: 'text', lang: 'grc', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target test text', sourceType: 'text', lang: 'aha', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)
    await alignment.createAlignedTexts()

    await StorageController.update(alignment, false, false)
    let alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.tokens.length).toEqual(6)
    const originTokens = alignment.origin.alignedText.segments[0].tokens
    const targetTokens = Object.values(alignment.targets)[0].alignedText.segments[0].tokens

    // add line break
    alignment.addLineBreakAfterToken(targetTokens[1])
    await StorageController.update(alignment, true, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    // console.info(alignmentDB.tokens.map(token => { return { textType: token.textType, idWord: token.idWord, word: token.word, hasLineBreak: token.hasLineBreak } }))

    expect(alignmentDB.tokens.length).toEqual(6)
    expect(alignmentDB.tokens).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'target', word: 'test', hasLineBreak: true
    })]))

    // remove line break
    alignment.removeLineBreakAfterToken(targetTokens[1])
    
    await StorageController.update(alignment, true, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.tokens.length).toEqual(6)
    expect(alignmentDB.tokens).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'target', word: 'test', hasLineBreak: false
    })]))

    StorageController.clear()
  })

  it('11 StorageController - use case - move tokens to segment in IndexedDB - insert/delete', async () => {
    StorageController.definedDBAdapter()
    const alignment = new Alignment()
    const originDocSource = new SourceText('origin', {
      text: 'origin test text', sourceType: 'text', lang: 'grc', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target test text', sourceType: 'text', lang: 'aha', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)
    await alignment.createAlignedTexts()

    await StorageController.update(alignment, false, false)
    let alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.tokens.length).toEqual(6)
    const originTokens = alignment.origin.alignedText.segments[0].tokens
    const targetTokens = Object.values(alignment.targets)[0].alignedText.segments[0].tokens

    // deleteToken

    alignment.deleteToken(targetTokens[2])
    await StorageController.update(alignment, true, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.tokens.length).toEqual(5)
    expect(alignmentDB.tokens).not.toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'target', word: 'text'
    })]))

    // insertTokens
    alignment.insertTokens('insert tokens', originTokens[1], 'next')
    await StorageController.update(alignment, true, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    // console.info(alignmentDB.tokens.map(token => { return { textType: token.textType, idWord: token.idWord, word: token.word, hasLineBreak: token.hasLineBreak } }))

    expect(alignmentDB.tokens.length).toEqual(7)

    expect(alignmentDB.tokens).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'origin', word: 'insert'
    })]))

    expect(alignmentDB.tokens).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'origin', word: 'tokens'
    })]))

    // undo last action
    alignment.undoTokensEditStep()
    await StorageController.update(alignment, true, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 
    expect(alignmentDB.tokens.length).toEqual(5)
    expect(alignmentDB.tokens).not.toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'origin', word: 'insert'
    })]))
    expect(alignmentDB.tokens).not.toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'origin', word: 'tokens'
    })]))

    // redo last action
    alignment.redoTokensEditStep()
    await StorageController.update(alignment, true, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 
    expect(alignmentDB.tokens.length).toEqual(7)
    expect(alignmentDB.tokens).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'origin', word: 'insert'
    })]))
    expect(alignmentDB.tokens).toEqual(expect.arrayContaining([expect.objectContaining({
      textType: 'origin', word: 'tokens'
    })]))
    StorageController.clear()
  })

  it('12 StorageController - use case - move tokens to segment in IndexedDB', async () => {
    StorageController.definedDBAdapter()
    const alignment = new Alignment()
    const originDocSource = new SourceText('origin', {
      text: 'origin test text\u2028second origin segment', sourceType: 'text', lang: 'grc', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target test text\u2028second target segment', sourceType: 'text', lang: 'aha', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)
    await alignment.createAlignedTexts()

    await StorageController.update(alignment, false, false)
    let alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.segments.length).toEqual(4)
    expect(alignmentDB.tokens.filter(token => token.textType === 'origin' && token.segmentIndex === 1).length).toEqual(3)
    expect(alignmentDB.tokens.filter(token => token.textType === 'origin' && token.segmentIndex === 2).length).toEqual(3)
    expect(alignmentDB.tokens.filter(token => token.textType === 'target' && token.segmentIndex === 1).length).toEqual(3)
    expect(alignmentDB.tokens.filter(token => token.textType === 'target' && token.segmentIndex === 2).length).toEqual(3)

    const originTokens = alignment.origin.alignedText.segments[0].tokens
    const targetTokens = Object.values(alignment.targets)[0].alignedText.segments[0].tokens

    // move to next segments
    alignment.moveToSegment(originTokens[2], 'next')
    await StorageController.update(alignment, true, false)
    alignmentDB = await StorageController.select({ userID, alignmentID: alignment.id }, 'alignmentByAlIDQuery') 

    expect(alignmentDB.segments.length).toEqual(4)
    expect(alignmentDB.tokens.filter(token => token.textType === 'origin' && token.segmentIndex === 1).length).toEqual(2)
    expect(alignmentDB.tokens.filter(token => token.textType === 'origin' && token.segmentIndex === 2).length).toEqual(4)
    expect(alignmentDB.tokens.filter(token => token.textType === 'target' && token.segmentIndex === 1).length).toEqual(3)
    expect(alignmentDB.tokens.filter(token => token.textType === 'target' && token.segmentIndex === 2).length).toEqual(3)

    StorageController.clear()
  })

})

