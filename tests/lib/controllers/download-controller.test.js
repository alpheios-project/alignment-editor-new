/* eslint-env jest */
/* eslint-disable no-unused-vars */

import DownloadController from '@/lib/controllers/download-controller.js'
import DownloadFileCsv from '@/lib/download/download-file-csv.js'
import SourceText from '@/lib/data/source-text'
import AppController from '@/lib/controllers/app-controller.js'
import Alignment from '@/lib/data/alignment'
import MetadataTerm from '@/lib/data/metadata-term.js'
import AlignedText from '@/lib/data/aligned-text'
import AlignmentGroup from '@/lib/data/alignment-group'

describe('download-controller.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  beforeAll(async () => {
    const appC = new AppController({
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
/*
  it('1 DownloadController - static downloadMethods return an object with registered workflows ', () => {
    const downloadMethods = DownloadController.downloadMethods
  
    expect(Object.keys(downloadMethods).length).toEqual(3)
    expect(Object.keys(downloadMethods)[0]).toEqual('plainSourceDownloadAll')
    expect(Object.keys(downloadMethods)[1]).toEqual('plainSourceDownloadSingle')
    expect(Object.keys(downloadMethods)[2]).toEqual('jsonSimpleDownloadAll')
  })

  it('2 DownloadController - static download method prints error if downloadType is not registered ', () => {
    const downloadType = 'fakeMethod'
    const data = {
      originDocSource: {
        text: 'originText', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
      },
      targetDocSource: {
        text: 'targetText', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
      }
    }
  
    const result = DownloadController.download(downloadType, data)

    expect(result).toBeFalsy()
    expect(console.error).toHaveBeenCalled()
  })

  it('3 DownloadController - static download method executes defined method by workflow ', () => {
    const downloadType = 'plainSourceDownloadAll'
    const data = {
      originDocSource: {
        text: 'originText', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
      },
      targetDocSource: {
        text: 'targetText', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
      }
    }
    
    jest.spyOn(DownloadController, 'plainSourceDownloadAll')
    DownloadController.download(downloadType, data)

    expect(DownloadController.plainSourceDownloadAll).toHaveBeenCalledWith(data)
  })

  it('4 DownloadController - static plainSourceDownloadAll method prints error if data is not correctly defined ', () => {
    let data, result
    jest.spyOn(DownloadFileCsv, 'download')
    
    // no data
    data = {} 
    result = DownloadController.plainSourceDownloadAll(data)

    expect(result).toBeFalsy()
    expect(DownloadFileCsv.download).not.toHaveBeenCalled()

    // no originDocSource data
    data = {
      targetDocSource: new SourceText('target', {
        text: 'targetText', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
      })
    } 
    result = DownloadController.plainSourceDownloadAll(data)

    expect(result).toBeFalsy()
    expect(DownloadFileCsv.download).not.toHaveBeenCalled()

    // no targetDocSource data
    data = {
      originDocSource: new SourceText('origin', {
        text: 'originText', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
      })
    }
      
    result = DownloadController.plainSourceDownloadAll({})
  
    expect(result).toBeFalsy()
    expect(DownloadFileCsv.download).not.toHaveBeenCalled()

    // originDocSource data is not correctly defined
    data = {
      originDocSource: new SourceText('origin', {
        text: 'originText', direction: 'ltr', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
      }),
      targetDocSource: new SourceText('target', {
        text: 'targetText', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
      })
    }
      
    result = DownloadController.plainSourceDownloadAll({})
  
    expect(result).toBeFalsy()
    expect(DownloadFileCsv.download).not.toHaveBeenCalled()

    // targetDocSource data is not correctly defined
    data = {
      originDocSource: new SourceText('origin', {
        text: 'originText', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
      }),
      targetDocSource: new SourceText('target', {
        text: 'targetText', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
      })
    }
    
    result = DownloadController.plainSourceDownloadAll({})

    expect(result).toBeFalsy()
    expect(DownloadFileCsv.download).not.toHaveBeenCalled()

  })

  it('5 DownloadController - static plainSourceDownloadAll method executes DownloadFileCsv.download if data is correctly defined ', () => {
    DownloadFileCsv.download = jest.fn()

    const data = {
      originDocSource: new SourceText('origin', {
        text: 'originText', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
      }),
      targetDocSources: [new SourceText('target', {
        text: 'targetText', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
      })]
    } 
    DownloadController.plainSourceDownloadAll(data)

    expect(DownloadFileCsv.download).toHaveBeenCalled()
  })
*/

  it('6 DownloadController - static jsonSimpleDownloadAll - creates json download', async() => {
    const originDocSource = new SourceText('origin', {
      text: 'Capuam colonis deductis occupabunt\u2028Venibit igitur sub praecone', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    originDocSource.addMetadata(MetadataTerm.property.TITLE, 'Origin title')
    originDocSource.addMetadata(MetadataTerm.property.CREATOR, 'Origin creator1')
    originDocSource.addMetadata(MetadataTerm.property.CREATOR, 'Origin creator2')

    // console.info(originDocSource.metadata.properties)
    const targetDocSource1 = new SourceText('target', {
      text: 'To a certain extent jointly launching occupabunt\u2028Will be sold then', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    targetDocSource1.addMetadata(MetadataTerm.property.TITLE, 'Target1 title')
    targetDocSource1.addMetadata(MetadataTerm.property.CREATOR, 'Target1 creator1')
    targetDocSource1.addMetadata(MetadataTerm.property.CREATOR, 'Target1 creator2')

    const targetDocSource2 = new SourceText('target', {
      text: 'Hasta cierto punto\u2028Se venderá entonces', direction: 'ltr', lang: 'spa', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    targetDocSource2.addMetadata(MetadataTerm.property.TITLE, 'Target2 title')
    targetDocSource2.addMetadata(MetadataTerm.property.CREATOR, 'Target2 creator1')
    targetDocSource2.addMetadata(MetadataTerm.property.CREATOR, 'Target2 creator2')


    const alignment = new Alignment(originDocSource, targetDocSource1)
    alignment.updateTargetDocSource(targetDocSource2) 

    await alignment.createAlignedTexts()

    // console.info('alignment - ', alignment.origin.alignedText)

    const targetId1 = alignment.allTargetTextsIds[0]
    const targetId2 = alignment.allTargetTextsIds[1]

    const allSegments = alignment.allAlignedTextsSegments

    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    
    const targetToken1 = allSegments[0].targets[targetId1].tokens[0]
    const targetToken2 = allSegments[0].targets[targetId1].tokens[1]
    const targetToken3 = allSegments[0].targets[targetId1].tokens[2]

    alignment.startNewAlignmentGroup(originToken1, targetId1) // capuam
    alignment.addToAlignmentGroup(originToken2, targetId1) //colonis

    alignment.addToAlignmentGroup(targetToken1, targetId1) // to
    alignment.addToAlignmentGroup(targetToken2, targetId1) // a
    alignment.addToAlignmentGroup(targetToken3, targetId1) // certain

    alignment.finishActiveAlignmentGroup()

    const targetToken4 = allSegments[0].targets[targetId2].tokens[0]
    const targetToken5 = allSegments[0].targets[targetId2].tokens[1]

    alignment.startNewAlignmentGroup(targetToken4, targetId2) // Hasta
    alignment.addToAlignmentGroup(targetToken5, targetId2) // cierto


    // const result = DownloadController.jsonSimpleDownloadAll(alignment)

    console.info('1.', alignment)

    console.info('2.', alignment.convertToJSON())

    /***********Conversion */
    console.info('3.', Alignment.convertFromJSON(alignment.convertToJSON()))
  })

})
