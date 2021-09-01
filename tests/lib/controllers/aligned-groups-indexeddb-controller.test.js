/* eslint-env jest */
/* eslint-disable no-unused-vars */

import AlignedGroupsController from '@/lib/controllers/aligned-groups-controller.js'
import HistoryController from '@/lib/controllers/history-controller.js'
import Alignment from '@/lib/data/alignment'
import AlignmentGroup from '@/lib/data/alignment-group'
import SourceText from '@/lib/data/source-text'
import Segment from '@/lib/data/segment'
import Token from '@/lib/data/token'
import AppController from '@/lib/controllers/app-controller.js'

import IndexedDB from 'fake-indexeddb'
import IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange'
import LatEng from '@tests/lib/storage/alignments/lat-eng-short.json'

import IndexedDBAdapter from '@/lib/storage/indexed-db-adapter.js'
import IndexedDBStructure from '@/lib/storage/indexed-db-structure.js'
import StorageController from '@/lib/controllers/storage-controller.js'

describe('aligned-groups-indexeddb-controller.test.js', () => {
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
  
  beforeEach(async () => {
    jest.clearAllMocks()

    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')

    StorageController.definedDBAdapter()
    // await StorageController.clear()
  })

  const queryFromIndexedDB = async (dbAdapter, alignment) => {
    const queryTokens = {
      objectStoreName: IndexedDBStructure.allObjectStoreData.alGroups.name,
      condition: {
        indexName: 'alignmentID',
        value: alignment.id,
        type: 'only'
      },
      resultType: 'multiple'
    }
    const queryResultTokens = await dbAdapter._getFromStore(queryTokens)
    return queryResultTokens
  }

  it('1 AlignedGroupsController-IndexedDB - create an aligned group', async () => {
    const alignment1 = Alignment.convertFromJSON(LatEng)
    const dbAdapter = new IndexedDBAdapter()
    const formattedAlignment = alignment1.convertToIndexedDB({ textAsBlob: false })
    await dbAdapter.update(formattedAlignment)

    const alGC = new AlignedGroupsController(appC.store)
    alGC.alignment = alignment1

    const historyC = new HistoryController(appC.store)
    historyC.startTracking(alignment1)

    const tokenOrigin1 = alignment1.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = Object.values(alignment1.targets)[0].alignedText.segments[0].tokens[0]

    await alGC.clickToken(tokenOrigin1)
    await alGC.clickToken(tokenTarget1)
    
    expect(alignment1.alignmentGroups.length).toEqual(0)
    expect(alignment1.activeAlignmentGroup).toEqual(expect.any(AlignmentGroup))

    // console.info(alignment1)

    let alGroupsDB = await queryFromIndexedDB(dbAdapter, alignment1)
    expect(alGroupsDB.length).toEqual(0)

    // save group
    await alGC.clickToken(tokenOrigin1)
    expect(alignment1.alignmentGroups.length).toEqual(1)
    expect(alignment1.activeAlignmentGroup).toBeNull()

    alGroupsDB = await queryFromIndexedDB(dbAdapter, alignment1)
    // console.info(alGroupsDB)

    expect(alGroupsDB.length).toEqual(1)
    expect(alGroupsDB[0].origin.length).toEqual(1)
    expect(alGroupsDB[0].target.length).toEqual(1)

    // undo save group
    await historyC.undo()

    expect(alignment1.alignmentGroups.length).toEqual(0)
    expect(alignment1.activeAlignmentGroup).toEqual(expect.any(AlignmentGroup))

    alGroupsDB = await queryFromIndexedDB(dbAdapter, alignment1)
    expect(alGroupsDB.length).toEqual(0)

    // redo save group
    await historyC.redo()

    expect(alignment1.alignmentGroups.length).toEqual(1)
    expect(alignment1.activeAlignmentGroup).toBeNull()
    alGroupsDB = await queryFromIndexedDB(dbAdapter, alignment1)
    // console.info(alGroupsDB)

    expect(alGroupsDB.length).toEqual(1)
    expect(alGroupsDB[0].origin.length).toEqual(1)
    expect(alGroupsDB[0].target.length).toEqual(1)
  })

  it('2 AlignedGroupsController-IndexedDB - activate group', async () => {
    const alignment1 = Alignment.convertFromJSON(LatEng)
    const dbAdapter = new IndexedDBAdapter()

    await dbAdapter._deleteFromStore({
      objectStoreName: 'ALEditorAlGroups',
      condition: {
        indexName: 'alignmentID',
        value: alignment1.id,
        type: 'only'
      }
    })

    const formattedAlignment = alignment1.convertToIndexedDB({ textAsBlob: false })
    await dbAdapter.update(formattedAlignment)

    const alGC = new AlignedGroupsController(appC.store)
    alGC.alignment = alignment1

    const historyC = new HistoryController(appC.store)
    historyC.startTracking(alignment1)

    const tokenOrigin1 = alignment1.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = Object.values(alignment1.targets)[0].alignedText.segments[0].tokens[0]

    await alGC.clickToken(tokenOrigin1)
    await alGC.clickToken(tokenTarget1)
    await alGC.clickToken(tokenOrigin1)

    // group is created and saved to DB
    expect(alignment1.alignmentGroups.length).toEqual(1)
    expect(alignment1.activeAlignmentGroup).toBeNull()

    let alGroupsDB = await queryFromIndexedDB(dbAdapter, alignment1)
    // console.info(alGroupsDB)

    expect(alGroupsDB.length).toEqual(1)
    expect(alGroupsDB[0].origin.length).toEqual(1)
    expect(alGroupsDB[0].target.length).toEqual(1)

    // group is activated and should be cleared from IndexedDB
    await alGC.clickToken(tokenOrigin1)

    expect(alignment1.alignmentGroups.length).toEqual(0)
    expect(alignment1.activeAlignmentGroup).toEqual(expect.any(AlignmentGroup))

    alGroupsDB = await queryFromIndexedDB(dbAdapter, alignment1)
    expect(alGroupsDB.length).toEqual(0)

  }, 50000)


  it('3 AlignedGroupsController-IndexedDB - merge groups', async () => {
    const alignment1 = Alignment.convertFromJSON(LatEng)
    const dbAdapter = new IndexedDBAdapter()

    await dbAdapter._deleteFromStore({
      objectStoreName: 'ALEditorAlGroups',
      condition: {
        indexName: 'alignmentID',
        value: alignment1.id,
        type: 'only'
      }
    })

    const formattedAlignment = alignment1.convertToIndexedDB({ textAsBlob: false })
    await dbAdapter.update(formattedAlignment)

    const alGC = new AlignedGroupsController(appC.store)
    alGC.alignment = alignment1

    const historyC = new HistoryController(appC.store)
    historyC.startTracking(alignment1)

    // create the first group
    const tokenOrigin1 = alignment1.origin.alignedText.segments[0].tokens[0]
    const tokenTarget1 = Object.values(alignment1.targets)[0].alignedText.segments[0].tokens[0]

    await alGC.clickToken(tokenOrigin1)
    await alGC.clickToken(tokenTarget1)
    await alGC.clickToken(tokenOrigin1)

    // create the second group
    const tokenOrigin2 = alignment1.origin.alignedText.segments[0].tokens[1]
    const tokenTarget2 = Object.values(alignment1.targets)[0].alignedText.segments[0].tokens[1]
    
    await alGC.clickToken(tokenOrigin2)
    await alGC.clickToken(tokenTarget2)
    await alGC.clickToken(tokenOrigin2)

    expect(alignment1.alignmentGroups.length).toEqual(2)
    expect(alignment1.activeAlignmentGroup).toBeNull()

    let alGroupsDB = await queryFromIndexedDB(dbAdapter, alignment1)
    // console.info(alGroupsDB)

    expect(alGroupsDB.length).toEqual(2)
    expect(alGroupsDB[0].origin.length).toEqual(1)
    expect(alGroupsDB[0].target.length).toEqual(1)
    expect(alGroupsDB[1].origin.length).toEqual(1)
    expect(alGroupsDB[1].target.length).toEqual(1)

    // activate the first group
    await alGC.clickToken(tokenOrigin1)
    // merge with the second
    await alGC.clickToken(tokenOrigin2)

    expect(alignment1.alignmentGroups.length).toEqual(0)
    expect(alignment1.activeAlignmentGroup).toEqual(expect.any(AlignmentGroup))

    alGroupsDB = await queryFromIndexedDB(dbAdapter, alignment1)
    // console.info(alGroupsDB)

    expect(alGroupsDB.length).toEqual(0)

    // save merged group
    await alGC.clickToken(tokenOrigin1)

    expect(alignment1.alignmentGroups.length).toEqual(1)
    expect(alignment1.activeAlignmentGroup).toBeNull()

    alGroupsDB = await queryFromIndexedDB(dbAdapter, alignment1)

    expect(alGroupsDB.length).toEqual(1)
    expect(alGroupsDB[0].origin.length).toEqual(2)
    expect(alGroupsDB[0].target.length).toEqual(2)
  })
})

