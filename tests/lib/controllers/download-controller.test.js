/* eslint-env jest */
/* eslint-disable no-unused-vars */

import DownloadController from '@/lib/controllers/download-controller.js'
import DownloadFileCsv from '@/lib/download/download-file-csv.js'
import SourceText from '@/lib/data/source-text'
import AppController from '@/lib/controllers/app-controller.js'

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

  it('1 DownloadController - static downloadMethods return an object with registered workflows ', () => {
    const downloadMethods = DownloadController.downloadMethods
  
    expect(Object.keys(downloadMethods).length).toEqual(2)
    expect(Object.keys(downloadMethods)[0]).toEqual('plainSourceDownloadAll')
    expect(Object.keys(downloadMethods)[1]).toEqual('plainSourceDownloadSingle')
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
})
