/* eslint-env jest */
/* eslint-disable no-unused-vars */

import UploadController from '@/lib/controllers/upload-controller.js'
import SourceText from '@/lib/data/source-text'
import AppController from '@/lib/controllers/app-controller.js'

describe('upload-controller.test.js', () => {
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

  it('1 UploadController - static uploadMethods return an object with registered workflows ', () => {
    const uploadMethods = UploadController.uploadMethods
  
    expect(Object.keys(uploadMethods).length).toEqual(3)
    expect(Object.keys(uploadMethods)[0]).toEqual('plainSourceUploadAll')
    expect(Object.keys(uploadMethods)[1]).toEqual('plainSourceUploadSingle')
    expect(Object.keys(uploadMethods)[2]).toEqual('jsonSimpleUploadAll')
    
  })

  it('2 UploadController - static upload method prints error if uploadType is not registered ', () => {
    const uploadType = 'fakeMethod'
    const fileData = 'originText \n ltr \n lat \n targetText \n ltr \n eng'
  
    const result = UploadController.upload(uploadType, { fileData })

    expect(result).toBeFalsy()
    expect(console.error).toHaveBeenCalled()
  })

  it('3 UploadController - static upload method executes defined method by workflow ', () => {
    const uploadType = 'plainSourceUploadAll'
    const fileData = 'originText \n ltr \n lat \n targetText \n ltr \n eng'
    
    jest.spyOn(UploadController, 'plainSourceUploadAll')
    UploadController.upload(uploadType, { fileData })

    expect(UploadController.plainSourceUploadAll).toHaveBeenCalledWith({fileData})
  })

  it('4 UploadController - static plainSourceUploadAll method prints error if data is not correctly defined ', () => {
    let fileData, result
    
    // no data
    fileData = '' 
    result = UploadController.plainSourceUploadAll({ fileData })

    expect(result).toBeFalsy()
  })

  it('5 UploadController - static plainSourceUploadAll method return correctly uploaded data if fileData passed properly ', () => {
    let fileData, result
    
    fileData = 'HEADER:1 \t ltr \t lat \t text \n originText \n ltr \n lat \n targetText \n ltr \n eng' 
    result = UploadController.plainSourceUploadAll({ fileData })

    expect(result).toHaveProperty('originDocSource', expect.any(SourceText))
    expect(result).toHaveProperty('targetDocSources', expect.any(Array))
  })

})
