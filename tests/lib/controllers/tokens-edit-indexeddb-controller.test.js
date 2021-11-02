/* eslint-env jest */
/* eslint-disable no-unused-vars */

import TokensEditController from '@/lib/controllers/tokens-edit-controller.js'
import AlignedGroupsController from '@/lib/controllers/aligned-groups-controller.js'
import StorageController from '@/lib/controllers/storage-controller.js'

import Alignment from '@/lib/data/alignment'
import AlignmentGroup from '@/lib/data/alignment-group'
import SourceText from '@/lib/data/source-text'
import Segment from '@/lib/data/segment'
import Token from '@/lib/data/token'
import AppController from '@/lib/controllers/app-controller.js'

import Vuex from 'vuex'

import IndexedDB from 'fake-indexeddb'
import IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange'
import LatEng from '@tests/lib/storage/alignments/lat-eng-short.json'

import IndexedDBAdapter from '@/lib/storage/indexed-db-adapter.js'
import IndexedDBStructure from '@/lib/storage/indexed-db-structure.js'

describe('tokens-edit-controller.test.js', () => {

  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  let appC
  beforeAll(async () => {
    appC = new AppController({
      appId:'alpheios-alignment-editor'
    })
    appC.defineStore()
    appC.defineL10Support()
    appC.defineNotificationSupport(appC.store)
    await appC.defineSettingsController()

    window.indexedDB = IndexedDB
    window.IDBKeyRange = IDBKeyRange
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')

    StorageController.definedDBAdapter()
  })

  
  const queryFromIndexedDB = async (dbAdapter, alignment, segIndex) => {
    const indexValue = `${alignment.userID}-${alignment.id}-${alignment.origin.docSource.id}-${segIndex}-1`
    const queryTokens = {
      objectStoreName: IndexedDBStructure.allObjectStoreData.tokens.name,
      condition: {
        indexName: 'alTextIdSegIdPartNum',
        value: indexValue,
        type: 'only'
      },
      resultType: 'multiple'
    }
    const queryResultTokens = await dbAdapter._getFromStore(queryTokens)
    return queryResultTokens.sort((a,b) => a.tokenIndex - b.tokenIndex).map(token => { 
      let obj = { idWord: token.idWord, word: token.word }
      if (token.hasLineBreak !== undefined) {
        obj.hasLineBreak = token.hasLineBreak
      }
      return obj
    })
  }

  const compareTokens = (data) => {
    let res = true
    for (let i = 0; i < data.length; i++ ) {
      res = res && data[i].token.word === data[i].word && data[i].token.idWord === data[i].idWord

      if (data[i].hasLineBreak !== undefined) {
        res = res && data[i].hasLineBreak ? data[i].token.hasLineBreak === data[i].hasLineBreak : !data[i].token.hasLineBreak
      }
      if (!res) {
        break
      }
    }
    return res
  }

  it('1 TokensEditController-IndexedDB - updateTokenWord - update token\'s word and idWord', async () => {
    // preparations
    const alignment1 = Alignment.convertFromJSON(LatEng)
    const dbAdapter = new IndexedDBAdapter()
    const formattedAlignment = alignment1.convertToIndexedDB({ textAsBlob: false })
    await dbAdapter.update(formattedAlignment)

    const tokensEC = new TokensEditController(appC.store)
    tokensEC.loadAlignment(alignment1)

    // test case
    const tokenForUpdate = alignment1.origin.alignedText.segments[0].tokens[0]
    const tokenForUpdateNext = alignment1.origin.alignedText.segments[0].tokens[1]

    expect(compareTokens([
      { token: tokenForUpdate, word: 'Cum', idWord: '1-0-0'},
      { token: tokenForUpdateNext, word: 'ad', idWord: '1-0-1'}
    ])).toBeTruthy()
    
    const tokensIndDB = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1', word: 'ad' },
      { idWord: '1-0-2', word: 'instruendam' }
    ])

    const result = await tokensEC.updateTokenWord(tokenForUpdate, 'non-cum')

    expect(result).toBeTruthy()
    expect(compareTokens([
        { token: tokenForUpdate, word: 'non-cum', idWord: '1-0-0-e-1'},
        { token: tokenForUpdateNext, word: 'ad', idWord: '1-0-1'}
      ])).toBeTruthy()

    const tokensIndDB2 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB2).toEqual([
      { idWord: '1-0-0-e-1', word: 'non-cum' },
      { idWord: '1-0-1', word: 'ad' },
      { idWord: '1-0-2', word: 'instruendam' }
    ])

    const result1 = await tokensEC.undoTokensEditStep()

    expect(result1).toBeTruthy()
    
    expect(compareTokens([
        { token: alignment1.origin.alignedText.segments[0].tokens[0], word: 'Cum', idWord: '1-0-0'},
        { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1'}
      ])).toBeTruthy()
    
    const tokensIndDB3 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB3).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1', word: 'ad' },
      { idWord: '1-0-2', word: 'instruendam' }
    ])

    const result2 = await tokensEC.redoTokensEditStep()
    expect(result2).toBeTruthy()
    
    expect(compareTokens([
        { token: alignment1.origin.alignedText.segments[0].tokens[0], word: 'non-cum', idWord: '1-0-0-e-1'},
        { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1'}
      ])).toBeTruthy()

    const tokensIndDB4 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB4).toEqual([
      { idWord: '1-0-0-e-1', word: 'non-cum' },
      { idWord: '1-0-1', word: 'ad' },
      { idWord: '1-0-2', word: 'instruendam' }
    ])

  })

  it('2 TokensEditController-IndexedDB - mergeToken', async () => {
    // preparations
    const alignment1 = Alignment.convertFromJSON(LatEng)
    const dbAdapter = new IndexedDBAdapter()
    const formattedAlignment = alignment1.convertToIndexedDB({ textAsBlob: false })
    await dbAdapter.update(formattedAlignment)

    const tokensEC = new TokensEditController(appC.store)
    tokensEC.loadAlignment(alignment1)

    // test case
    const tokenForUpdate1 = alignment1.origin.alignedText.segments[0].tokens[0]
    const tokenForUpdate2 = alignment1.origin.alignedText.segments[0].tokens[1]
    const tokenForUpdate3 = alignment1.origin.alignedText.segments[0].tokens[2]

    expect(compareTokens([
      { token: tokenForUpdate1, word: 'Cum', idWord: '1-0-0'},
      { token: tokenForUpdate2, word: 'ad', idWord: '1-0-1'},
      { token: tokenForUpdate3, word: 'instruendam', idWord: '1-0-2'}
    ])).toBeTruthy()

    // merge to right
    const result = await tokensEC.mergeToken(tokenForUpdate2, 'next')
    expect(result).toBeTruthy()
    expect(alignment1.origin.alignedText.segments[0].tokens.length).toEqual(2)

    expect(compareTokens([
      { token: tokenForUpdate1, word: 'Cum', idWord: '1-0-0'},
      { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad instruendam', idWord: '1-0-2-m-1'}
    ])).toBeTruthy()

    const tokensIndDB2 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB2).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-2-m-1', word: 'ad instruendam' }
    ])

    // merge to left
    const result1 = await tokensEC.mergeToken(alignment1.origin.alignedText.segments[0].tokens[1], 'prev')
    expect(result1).toBeTruthy()
    expect(alignment1.origin.alignedText.segments[0].tokens.length).toEqual(1)

    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[0], word: 'Cum ad instruendam', idWord: '1-0-0-m-1'}
    ])).toBeTruthy()

    const tokensIndDB3 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB3).toEqual([
      { idWord: '1-0-0-m-1', word: 'Cum ad instruendam' }
    ])    

    // undo last merge
    const result2 = await tokensEC.undoTokensEditStep()
    expect(result2).toBeTruthy()
    
    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[0], word: 'Cum', idWord: '1-0-0'},
      { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad instruendam', idWord: '1-0-2-m-1'}
    ])).toBeTruthy()

    const tokensIndDB4 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB4).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-2-m-1', word: 'ad instruendam' }
    ])

    // redo last merge
    const result3 = await tokensEC.redoTokensEditStep()
    expect(result3).toBeTruthy()
    
    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[0], word: 'Cum ad instruendam', idWord: '1-0-0-m-1'}
    ])).toBeTruthy()

    const tokensIndDB5 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB5).toEqual([
      { idWord: '1-0-0-m-1', word: 'Cum ad instruendam' }
    ])
  })

  it('3 TokensEditController-IndexedDB - splitToken', async () => {
    // preparations
    const alignment1 = Alignment.convertFromJSON(LatEng)
    const dbAdapter = new IndexedDBAdapter()
    const formattedAlignment = alignment1.convertToIndexedDB({ textAsBlob: false })
    await dbAdapter.update(formattedAlignment)

    const tokensEC = new TokensEditController(appC.store)
    tokensEC.loadAlignment(alignment1)

    // test case
    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[2], word: 'instruendam', idWord: '1-0-2' }
    ])).toBeTruthy()

    const result = await tokensEC.splitToken(alignment1.origin.alignedText.segments[0].tokens[2], 'instru endam')
    expect(result).toBeTruthy()
    expect(alignment1.origin.alignedText.segments[0].tokens.length).toEqual(4)

    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[0], word: 'Cum', idWord: '1-0-0' },
      { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1' },
      { token: alignment1.origin.alignedText.segments[0].tokens[2], word: 'instru', idWord: '1-0-2-s1-1' },
      { token: alignment1.origin.alignedText.segments[0].tokens[3], word: 'endam', idWord: '1-0-2-s2-1' } 
    ])).toBeTruthy()

    const tokensIndDB2 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB2).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1', word: 'ad' },
      { idWord: '1-0-2-s1-1', word: 'instru' },
      { idWord: '1-0-2-s2-1', word: 'endam' }
    ])

    // undo last split
    const result1 = await tokensEC.undoTokensEditStep()
    expect(result1).toBeTruthy()
    
    expect(compareTokens([
        { token: alignment1.origin.alignedText.segments[0].tokens[0], word: 'Cum', idWord: '1-0-0' },
        { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1' },
        { token: alignment1.origin.alignedText.segments[0].tokens[2], word: 'instruendam', idWord: '1-0-2' }
    ])).toBeTruthy()

    const tokensIndDB3 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB3).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1', word: 'ad' },
      { idWord: '1-0-2', word: 'instruendam' }
    ])

    // redo last split
    const result2 = await tokensEC.redoTokensEditStep()
    expect(result2).toBeTruthy()
    
    expect(compareTokens([
        { token: alignment1.origin.alignedText.segments[0].tokens[0], word: 'Cum', idWord: '1-0-0' },
        { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1' },
        { token: alignment1.origin.alignedText.segments[0].tokens[2], word: 'instru', idWord: '1-0-2-s1-1' },
        { token: alignment1.origin.alignedText.segments[0].tokens[3], word: 'endam', idWord: '1-0-2-s2-1' } 
    ])).toBeTruthy()

    const tokensIndDB4 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB4).toEqual([
        { idWord: '1-0-0', word: 'Cum' },
        { idWord: '1-0-1', word: 'ad' },
        { idWord: '1-0-2-s1-1', word: 'instru' },
        { idWord: '1-0-2-s2-1', word: 'endam' }
    ])
  })

  it('4 TokensEditController-IndexedDB - addLineBreakAfterToken/removeLineBreakAfterToken', async () => {
    // preparations
    const alignment1 = Alignment.convertFromJSON(LatEng)
    const dbAdapter = new IndexedDBAdapter()
    const formattedAlignment = alignment1.convertToIndexedDB({ textAsBlob: false })
    await dbAdapter.update(formattedAlignment)

    const tokensEC = new TokensEditController(appC.store)
    tokensEC.loadAlignment(alignment1)

    // test case
    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1', hasLineBreak: false }
    ])).toBeTruthy()

    // add line break
    const result = await tokensEC.addLineBreakAfterToken(alignment1.origin.alignedText.segments[0].tokens[1])
    expect(result).toBeTruthy()

    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1-al-1', hasLineBreak: true }
    ])).toBeTruthy()

    const tokensIndDB1 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB1).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1-al-1', word: 'ad', hasLineBreak: true },
      { idWord: '1-0-2', word: 'instruendam' }
    ])

    // undo add line break
    const result1 = await tokensEC.undoTokensEditStep()
    expect(result1).toBeTruthy()
    
    expect(compareTokens([
        { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1', hasLineBreak: false }
    ])).toBeTruthy()

    const tokensIndDB3 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB3).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1', word: 'ad', hasLineBreak: false },
      { idWord: '1-0-2', word: 'instruendam' }
    ])

    // redo add line break
    const result2 = await tokensEC.redoTokensEditStep()
    expect(result2).toBeTruthy()

    expect(compareTokens([
        { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1-al-1', hasLineBreak: true }
    ])).toBeTruthy()

    const tokensIndDB4 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB4).toEqual([
        { idWord: '1-0-0', word: 'Cum' },
        { idWord: '1-0-1-al-1', word: 'ad', hasLineBreak: true },
        { idWord: '1-0-2', word: 'instruendam' }
    ])

    // remove line break
    const result3 = await tokensEC.removeLineBreakAfterToken(alignment1.origin.alignedText.segments[0].tokens[1])
    expect(result3).toBeTruthy()
    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1-al-1-rl-1', hasLineBreak: false }
    ])).toBeTruthy()

    const tokensIndDB2 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB2).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1-al-1-rl-1', word: 'ad', hasLineBreak: false },
      { idWord: '1-0-2', word: 'instruendam' }
    ])

    // undo remove line break
    const result4 = await tokensEC.undoTokensEditStep()
    expect(result4).toBeTruthy()

    expect(compareTokens([
        { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1-al-1', hasLineBreak: true }
    ])).toBeTruthy()

    const tokensIndDB5 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB5).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1-al-1', word: 'ad', hasLineBreak: true },
      { idWord: '1-0-2', word: 'instruendam' }
    ])

    // redo remove line break
    const result5 = await tokensEC.redoTokensEditStep()
    expect(result5).toBeTruthy()

    expect(compareTokens([
        { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1-al-1-rl-1', hasLineBreak: false }
    ])).toBeTruthy()

    const tokensIndDB6 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB6).toEqual([
        { idWord: '1-0-0', word: 'Cum' },
        { idWord: '1-0-1-al-1-rl-1', word: 'ad', hasLineBreak: false },
        { idWord: '1-0-2', word: 'instruendam' }
    ])
  })

  it('5 TokensEditController-IndexedDB - moveToSegment', async () => {
    // preparations
    const alignment1 = Alignment.convertFromJSON(LatEng)
    const dbAdapter = new IndexedDBAdapter()
    const formattedAlignment = alignment1.convertToIndexedDB({ textAsBlob: false })
    await dbAdapter.update(formattedAlignment)

    const tokensEC = new TokensEditController(appC.store)
    tokensEC.loadAlignment(alignment1)

    // test case
    expect( alignment1.origin.alignedText.segments[0].tokens.length).toEqual(3)
    expect( alignment1.origin.alignedText.segments[1].tokens.length).toEqual(4)

    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[2], word: 'instruendam', idWord: '1-0-2' },
      { token: alignment1.origin.alignedText.segments[1].tokens[0], word: 'Illud', idWord: '1-1-0' }
    ])).toBeTruthy()

    // move from 1 to 2 segment
    const result = await tokensEC.moveToSegment(alignment1.origin.alignedText.segments[0].tokens[2], 'next')
    expect(result).toBeTruthy()

    expect( alignment1.origin.alignedText.segments[0].tokens.length).toEqual(2)
    expect( alignment1.origin.alignedText.segments[1].tokens.length).toEqual(5)

    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1' },
      { token: alignment1.origin.alignedText.segments[1].tokens[0], word: 'instruendam', idWord: '1-0-2-ns-1' },
      { token: alignment1.origin.alignedText.segments[1].tokens[1], word: 'Illud', idWord: '1-1-0' }
    ])).toBeTruthy()

    const tokensIndDB1 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB1).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1', word: 'ad' }
    ])

    const tokensIndDB2 = await queryFromIndexedDB(dbAdapter, alignment1, 2)

    expect(tokensIndDB2).toEqual([
      { idWord: '1-0-2-ns-1', word: 'instruendam' },
      { idWord: '1-1-0', word: 'Illud' },
      { idWord: '1-1-1', word: 'ne' },
      { idWord: '1-1-2', word: 'que' },
      { idWord: '1-1-3', word: 'ignoro' }
    ])

    // undo move to segment
    const result2 = await tokensEC.undoTokensEditStep()
    expect(result2).toBeTruthy()

    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[2], word: 'instruendam', idWord: '1-0-2' },
      { token: alignment1.origin.alignedText.segments[1].tokens[0], word: 'Illud', idWord: '1-1-0' }
    ])).toBeTruthy()

    const tokensIndDB5 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB5).toEqual([
        { idWord: '1-0-0', word: 'Cum' },
        { idWord: '1-0-1', word: 'ad' },
        { idWord: '1-0-2', word: 'instruendam' }
    ])

    const tokensIndDB6 = await queryFromIndexedDB(dbAdapter, alignment1, 2)

    expect(tokensIndDB6).toEqual([
      { idWord: '1-1-0', word: 'Illud' },
      { idWord: '1-1-1', word: 'ne' },
      { idWord: '1-1-2', word: 'que' },
      { idWord: '1-1-3', word: 'ignoro' }
    ])

    // redo move to segment
    const result3 = await tokensEC.redoTokensEditStep()
    expect(result3).toBeTruthy()
    
    expect(compareTokens([
        { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1' },
        { token: alignment1.origin.alignedText.segments[1].tokens[0], word: 'instruendam', idWord: '1-0-2-ns-1' },
        { token: alignment1.origin.alignedText.segments[1].tokens[1], word: 'Illud', idWord: '1-1-0' }
    ])).toBeTruthy()

    const tokensIndDB7 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB7).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1', word: 'ad' }
    ])

    const tokensIndDB8 = await queryFromIndexedDB(dbAdapter, alignment1, 2)

    expect(tokensIndDB8).toEqual([
      { idWord: '1-0-2-ns-1', word: 'instruendam' },
      { idWord: '1-1-0', word: 'Illud' },
      { idWord: '1-1-1', word: 'ne' },
      { idWord: '1-1-2', word: 'que' },
      { idWord: '1-1-3', word: 'ignoro' }
    ])

    // move from 2 to 1 segment
    const result1 = await tokensEC.moveToSegment(alignment1.origin.alignedText.segments[1].tokens[0], 'prev')
    expect(result1).toBeTruthy()

    expect( alignment1.origin.alignedText.segments[0].tokens.length).toEqual(3)
    expect( alignment1.origin.alignedText.segments[1].tokens.length).toEqual(4)

    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1' },
      { token: alignment1.origin.alignedText.segments[0].tokens[2], word: 'instruendam', idWord: '1-0-2-ns-1-ps-1' },
      { token: alignment1.origin.alignedText.segments[1].tokens[0], word: 'Illud', idWord: '1-1-0' }
    ])).toBeTruthy()

    const tokensIndDB3 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB3).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1', word: 'ad' },
      { idWord: '1-0-2-ns-1-ps-1', word: 'instruendam' }
    ])

    const tokensIndDB4 = await queryFromIndexedDB(dbAdapter, alignment1, 2)

    expect(tokensIndDB4).toEqual([
      { idWord: '1-1-0', word: 'Illud' },
      { idWord: '1-1-1', word: 'ne' },
      { idWord: '1-1-2', word: 'que' },
      { idWord: '1-1-3', word: 'ignoro' }
    ])

    // undo move to segment
    const result4 = await tokensEC.undoTokensEditStep()
    expect(result4).toBeTruthy()
    
    expect(compareTokens([
        { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1' },
        { token: alignment1.origin.alignedText.segments[1].tokens[0], word: 'instruendam', idWord: '1-0-2-ns-1' },
        { token: alignment1.origin.alignedText.segments[1].tokens[1], word: 'Illud', idWord: '1-1-0' }
    ])).toBeTruthy()
    const tokensIndDB9 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB9).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1', word: 'ad' }
    ])

    const tokensIndDB10 = await queryFromIndexedDB(dbAdapter, alignment1, 2)

    expect(tokensIndDB10).toEqual([
      { idWord: '1-0-2-ns-1', word: 'instruendam' },
      { idWord: '1-1-0', word: 'Illud' },
      { idWord: '1-1-1', word: 'ne' },
      { idWord: '1-1-2', word: 'que' },
      { idWord: '1-1-3', word: 'ignoro' }
    ])

    // redo move to segment
    const result5 = await tokensEC.redoTokensEditStep()
    expect(result5).toBeTruthy()
    
    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1' },
      { token: alignment1.origin.alignedText.segments[0].tokens[2], word: 'instruendam', idWord: '1-0-2-ns-1-ps-1' },
      { token: alignment1.origin.alignedText.segments[1].tokens[0], word: 'Illud', idWord: '1-1-0' }
    ])).toBeTruthy()

    const tokensIndDB11 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB11).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1', word: 'ad' },
      { idWord: '1-0-2-ns-1-ps-1', word: 'instruendam' }
    ])

    const tokensIndDB12 = await queryFromIndexedDB(dbAdapter, alignment1, 2)

    expect(tokensIndDB12).toEqual([
      { idWord: '1-1-0', word: 'Illud' },
      { idWord: '1-1-1', word: 'ne' },
      { idWord: '1-1-2', word: 'que' },
      { idWord: '1-1-3', word: 'ignoro' }
    ])
  })

  it('6 TokensEditController-IndexedDB - insertTokens', async () => {
    // preparations
    const alignment1 = Alignment.convertFromJSON(LatEng)
    const dbAdapter = new IndexedDBAdapter()
    const formattedAlignment = alignment1.convertToIndexedDB({ textAsBlob: false })
    await dbAdapter.update(formattedAlignment)

    const tokensEC = new TokensEditController(appC.store)
    tokensEC.loadAlignment(alignment1)

    // test case
    expect( alignment1.origin.alignedText.segments[0].tokens.length).toEqual(3)

    // insert tokens to the start
    const result = await tokensEC.insertTokens('test text', alignment1.origin.alignedText.segments[0].tokens[0], 'prev')
    expect(result).toBeTruthy()

    expect( alignment1.origin.alignedText.segments[0].tokens.length).toEqual(5)

    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[0], word: 'test', idWord: '1-0-0-nb-2' },
      { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'text', idWord: '1-0-0-nb-1' },
      { token: alignment1.origin.alignedText.segments[0].tokens[2], word: 'Cum', idWord: '1-0-0' },
      { token: alignment1.origin.alignedText.segments[0].tokens[3], word: 'ad', idWord: '1-0-1' },
      { token: alignment1.origin.alignedText.segments[0].tokens[4], word: 'instruendam', idWord: '1-0-2' }
    ])).toBeTruthy()

    const tokensIndDB1 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB1).toEqual([
      { idWord: '1-0-0-nb-2', word: 'test' },
      { idWord: '1-0-0-nb-1', word: 'text' },
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1', word: 'ad' },
      { idWord: '1-0-2', word: 'instruendam' }
    ])

/*
    // undo insert tokens to the start
    const result2 = await tokensEC.undoTokensEditStep()
    expect(result2).toBeTruthy()

    expect( alignment1.origin.alignedText.segments[0].tokens.length).toEqual(3)
    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[0], word: 'Cum', idWord: '1-0-0' },
      { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1' },
      { token: alignment1.origin.alignedText.segments[0].tokens[2], word: 'instruendam', idWord: '1-0-2' }
    ])).toBeTruthy()

    const tokensIndDB2 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB2).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1', word: 'ad' },
      { idWord: '1-0-2', word: 'instruendam' }
    ])

    // redo insert tokens to the start
    const result3 = await tokensEC.redoTokensEditStep()
    expect(result3).toBeTruthy()

    expect( alignment1.origin.alignedText.segments[0].tokens.length).toEqual(5)

    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[0], word: 'test', idWord: '1-0-0-n-2' },
      { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'text', idWord: '1-0-0-n-1' },
      { token: alignment1.origin.alignedText.segments[0].tokens[2], word: 'Cum', idWord: '1-0-0' },
      { token: alignment1.origin.alignedText.segments[0].tokens[3], word: 'ad', idWord: '1-0-1' },
      { token: alignment1.origin.alignedText.segments[0].tokens[4], word: 'instruendam', idWord: '1-0-2' }
    ])).toBeTruthy()

    const tokensIndDB3 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB3).toEqual([
      { idWord: '1-0-0-n-2', word: 'test' },
      { idWord: '1-0-0-n-1', word: 'text' },
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1', word: 'ad' },
      { idWord: '1-0-2', word: 'instruendam' }
    ])
*/
    // insert tokens to the end
    const result1 = await tokensEC.insertTokens('add to end', alignment1.origin.alignedText.segments[1].tokens[3], 'next')
    expect(result1).toBeTruthy()

    expect( alignment1.origin.alignedText.segments[1].tokens.length).toEqual(7)

    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[1].tokens[0], word: 'Illud', idWord: '1-1-0' },
      { token: alignment1.origin.alignedText.segments[1].tokens[1], word: 'ne', idWord: '1-1-1' },
      { token: alignment1.origin.alignedText.segments[1].tokens[2], word: 'que', idWord: '1-1-2' },
      { token: alignment1.origin.alignedText.segments[1].tokens[3], word: 'ignoro', idWord: '1-1-3' },
      { token: alignment1.origin.alignedText.segments[1].tokens[4], word: 'add', idWord: '1-1-3-na-1' },
      { token: alignment1.origin.alignedText.segments[1].tokens[5], word: 'to', idWord: '1-1-3-na-2' },
      { token: alignment1.origin.alignedText.segments[1].tokens[6], word: 'end', idWord: '1-1-3-na-3' }
    ])).toBeTruthy()

    const tokensIndDB4 = await queryFromIndexedDB(dbAdapter, alignment1, 2)

    expect(tokensIndDB4).toEqual([
      { idWord: '1-1-0', word: 'Illud' },
      { idWord: '1-1-1', word: 'ne' },
      { idWord: '1-1-2', word: 'que' },
      { idWord: '1-1-3', word: 'ignoro' },
      { idWord: '1-1-3-na-1', word: 'add' },
      { idWord: '1-1-3-na-2', word: 'to' },
      { idWord: '1-1-3-na-3', word: 'end' }
    ])
/*
    // undo insert tokens to the end
    const result4 = await tokensEC.undoTokensEditStep()
    expect(result4).toBeTruthy()

    expect( alignment1.origin.alignedText.segments[1].tokens.length).toEqual(4)

    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[1].tokens[0], word: 'Illud', idWord: '1-1-0' },
      { token: alignment1.origin.alignedText.segments[1].tokens[1], word: 'ne', idWord: '1-1-1' },
      { token: alignment1.origin.alignedText.segments[1].tokens[2], word: 'que', idWord: '1-1-2' },
      { token: alignment1.origin.alignedText.segments[1].tokens[3], word: 'ignoro', idWord: '1-1-3' },
    ])).toBeTruthy()

    const tokensIndDB5 = await queryFromIndexedDB(dbAdapter, alignment1, 2)

    expect(tokensIndDB5).toEqual([
      { idWord: '1-1-0', word: 'Illud' },
      { idWord: '1-1-1', word: 'ne' },
      { idWord: '1-1-2', word: 'que' },
      { idWord: '1-1-3', word: 'ignoro' }
    ])

    // redo insert tokens to the end
    const result5 = await tokensEC.redoTokensEditStep()
    expect(result5).toBeTruthy()

    expect( alignment1.origin.alignedText.segments[1].tokens.length).toEqual(7)

    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[1].tokens[0], word: 'Illud', idWord: '1-1-0' },
      { token: alignment1.origin.alignedText.segments[1].tokens[1], word: 'ne', idWord: '1-1-1' },
      { token: alignment1.origin.alignedText.segments[1].tokens[2], word: 'que', idWord: '1-1-2' },
      { token: alignment1.origin.alignedText.segments[1].tokens[3], word: 'ignoro', idWord: '1-1-3' },
      { token: alignment1.origin.alignedText.segments[1].tokens[4], word: 'add', idWord: '1-1-3-n-1' },
      { token: alignment1.origin.alignedText.segments[1].tokens[5], word: 'to', idWord: '1-1-3-n-2' },
      { token: alignment1.origin.alignedText.segments[1].tokens[6], word: 'end', idWord: '1-1-3-n-3' }
    ])).toBeTruthy()

    const tokensIndDB6 = await queryFromIndexedDB(dbAdapter, alignment1, 2)

    expect(tokensIndDB6).toEqual([
      { idWord: '1-1-0', word: 'Illud' },
      { idWord: '1-1-1', word: 'ne' },
      { idWord: '1-1-2', word: 'que' },
      { idWord: '1-1-3', word: 'ignoro' },
      { idWord: '1-1-3-n-1', word: 'add' },
      { idWord: '1-1-3-n-2', word: 'to' },
      { idWord: '1-1-3-n-3', word: 'end' }
    ])
    */
  })

  it('7 TokensEditController-IndexedDB - deleteToken', async () => {
    // preparations
    const alignment1 = Alignment.convertFromJSON(LatEng)
    const dbAdapter = new IndexedDBAdapter()
    const formattedAlignment = alignment1.convertToIndexedDB({ textAsBlob: false })
    await dbAdapter.update(formattedAlignment)

    const tokensEC = new TokensEditController(appC.store)
    tokensEC.loadAlignment(alignment1)

    // test case
    expect( alignment1.origin.alignedText.segments[0].tokens.length).toEqual(3)

     // delete the first token
    const result = await tokensEC.deleteToken(alignment1.origin.alignedText.segments[0].tokens[0])
    expect(result).toBeTruthy()

    expect( alignment1.origin.alignedText.segments[0].tokens.length).toEqual(2)
    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[0], word: 'ad', idWord: '1-0-1' },
      { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'instruendam', idWord: '1-0-2' }
    ])).toBeTruthy()

    const tokensIndDB1 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB1).toEqual([
      { idWord: '1-0-1', word: 'ad' },
      { idWord: '1-0-2', word: 'instruendam' }
    ])

    // undo delete the first token
    const result1 = await tokensEC.undoTokensEditStep()
    expect(result1).toBeTruthy()

    expect( alignment1.origin.alignedText.segments[0].tokens.length).toEqual(3)

    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[0], word: 'Cum', idWord: '1-0-0' },
      { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'ad', idWord: '1-0-1' },
      { token: alignment1.origin.alignedText.segments[0].tokens[2], word: 'instruendam', idWord: '1-0-2' }
    ])).toBeTruthy()

    const tokensIndDB2 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB2).toEqual([
      { idWord: '1-0-0', word: 'Cum' },
      { idWord: '1-0-1', word: 'ad' },
      { idWord: '1-0-2', word: 'instruendam' }
    ])

    // redo delete the first token
    const result2 = await tokensEC.redoTokensEditStep()
    expect(result2).toBeTruthy()

    expect( alignment1.origin.alignedText.segments[0].tokens.length).toEqual(2)

    expect(compareTokens([
      { token: alignment1.origin.alignedText.segments[0].tokens[0], word: 'ad', idWord: '1-0-1' },
      { token: alignment1.origin.alignedText.segments[0].tokens[1], word: 'instruendam', idWord: '1-0-2' }
    ])).toBeTruthy()

    const tokensIndDB3 = await queryFromIndexedDB(dbAdapter, alignment1, 1)

    expect(tokensIndDB3).toEqual([
      { idWord: '1-0-1', word: 'ad' },
      { idWord: '1-0-2', word: 'instruendam' }
    ])
  })

})
