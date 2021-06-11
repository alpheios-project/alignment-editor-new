/* eslint-env jest */
/* eslint-disable no-unused-vars */
import Alignment from '@/lib/data/alignment.js'
import IndexedDBStructure from '@/lib/storage/indexed-db-structure.js'
import GrcEngKat from '@tests/lib/storage/alignments/grc-eng-kat.json'
import ConvertUtility from '@/lib/utility/convert-utility.js'

import AppController from '@/lib/controllers/app-controller.js'

describe('indexed-db-structure.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  let alignment1
  beforeAll(async () => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })
    appC.defineStore()
    appC.defineL10Support()
    appC.defineNotificationSupport(appC.store)
    await appC.defineSettingsController()
    
    alignment1 = Alignment.convertFromJSON(GrcEngKat)
  })
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 IndexedDBStructure - serializeCommon - prepares data for ALEditorCommon objectstore from Alignment', async () => {
    const formattedAlignment = alignment1.convertToIndexedDB()
    const result = IndexedDBStructure.serializeCommon(formattedAlignment)

    expect(result.length).toEqual(1)
    expect(result[0].ID).toEqual(`${alignment1.userID}-${alignment1.id}`)
    expect(result[0].userID).toEqual(alignment1.userID)
    expect(result[0].alignmentID).toEqual(alignment1.id)
    expect(result[0].createdDT).toEqual(ConvertUtility.convertDateToString(alignment1.createdDT))
    expect(result[0].updatedDT).toEqual(ConvertUtility.convertDateToString(alignment1.updatedDT))
    expect(result[0].langsList).toEqual(alignment1.langsList)
  })

  it('2 IndexedDBStructure - serializeDocSource - prepares data for ALEditorDocSource objectstore from Alignment', async () => {
    const formattedAlignment = alignment1.convertToIndexedDB()
    const result = IndexedDBStructure.serializeDocSource(formattedAlignment)

    expect(result.length).toEqual(3)

    expect(result[0].ID).toEqual(`${alignment1.userID}-${alignment1.id}-origin-${alignment1.origin.docSource.id}`)
    expect(result[1].ID).toEqual(`${alignment1.userID}-${alignment1.id}-target-${alignment1.allTargetDocSources[0].id}`)
    expect(result[2].ID).toEqual(`${alignment1.userID}-${alignment1.id}-target-${alignment1.allTargetDocSources[1].id}`)

    expect(result[0].userID).toEqual(alignment1.userID)
    expect(result[1].userID).toEqual(alignment1.userID)
    expect(result[2].userID).toEqual(alignment1.userID)

    expect(result[0].alignmentID).toEqual(alignment1.id)
    expect(result[1].alignmentID).toEqual(alignment1.id)
    expect(result[2].alignmentID).toEqual(alignment1.id)

    expect(result[0].textType).toEqual('origin')
    expect(result[1].textType).toEqual('target')
    expect(result[2].textType).toEqual('target')

    expect(result[0].textId).toEqual(alignment1.origin.docSource.id)
    expect(result[1].textId).toEqual(alignment1.allTargetDocSources[0].id)
    expect(result[2].textId).toEqual(alignment1.allTargetDocSources[1].id)

    expect(result[0].lang).toEqual('grc')
    expect(result[1].lang).toEqual('eng')
    expect(result[2].lang).toEqual('kat')

    expect(result[0].sourceType).toEqual('text')
    expect(result[1].sourceType).toEqual('text')
    expect(result[2].sourceType).toEqual('text')

    expect(result[0].direction).toEqual('ltr')
    expect(result[1].direction).toEqual('ltr')
    expect(result[2].direction).toEqual('ltr')

    expect(result[0].text).toEqual(expect.any(Blob))
    expect(result[1].text).toEqual(expect.any(Blob))
    expect(result[2].text).toEqual(expect.any(Blob))

    expect(result[0].tokenization).toEqual({ tokenizer: 'alpheiosRemoteTokenizer', segments: 'doubleline' })
    expect(result[1].tokenization).toEqual({ tokenizer: 'alpheiosRemoteTokenizer', segments: 'doubleline' })
    expect(result[2].tokenization).toEqual({ tokenizer: 'alpheiosRemoteTokenizer', segments: 'doubleline' })
  })

  it('3 IndexedDBStructure - serializeMetadata - prepares data for ALEditorMetadata objectstore from Alignment', async () => {
    const formattedAlignment = alignment1.convertToIndexedDB()
    const result = IndexedDBStructure.serializeMetadata(formattedAlignment)

    expect(result.length).toEqual(14)

    expect(result[0].property).toEqual('title')
    expect(result[1].property).toEqual('date copyrighted')
    expect(result[2].property).toEqual('creator')
    expect(result[3].property).toEqual('publisher')
    expect(result[4].property).toEqual('title')
    expect(result[5].property).toEqual('creator')
    expect(result[6].property).toEqual('publisher')
    expect(result[7].property).toEqual('date copyrighted')
    expect(result[8].property).toEqual('title')
    expect(result[9].property).toEqual('source')
    expect(result[10].property).toEqual('creator')
    expect(result[11].property).toEqual('publisher')
    expect(result[12].property).toEqual('date copyrighted')
    expect(result[13].property).toEqual('contributor')


    expect(result[0].value).toEqual('Test Origin title')
    expect(result[1].value).toEqual('2021')
    expect(result[2].value).toEqual([ 'Test Creator 2', 'Test Creator1' ])
    expect(result[3].value).toEqual('Test Publisher')
    expect(result[4].value).toEqual('Test Target1 title')
    expect(result[5].value).toEqual([ 'Test Creator1', 'Test Creator2' ])
    expect(result[6].value).toEqual('Test Publisher')
    expect(result[7].value).toEqual('2021')
    expect(result[8].value).toEqual('Test Target2 title')
    expect(result[9].value).toEqual('2021')
    expect(result[10].value).toEqual([ 'Test Creator1', 'Test Creator2' ])
    expect(result[11].value).toEqual('Test Publisher')
    expect(result[12].value).toEqual('2021')
    expect(result[13].value).toEqual([ 'Contributor ', 'Test ' ])
  })

  it('4 IndexedDBStructure - serializeAlignedText - prepares data for ALEditorAlignedText objectstore from Alignment', async () => {
    const formattedAlignment = alignment1.convertToIndexedDB()
    const result = IndexedDBStructure.serializeAlignedText(formattedAlignment)

    expect(result.length).toEqual(3)

    expect(result[0].ID).toEqual(`${alignment1.userID}-${alignment1.id}-origin-${alignment1.origin.docSource.id}`)
    expect(result[1].ID).toEqual(`${alignment1.userID}-${alignment1.id}-target-${alignment1.allTargetDocSources[0].id}`)
    expect(result[2].ID).toEqual(`${alignment1.userID}-${alignment1.id}-target-${alignment1.allTargetDocSources[1].id}`)

    expect(result[0].userID).toEqual(alignment1.userID)
    expect(result[1].userID).toEqual(alignment1.userID)
    expect(result[2].userID).toEqual(alignment1.userID)

    expect(result[0].alignmentID).toEqual(alignment1.id)
    expect(result[1].alignmentID).toEqual(alignment1.id)
    expect(result[2].alignmentID).toEqual(alignment1.id)

    expect(result[0].textType).toEqual('origin')
    expect(result[1].textType).toEqual('target')
    expect(result[2].textType).toEqual('target')

    expect(result[0].textId).toEqual(alignment1.origin.docSource.id)
    expect(result[1].textId).toEqual(alignment1.allTargetDocSources[0].id)
    expect(result[2].textId).toEqual(alignment1.allTargetDocSources[1].id)

    expect(result[0].lang).toEqual('grc')
    expect(result[1].lang).toEqual('eng')
    expect(result[2].lang).toEqual('kat')

    expect(result[0].direction).toEqual('ltr')
    expect(result[1].direction).toEqual('ltr')
    expect(result[2].direction).toEqual('ltr')

    expect(result[0].tokenPrefix).toEqual("1")
    expect(result[1].tokenPrefix).toEqual("2")
    expect(result[2].tokenPrefix).toEqual("3")

    expect(result[0].tokenization).toEqual({ tokenizer: 'alpheiosRemoteTokenizer', segments: 'doubleline' })
    expect(result[1].tokenization).toEqual({ tokenizer: 'alpheiosRemoteTokenizer', segments: 'doubleline' })
    expect(result[2].tokenization).toEqual({ tokenizer: 'alpheiosRemoteTokenizer', segments: 'doubleline' })
  })

  it('5 IndexedDBStructure - serializeSegments - prepares data for ALEditorSegments objectstore from Alignment', async () => {
    const formattedAlignment = alignment1.convertToIndexedDB()
    const result = IndexedDBStructure.serializeSegments(formattedAlignment)

    expect(result.length).toEqual(12)

    expect(result[0].index).toEqual(1)
    expect(result[1].index).toEqual(2)
    expect(result[2].index).toEqual(3)
    expect(result[3].index).toEqual(4)

    expect(result[4].index).toEqual(1)
    expect(result[5].index).toEqual(2)
    expect(result[6].index).toEqual(3)
    expect(result[7].index).toEqual(4)

    expect(result[8].index).toEqual(1)
    expect(result[9].index).toEqual(2)
    expect(result[10].index).toEqual(3)
    expect(result[11].index).toEqual(4)


    expect(result[0].textType).toEqual('origin')
    expect(result[1].textType).toEqual('origin')
    expect(result[2].textType).toEqual('origin')
    expect(result[3].textType).toEqual('origin')

    expect(result[4].textType).toEqual('target')
    expect(result[5].textType).toEqual('target')
    expect(result[6].textType).toEqual('target')
    expect(result[7].textType).toEqual('target')

    expect(result[8].textType).toEqual('target')
    expect(result[9].textType).toEqual('target')
    expect(result[10].textType).toEqual('target')
    expect(result[11].textType).toEqual('target')
  })

  it('6 IndexedDBStructure - serializeTokens - prepares data for ALEditorTokens objectstore from Alignment', async () => {
    const formattedAlignment = alignment1.convertToIndexedDB()
    const result = IndexedDBStructure.serializeTokens(formattedAlignment)

    expect(result.length).toEqual(949)

    expect(result[0].ID).toEqual(`${alignment1.userID}-${alignment1.id}-${alignment1.origin.docSource.id}-${alignment1.origin.alignedText.segments[0].index}-${alignment1.origin.alignedText.segments[0].tokens[0].idWord}`)
    expect(result[0].alTextIdSegIndex).toEqual(`${alignment1.id}-${alignment1.origin.docSource.id}-${alignment1.origin.alignedText.segments[0].index}`)
    expect(result[0].textType).toEqual('origin')
    expect(result[0].idWord).toEqual('1-0-0')
    expect(result[0].word).toEqual('[')
    expect(result[0].segmentIndex).toEqual(1)
    expect(result[0].docSourceId).toEqual(alignment1.origin.docSource.id)
    expect(result[0].sentenceIndex).toEqual(1)
    expect(result[0].tokenIndex).toEqual(0)
  })

  it('7 IndexedDBStructure - serializeAlGroups - prepares data for ALEditorAlGroups objectstore from Alignment', async () => {
    const formattedAlignment = alignment1.convertToIndexedDB()
    const result = IndexedDBStructure.serializeAlGroups(formattedAlignment)

    expect(result.length).toEqual(10)

    expect(result[0].ID).toEqual(`${alignment1.userID}-${alignment1.id}-${alignment1.alignmentGroups[0].id}`)
    expect(result[0].alGroupId).toEqual(alignment1.alignmentGroups[0].id)
    expect(result[0].segmentIndex).toEqual(1)
    expect(result[0].targetId).toEqual(alignment1.allTargetDocSources[1].id)
    expect(result[0].origin).toEqual([ '1-0-4' ])
    expect(result[0].target).toEqual([ '3-0-3' ])

  })
})
