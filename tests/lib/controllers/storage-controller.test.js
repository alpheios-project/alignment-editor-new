/* eslint-env jest */
/* eslint-disable no-unused-vars */

import StorageController from '@/lib/controllers/storage-controller.js'
import Alignment from '@/lib/data/alignment.js'
import SourceText from '@/lib/data/source-text.js'
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
      text: 'origin test text', sourceType: 'text', lang: 'grc', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    alignment.updateOriginDocSource(originDocSource)

    let result = await StorageController.update(alignment, false, false)
    expect(result).toBeTruthy()

    let alList = await StorageController.select({ userID }) // returns list of alignments

    expect(alList.length).toEqual(1)
    expect(alList[0].langsList).toEqual('grc')

    const targetDocSource = new SourceText('target', {
      text: 'target test text', sourceType: 'text', lang: 'aha', tokenization: { tokenizer: "simpleLocalTokenizer" }
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
  })

  it('2 StorageController - use case - update existed docSource in IndexedDB', async () => {
    const alignment = new Alignment()
    const originDocSource = new SourceText('origin', {
      text: 'origin test text', sourceType: 'text', lang: 'grc', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('target', {
      text: 'target test text', sourceType: 'text', lang: 'aha', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource)

    let result = await StorageController.update(alignment, false, false)

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

  })
})
