/* eslint-env jest */
/* eslint-disable no-unused-vars */

import DownloadController from '@/lib/controllers/download-controller.js'
import DownloadFileOneColumn from '@/lib/download/download-file-one-column.js'
import L10n from '@/lib/l10n/l10n.js'
import SourceText from '@/lib/data/source-text'

describe('download-controller.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
    
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 DownloadController - static downloadMethods return an object with registered workflows ', () => {
    const downloadMethods = DownloadController.downloadMethods
  
    expect(Object.keys(downloadMethods).length).toEqual(1)
    expect(Object.keys(downloadMethods)[0]).toEqual('plainSourceDownload')
  })

  it('2 DownloadController - static download method prints error if downloadType is not registered ', () => {
    const l10n = new L10n()
    const downloadType = 'fakeMethod'
    const data = {
      originDocSource: {
        text: 'originText', direction: 'ltr', lang: 'lat'
      },
      targetDocSource: {
        text: 'targetText', direction: 'ltr', lang: 'eng'
      }
    }
  
    const result = DownloadController.download(downloadType, data, l10n)

    expect(result).toBeFalsy()
    expect(console.error).toHaveBeenCalled()
  })

  it('3 DownloadController - static download method executes defined method by workflow ', () => {
    const l10n = new L10n()
    const downloadType = 'plainSourceDownload'
    const data = {
      originDocSource: {
        text: 'originText', direction: 'ltr', lang: 'lat'
      },
      targetDocSource: {
        text: 'targetText', direction: 'ltr', lang: 'eng'
      }
    }
    
    jest.spyOn(DownloadController, 'plainSourceDownload')
    DownloadController.download(downloadType, data, l10n)

    expect(DownloadController.plainSourceDownload).toHaveBeenCalledWith(data, l10n)
  })

  it('4 DownloadController - static plainSourceDownload method prints error if data is not correctly defined ', () => {
    const l10n = new L10n()
    let data, result
    jest.spyOn(DownloadFileOneColumn, 'download')
    
    // no data
    data = {} 
    result = DownloadController.plainSourceDownload(data, l10n)

    expect(result).toBeFalsy()
    expect(DownloadFileOneColumn.download).not.toHaveBeenCalled()

    // no originDocSource data
    data = {
      targetDocSource: new SourceText('target', {
        text: 'targetText', direction: 'ltr', lang: 'eng'
      })
    } 
    result = DownloadController.plainSourceDownload(data, l10n)

    expect(result).toBeFalsy()
    expect(DownloadFileOneColumn.download).not.toHaveBeenCalled()

    // no targetDocSource data
    data = {
      originDocSource: new SourceText('origin', {
        text: 'originText', direction: 'ltr', lang: 'lat'
      })
    }
      
    result = DownloadController.plainSourceDownload({}, l10n)
  
    expect(result).toBeFalsy()
    expect(DownloadFileOneColumn.download).not.toHaveBeenCalled()

    // originDocSource data is not correctly defined
    data = {
      originDocSource: new SourceText('origin', {
        text: 'originText', direction: 'ltr'
      }),
      targetDocSource: new SourceText('target', {
        text: 'targetText', direction: 'ltr', lang: 'eng'
      })
    }
      
    result = DownloadController.plainSourceDownload({}, l10n)
  
    expect(result).toBeFalsy()
    expect(DownloadFileOneColumn.download).not.toHaveBeenCalled()

    // targetDocSource data is not correctly defined
    data = {
      originDocSource: new SourceText('origin', {
        text: 'originText', direction: 'ltr', lang: 'lat'
      }),
      targetDocSource: new SourceText('target', {
        text: 'targetText', lang: 'eng'
      })
    }
    
    result = DownloadController.plainSourceDownload({}, l10n)

    expect(result).toBeFalsy()
    expect(DownloadFileOneColumn.download).not.toHaveBeenCalled()

  })

  it('5 DownloadController - static plainSourceDownload method executes DownloadFileOneColumn.download if data is correctly defined ', () => {
    const l10n = new L10n()
    DownloadFileOneColumn.download = jest.fn()
    
    const data = {
      originDocSource: new SourceText('origin', {
        text: 'originText', direction: 'ltr', lang: 'lat'
      }),
      targetDocSource: new SourceText('target', {
        text: 'targetText', direction: 'ltr', lang: 'eng'
      })
    } 
    DownloadController.plainSourceDownload(data, l10n)

    expect(DownloadFileOneColumn.download).toHaveBeenCalled()
  })
})
