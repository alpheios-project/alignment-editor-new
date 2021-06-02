/* eslint-env jest */
/* eslint-disable no-unused-vars */

import Alignment from '@/lib/data/alignment.js'
import IndexedDBStructure from '@/lib/storage/indexed-db-structure.js'
import IndexedDBAdapter from '@/lib/storage/indexed-db-adapter.js'
import GrcEngKat from '@tests/lib/storage/alignments/grc-eng-kat.json'
import ConvertUtility from '@/lib/utility/convert-utility.js'

import IndexedDB from 'fake-indexeddb'
import IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange'

describe('indexed-db-structure.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  let alignment1
  beforeAll(async () => {
    alignment1 = Alignment.convertFromJSON(GrcEngKat)

    window.indexedDB = IndexedDB
    window.IDBKeyRange = IDBKeyRange
  })
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 IndexedDBAdapter - constructor - all properties are created', async () => {
    const dbAdapter = new IndexedDBAdapter()

    expect(dbAdapter.errors).toEqual([])
    expect(dbAdapter.available).toBeTruthy()
  })

  it('2 IndexedDBAdapter - update - insert/update data to IndexedDB', async () => {
    const formattedAlignment = alignment1.convertToIndexedDB({ textAsBlob: false })
   
    const dbAdapter = new IndexedDBAdapter()
    await dbAdapter.update(formattedAlignment)

    const queryCommon = {
      objectStoreName: IndexedDBStructure.allObjectStoreData.common.name,
      condition: {
        indexName: 'alignmentID',
        value: alignment1.id,
        type: 'only'
      },
      resultType: 'single'
    }

    const queryResultCommon = await dbAdapter._getFromStore(queryCommon)
    
    expect(queryResultCommon.ID).toEqual(`${alignment1.userID}-${alignment1.id}`)
    expect(queryResultCommon.alignmentID).toEqual(alignment1.id)
    expect(queryResultCommon.userID).toEqual(alignment1.userID)
    expect(queryResultCommon.createdDT).toEqual(ConvertUtility.convertDateToString(alignment1.createdDT))
    expect(queryResultCommon.updatedDT).toEqual(ConvertUtility.convertDateToString(alignment1.updatedDT))
    expect(queryResultCommon.langsList).toEqual(alignment1.langsList)

    const queryDocSource = {
      objectStoreName: IndexedDBStructure.allObjectStoreData.docSource.name,
      condition: {
        indexName: 'alignmentID',
        value: alignment1.id,
        type: 'only'
      },
      resultType: 'multiple'
    }

    const queryResultDocSource = await dbAdapter._getFromStore(queryDocSource)
    expect(queryResultDocSource.length).toEqual(3)
    expect(queryResultDocSource[0].ID).toEqual(`${alignment1.userID}-${alignment1.id}-origin-${alignment1.origin.docSource.id}`)
    expect(queryResultDocSource[1].ID).toEqual(`${alignment1.userID}-${alignment1.id}-target-${alignment1.allTargetDocSources[0].id}`)
    expect(queryResultDocSource[2].ID).toEqual(`${alignment1.userID}-${alignment1.id}-target-${alignment1.allTargetDocSources[1].id}`)

    expect(queryResultDocSource[0].userID).toEqual(alignment1.userID)
    expect(queryResultDocSource[1].userID).toEqual(alignment1.userID)
    expect(queryResultDocSource[2].userID).toEqual(alignment1.userID)

    expect(queryResultDocSource[0].alignmentID).toEqual(alignment1.id)
    expect(queryResultDocSource[1].alignmentID).toEqual(alignment1.id)
    expect(queryResultDocSource[2].alignmentID).toEqual(alignment1.id)

    expect(queryResultDocSource[0].textType).toEqual('origin')
    expect(queryResultDocSource[1].textType).toEqual('target')
    expect(queryResultDocSource[2].textType).toEqual('target')

    expect(queryResultDocSource[0].textId).toEqual(alignment1.origin.docSource.id)
    expect(queryResultDocSource[1].textId).toEqual(alignment1.allTargetDocSources[0].id)
    expect(queryResultDocSource[2].textId).toEqual(alignment1.allTargetDocSources[1].id)

    expect(queryResultDocSource[0].lang).toEqual('grc')
    expect(queryResultDocSource[1].lang).toEqual('eng')
    expect(queryResultDocSource[2].lang).toEqual('kat')

    expect(queryResultDocSource[0].sourceType).toEqual('text')
    expect(queryResultDocSource[1].sourceType).toEqual('text')
    expect(queryResultDocSource[2].sourceType).toEqual('text')

    expect(queryResultDocSource[0].direction).toEqual('ltr')
    expect(queryResultDocSource[1].direction).toEqual('ltr')
    expect(queryResultDocSource[2].direction).toEqual('ltr')

    expect(queryResultDocSource[0].text).toEqual(expect.any(String))
    expect(queryResultDocSource[1].text).toEqual(expect.any(String))
    expect(queryResultDocSource[2].text).toEqual(expect.any(String))

    expect(queryResultDocSource[0].tokenization).toEqual({ tokenizer: 'alpheiosRemoteTokenizer', segments: 'doubleline' })
    expect(queryResultDocSource[1].tokenization).toEqual({ tokenizer: 'alpheiosRemoteTokenizer', segments: 'doubleline' })
    expect(queryResultDocSource[2].tokenization).toEqual({ tokenizer: 'alpheiosRemoteTokenizer', segments: 'doubleline' })

    const queryMetadata = {
      objectStoreName: IndexedDBStructure.allObjectStoreData.metadata.name,
      condition: {
        indexName: 'alignmentID',
        value: alignment1.id,
        type: 'only'
      },
      resultType: 'multiple'
    }

    const queryResultMetadata = await dbAdapter._getFromStore(queryMetadata)

    expect(queryResultMetadata.length).toEqual(14)
    expect(queryResultMetadata).toEqual(expect.arrayContaining([expect.objectContaining({ property: 'title', value: 'Test Origin title' })]))
    expect(queryResultMetadata).toEqual(expect.arrayContaining([expect.objectContaining({ property: 'date copyrighted', value: '2021' })]))
    expect(queryResultMetadata).toEqual(expect.arrayContaining([expect.objectContaining({ property: 'creator', value: [ 'Test Creator 2', 'Test Creator1' ] })]))
    expect(queryResultMetadata).toEqual(expect.arrayContaining([expect.objectContaining({ property: 'publisher', value: 'Test Publisher' })]))
    expect(queryResultMetadata).toEqual(expect.arrayContaining([expect.objectContaining({ property: 'title', value: 'Test Target1 title' })]))
    expect(queryResultMetadata).toEqual(expect.arrayContaining([expect.objectContaining({ property: 'title', value: 'Test Target2 title' })]))
    expect(queryResultMetadata).toEqual(expect.arrayContaining([expect.objectContaining({ property: 'source', value: '2021' })]))
    expect(queryResultMetadata).toEqual(expect.arrayContaining([expect.objectContaining({ property: 'contributor', value: [ 'Contributor ', 'Test ' ] })]))

    const queryAlignedText = {
      objectStoreName: IndexedDBStructure.allObjectStoreData.alignedText.name,
      condition: {
        indexName: 'alignmentID',
        value: alignment1.id,
        type: 'only'
      },
      resultType: 'multiple'
    }

    const queryResultAlignedText = await dbAdapter._getFromStore(queryAlignedText)
    expect(queryResultAlignedText.length).toEqual(3)

    expect(queryResultAlignedText[0].ID).toEqual(`${alignment1.userID}-${alignment1.id}-origin-${alignment1.origin.docSource.id}`)
    expect(queryResultAlignedText[1].ID).toEqual(`${alignment1.userID}-${alignment1.id}-target-${alignment1.allTargetDocSources[0].id}`)
    expect(queryResultAlignedText[2].ID).toEqual(`${alignment1.userID}-${alignment1.id}-target-${alignment1.allTargetDocSources[1].id}`)

    expect(queryResultAlignedText[0].userID).toEqual(alignment1.userID)
    expect(queryResultAlignedText[1].userID).toEqual(alignment1.userID)
    expect(queryResultAlignedText[2].userID).toEqual(alignment1.userID)

    expect(queryResultAlignedText[0].alignmentID).toEqual(alignment1.id)
    expect(queryResultAlignedText[1].alignmentID).toEqual(alignment1.id)
    expect(queryResultAlignedText[2].alignmentID).toEqual(alignment1.id)

    expect(queryResultAlignedText[0].textType).toEqual('origin')
    expect(queryResultAlignedText[1].textType).toEqual('target')
    expect(queryResultAlignedText[2].textType).toEqual('target')

    expect(queryResultAlignedText[0].textId).toEqual(alignment1.origin.docSource.id)
    expect(queryResultAlignedText[1].textId).toEqual(alignment1.allTargetDocSources[0].id)
    expect(queryResultAlignedText[2].textId).toEqual(alignment1.allTargetDocSources[1].id)

    expect(queryResultAlignedText[0].lang).toEqual('grc')
    expect(queryResultAlignedText[1].lang).toEqual('eng')
    expect(queryResultAlignedText[2].lang).toEqual('kat')

    expect(queryResultAlignedText[0].direction).toEqual('ltr')
    expect(queryResultAlignedText[1].direction).toEqual('ltr')
    expect(queryResultAlignedText[2].direction).toEqual('ltr')

    expect(queryResultAlignedText[0].tokenPrefix).toEqual("1")
    expect(queryResultAlignedText[1].tokenPrefix).toEqual("2")
    expect(queryResultAlignedText[2].tokenPrefix).toEqual("3")

    expect(queryResultAlignedText[0].tokenization).toEqual({ tokenizer: 'alpheiosRemoteTokenizer', segments: 'doubleline' })
    expect(queryResultAlignedText[1].tokenization).toEqual({ tokenizer: 'alpheiosRemoteTokenizer', segments: 'doubleline' })
    expect(queryResultAlignedText[2].tokenization).toEqual({ tokenizer: 'alpheiosRemoteTokenizer', segments: 'doubleline' })

    const querySegments = {
      objectStoreName: IndexedDBStructure.allObjectStoreData.segments.name,
      condition: {
        indexName: 'alignmentID',
        value: alignment1.id,
        type: 'only'
      },
      resultType: 'multiple'
    }

    const queryResultSegments = await dbAdapter._getFromStore(querySegments)
    expect(queryResultSegments.length).toEqual(12)

    expect(queryResultSegments[0].index).toEqual(1)
    expect(queryResultSegments[1].index).toEqual(2)
    expect(queryResultSegments[2].index).toEqual(3)
    expect(queryResultSegments[3].index).toEqual(4)

    expect(queryResultSegments[4].index).toEqual(1)
    expect(queryResultSegments[5].index).toEqual(2)
    expect(queryResultSegments[6].index).toEqual(3)
    expect(queryResultSegments[7].index).toEqual(4)

    expect(queryResultSegments[8].index).toEqual(1)
    expect(queryResultSegments[9].index).toEqual(2)
    expect(queryResultSegments[10].index).toEqual(3)
    expect(queryResultSegments[11].index).toEqual(4)


    expect(queryResultSegments[0].textType).toEqual('origin')
    expect(queryResultSegments[1].textType).toEqual('origin')
    expect(queryResultSegments[2].textType).toEqual('origin')
    expect(queryResultSegments[3].textType).toEqual('origin')

    expect(queryResultSegments[4].textType).toEqual('target')
    expect(queryResultSegments[5].textType).toEqual('target')
    expect(queryResultSegments[6].textType).toEqual('target')
    expect(queryResultSegments[7].textType).toEqual('target')

    expect(queryResultSegments[8].textType).toEqual('target')
    expect(queryResultSegments[9].textType).toEqual('target')
    expect(queryResultSegments[10].textType).toEqual('target')
    expect(queryResultSegments[11].textType).toEqual('target')

    const queryTokens = {
      objectStoreName: IndexedDBStructure.allObjectStoreData.tokens.name,
      condition: {
        indexName: 'alignmentID',
        value: alignment1.id,
        type: 'only'
      },
      resultType: 'multiple'
    }

    const queryResultTokens = await dbAdapter._getFromStore(queryTokens)
    expect(queryResultTokens.length).toEqual(949)

    expect(queryResultTokens[0].ID).toEqual(`${alignment1.userID}-${alignment1.id}-${alignment1.origin.docSource.id}-${alignment1.origin.alignedText.segments[0].index}-${alignment1.origin.alignedText.segments[0].tokens[0].idWord}`)
    expect(queryResultTokens[0].alTextIdSegIndex).toEqual(`${alignment1.id}-${alignment1.origin.docSource.id}-${alignment1.origin.alignedText.segments[0].index}`)
    expect(queryResultTokens[0].textType).toEqual('origin')
    expect(queryResultTokens[0].idWord).toEqual('1-0-0')
    expect(queryResultTokens[0].word).toEqual('[')
    expect(queryResultTokens[0].segmentIndex).toEqual(1)
    expect(queryResultTokens[0].docSourceId).toEqual(alignment1.origin.docSource.id)
    expect(queryResultTokens[0].sentenceIndex).toEqual(1)
    expect(queryResultTokens[0].tokenIndex).toEqual(0)

    const queryAlGroups = {
      objectStoreName: IndexedDBStructure.allObjectStoreData.alGroups.name,
      condition: {
        indexName: 'alignmentID',
        value: alignment1.id,
        type: 'only'
      },
      resultType: 'multiple'
    }

    const queryResultAlGroups = await dbAdapter._getFromStore(queryAlGroups)
    expect(queryResultAlGroups.length).toEqual(10)

    expect(queryResultAlGroups).toEqual(expect.arrayContaining([expect.objectContaining({ 
      ID: `${alignment1.userID}-${alignment1.id}-${alignment1.alignmentGroups[0].id}`,
      alGroupId: alignment1.alignmentGroups[0].id,
      segmentIndex: 1,
      targetId: alignment1.allTargetDocSources[1].id,
      origin: [ '1-0-4' ],
      target: [ '3-0-3' ]
    })]))

    await dbAdapter.clear()

    const queryResultClear = await dbAdapter._getFromStore(queryCommon)
    expect(queryResultClear).not.toBeDefined()
  }, 50000)
})

