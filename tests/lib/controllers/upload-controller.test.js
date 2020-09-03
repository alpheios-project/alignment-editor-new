/* eslint-env jest */
/* eslint-disable no-unused-vars */

import UploadController from '@/lib/controllers/upload-controller.js'
import SourceText from '@/lib/data/source-text'
import AppController from '@/lib/controllers/app-controller.js'

describe('upload-controller.test.js', () => {
  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
    
  beforeAll(() => {
    const appC = new AppController({
      appId: 'alpheios-alignment-editor'
    })
    appC.defineL10Support()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 UploadController - static uploadMethods return an object with registered workflows ', () => {
    const uploadMethods = UploadController.uploadMethods
  
    expect(Object.keys(uploadMethods).length).toEqual(1)
    expect(Object.keys(uploadMethods)[0]).toEqual('plainSourceUploadFromFile')
  })

  it('2 UploadController - static upload method prints error if uploadType is not registered ', () => {
    const uploadType = 'fakeMethod'
    const data = 'originText \n ltr \n lat \n targetText \n ltr \n eng'
  
    const result = UploadController.upload(uploadType, data)

    expect(result).toBeFalsy()
    expect(console.error).toHaveBeenCalled()
  })

  it('3 UploadController - static upload method executes defined method by workflow ', () => {
    const uploadType = 'plainSourceUploadFromFile'
    const data = 'originText \n ltr \n lat \n targetText \n ltr \n eng'
    
    jest.spyOn(UploadController, 'plainSourceUploadFromFile')
    UploadController.upload(uploadType, data)

    expect(UploadController.plainSourceUploadFromFile).toHaveBeenCalledWith(data)
  })

  it('4 UploadController - static plainSourceUploadFromFile method prints error if data is not correctly defined ', () => {
    let data, result
    
    // no data
    data = '' 
    result = UploadController.plainSourceUploadFromFile(data)

    expect(result).toBeFalsy()

    //data could not be split to lines
    data = 'origin' 
    result = UploadController.plainSourceUploadFromFile(data)

    expect(result).toBeFalsy()

    //data has less then 6 lines 
    data = 'originText \n ltr \n lat' 
    result = UploadController.plainSourceUploadFromFile(data)

    expect(result).toBeFalsy()
  })

  it('5 UploadController - static plainSourceUploadFromFile method return correctly uploaded data if fileData passed properly ', () => {
    let data, result
    
    data = 'originText \n ltr \n lat \n targetText \n ltr \n eng' 
    result = UploadController.plainSourceUploadFromFile(data)

    expect(result).toHaveProperty('originDocSource', expect.any(SourceText))
    expect(result).toHaveProperty('targetDocSource', expect.any(SourceText))
  })
})
