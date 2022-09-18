/* eslint-env jest */
/* eslint-disable no-unused-vars */
import Alignment from '@/lib/data/alignment'
import AppController from '@/lib/controllers/app-controller.js'
import StorageController from '@/lib/controllers/storage-controller.js'

import AlignmentSource1 from '@tests/corrupted/json/25-04_10-29-Test-Next.json'
import AlignmentSource2 from '@tests/corrupted/json/25-04_10-29-Test-Next-corrupted.json'

import IndexedDB from 'fake-indexeddb'
import IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange'

describe('corrupted-alignment.test.js', () => {
  // console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  let userID
  beforeAll(async () => {
    const appC = new AppController({
      appId:'alpheios-alignment-editor'
    })
    appC.defineStore()
    appC.defineL10Support()
    appC.defineNotificationSupport(appC.store)
    await appC.defineSettingsController()

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

  const checkDoc = (doc) => {
    let testALignedSeg = doc.alignedText.segments[0]
    let testTokensN = testALignedSeg.tokens.length
    let testLastToken = testALignedSeg.tokens[testTokensN-1]
    let test2LastToken = testALignedSeg.tokens[testTokensN-2]

    let testDocSourceText = doc.docSource.text
    
    const sourceEnd = testDocSourceText.slice(-(test2LastToken.word.length + testLastToken.word.length)).replace(' ', '')
    const tokensEnd = test2LastToken.word + testLastToken.word
    const result = {
      lang: doc.docSource.lang,
      allPartNums: testALignedSeg.allPartNums,
      sourceEnd,
      tokensEnd,
      check: (tokensEnd).includes(sourceEnd)
    }

    if (!result.check) {
      console.info(result)
    }
    
    return result
  }

  const checkAlignment = (alignment) => {
    const finalShortRes = []
    const finalFullRes = { origin: null, targets: {} }

    finalFullRes.origin = checkDoc(alignment.origin)
    finalShortRes.push(finalFullRes.origin.check)

    alignment.allTargetTextsIds.forEach(targetId => {
      finalFullRes.targets[targetId] = checkDoc(alignment.targets[targetId])
      finalShortRes.push(finalFullRes.targets[targetId].check)
    })

    // const finalCheck = finalShortRes.every(Boolean)

    expect(finalShortRes.every(Boolean)).toBeTruthy()   
  }

  const JSONCheck = (alignment) => {
    const jsonRes = alignment.convertToJSON()
    const alignmentRes = Alignment.convertFromJSON(jsonRes)
    checkAlignment(alignmentRes)
  }

  it.skip('1 Corrupted Alignment - next working - alignment - simple check', async () => {
    const sourceJSON1 = AlignmentSource1
    const alignment =  Alignment.convertFromJSON(sourceJSON1)

    expect(alignment).toBeInstanceOf(Alignment)

    checkAlignment(alignment)
  })

  it.skip('2 Corrupted Alignment - next is not working - alignment - simple check', async () => {
    const sourceJSON1 = AlignmentSource2
    const alignment =  Alignment.convertFromJSON(sourceJSON1)

    expect(alignment).toBeInstanceOf(Alignment)

    checkAlignment(alignment)
  })


  it.skip('3 Corrupted Alignment - next - JSON + IndexedDB + again JSON', async () => {
    StorageController.definedDBAdapter()

    const sourceJSON1 = AlignmentSource1

    // upload from JSON
    const alignment = Alignment.convertFromJSON(sourceJSON1)

    expect(alignment).toBeInstanceOf(Alignment)
    checkAlignment(alignment)

    // save to IndexedDB
    let result = await StorageController.update(alignment, false, false)
    expect(result).toBeTruthy()

    let alList = await StorageController.select({ userID }) 
    expect(alList.length).toEqual(1)

    JSONCheck(alignment)

    // hide all parts besides 1st
    console.info('hasAllPartsUploaded - before', alignment.hasAllPartsUploaded)  

    alignment.allTargetTextsIds.forEach(targetId => {
      const checkSeg = alignment.targets[targetId].alignedText.segments[0]
      checkSeg.limitTokensToPartNum([1, 1])

      console.info('segment', checkSeg.lang, checkSeg.lastTokenIdWord, checkSeg.tokens[checkSeg.tokens.length-1].idWord)
    })

    console.info('hasAllPartsUploaded - after', alignment.hasAllPartsUploaded)  

    /*
    const dbData = await StorageController.select({ userID: alignment.userID, alignmentID: alignment.id }, 'alignmentByAlIDQueryAllTokens')
    const alignmentFromDB = await Alignment.convertFromIndexedDB(dbData)

    JSONCheck(alignmentFromDB)
    */
  })
})
