/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import TextsController from '@/lib/controllers/texts-controller.js'
import Alignment from '@/lib/data/alignment'
import UploadController from '@/lib/controllers/upload-controller.js'
import DownloadController from '@/lib/controllers/download-controller.js'
import SourceText from '@/lib/data/source-text'
import AppController from '@/lib/controllers/app-controller.js'

describe('texts-controller.test.js', () => {

  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  let appC
  beforeAll(async () => {
    appC = new AppController({
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

  it('1 TextsController - createAlignment defines alignment object ', () => {
    const textsC = new TextsController(appC.store)

    textsC.createAlignment(null, null)

    expect(textsC.alignment).toBeInstanceOf(Alignment)
  })

  it('2 TextsController - couldStartAlign returns true if all texts defined properly', () => {
    const textsC = new TextsController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'originDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('origin', {
      text: 'targetDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    textsC.createAlignment(originDocSource, targetDocSource)

    expect(textsC.couldStartAlign).toBeTruthy()
    textsC.updateTargetDocSource({ text: '', direction: 'ltr', lang: 'lat' })

    expect(textsC.couldStartAlign).toBeFalsy()
  })

  it('3 TextsController - updateOriginDocSource creates alignment if it is not created yet ', () => {
    const textsC = new TextsController(appC.store)

    jest.spyOn(textsC, 'createAlignment')
    
    const originDocSource = new SourceText('origin', {
      text: 'originDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    textsC.updateOriginDocSource(originDocSource)

    expect(textsC.alignment).toBeDefined()
    expect(textsC.createAlignment).toHaveBeenCalledWith(originDocSource, null)
  })

  it('4 TextsController - updateOriginDocSource updates origin document source to an existed alignment object ', () => {
    const textsC = new TextsController(appC.store)

    textsC.createAlignment(null, null)

    jest.spyOn(textsC, 'createAlignment')
    jest.spyOn(textsC.alignment, 'updateOriginDocSource')

    const originDocSource = new SourceText('origin', {
      text: 'originDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    textsC.updateOriginDocSource(originDocSource)

    expect(textsC.createAlignment).not.toHaveBeenCalled()
    expect(textsC.alignment.updateOriginDocSource).toHaveBeenCalledWith(originDocSource)
  })

  it('5 TextsController - updateTargetDocSource updates target document source to an existed alignment object ', () => {
    const textsC = new TextsController(appC.store)

    textsC.createAlignment(null, null)

    jest.spyOn(textsC, 'createAlignment')
    jest.spyOn(textsC.alignment, 'updateTargetDocSource')

    const originDocSource = new SourceText('target', {
      text: 'targetDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    textsC.updateTargetDocSource(originDocSource)

    expect(textsC.createAlignment).not.toHaveBeenCalled()
    expect(textsC.alignment.updateTargetDocSource).toHaveBeenCalledWith(originDocSource, undefined)
  })

  it('6 TextsController - deleteText removes target source text', () => {
    const textsC = new TextsController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'originDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    textsC.createAlignment(originDocSource, null)

    const targetDocSource = {
      text: 'targetDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    }

    textsC.updateTargetDocSource(targetDocSource, textsC.allTargetTextsIds[0])

    const targetDocSource2 = new SourceText('target', {
      text: 'targetDocSource2', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    textsC.updateTargetDocSource(targetDocSource2)
    
    textsC.deleteText('origin', textsC.alignment.origin.docSource.id) // will do nothing

    expect(textsC.originDocSource).toEqual(expect.any(SourceText))
    expect(textsC.allTargetTextsIds.length).toEqual(2)
    
    textsC.deleteText('target', textsC.allTargetTextsIds[1]) // deleted one targetText
    expect(textsC.allTargetTextsIds.length).toEqual(1)

    textsC.deleteText('target', textsC.allTargetTextsIds[0]) // won't delete because we couldn't delete the last target text
    expect(textsC.allTargetTextsIds.length).toEqual(1)
  })


  it('7 TextsController - originDocSource returns origin document source if alignment is defined otherwise it returns null ', () => {
    const textsC = new TextsController(appC.store)

    expect(textsC.originDocSource).toBeNull()

    const originDocSource = new SourceText('origin', {
      text: 'originDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    textsC.updateOriginDocSource(originDocSource)
    expect(textsC.originDocSource).toBeInstanceOf(SourceText)
  })


  it('8 TextsController - allTargetTextsIds returns an array with all targetIds', () => {
    const textsC = new TextsController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'originDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    textsC.updateOriginDocSource(originDocSource)

    expect(textsC.allTargetTextsIds.length).toEqual(1)

    const targetDocSource = {
      text: 'targetDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    }

    textsC.updateTargetDocSource(targetDocSource, textsC.allTargetTextsIds[0])
    expect(textsC.allTargetTextsIds.length).toEqual(1)
  })

  it('9 TextsController - targetDocSource returns target document source by id if alignment is defined otherwise it returns null ', () => {
    const textsC = new TextsController(appC.store)

    expect(textsC.originDocSource).toBeNull()

    const docSource =  {
      text: 'originDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    }
    textsC.updateOriginDocSource(docSource)

    const docSourceTarget =  {
      text: 'targetDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    }
    textsC.updateTargetDocSource(docSourceTarget)

    const targetId = textsC.allTargetTextsIds[0]
    expect(textsC.targetDocSource(targetId)).toBeInstanceOf(SourceText)
    expect(textsC.targetDocSource(null)).toBeNull()
  })

  it('9 TextsController - getDocSource returns origin/target document source by id if alignment is defined otherwise it returns null ', () => {
    const textsC = new TextsController(appC.store)

    expect(textsC.originDocSource).toBeNull()

    const docSource =  {
      text: 'originDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    }
    textsC.updateOriginDocSource(docSource)

    const docSourceTarget =  {
      text: 'targetDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    }
    textsC.updateTargetDocSource(docSourceTarget)

    const targetId = textsC.allTargetTextsIds[0]

    expect(textsC.getDocSource('origin')).toEqual(textsC.alignment.origin.docSource)
    expect(textsC.getDocSource('target', targetId)).toEqual(textsC.alignment.targets[targetId].docSource)
    expect(textsC.getDocSource('target')).toBeNull()
  })


  it('10 TextsController - uploadDocSourceFromFileAll prints error if fileData is empty', () => {
    const textsC = new TextsController(appC.store)

    UploadController.upload = jest.fn()
    jest.spyOn(textsC, 'updateOriginDocSource')
    jest.spyOn(textsC, 'updateTargetDocSource')

    textsC.uploadDocSourceFromFileAll()
    
    expect(UploadController.upload).not.toHaveBeenCalled()
    expect(textsC.updateOriginDocSource).not.toHaveBeenCalled()
    expect(textsC.updateTargetDocSource).not.toHaveBeenCalled()
  })

  it('11 TextsController - uploadDocSourceFromFileAll executes UploadController.upload and update document source texts from it', () => {
    const textsC = new TextsController(appC.store)

    UploadController.upload = jest.fn(() => {
      return {
        originDocSource: { text: 'originDocSource', direction: 'ltr', lang: 'lat' },
        targetDocSources: [{ text: 'targetDocSource', direction: 'ltr', lang: 'eng' }]
      }
    })

    jest.spyOn(textsC, 'updateOriginDocSource')
    jest.spyOn(textsC, 'updateTargetDocSource')

    textsC.uploadDocSourceFromFileAll('some file document')

    expect(UploadController.upload).toHaveBeenCalled()
    expect(textsC.updateOriginDocSource).toHaveBeenCalledWith({ text: 'originDocSource', direction: 'ltr', lang: 'lat' })
    expect(textsC.updateTargetDocSource).toHaveBeenCalledWith({ text: 'targetDocSource', direction: 'ltr', lang: 'eng' })
  })

  it('12 TextsController - uploadDocSourceFromFileAll executes UploadController.upload and does not update document source texts if upload result is false ', () => {
    const textsC = new TextsController(appC.store)

    UploadController.upload = jest.fn(() => false)

    jest.spyOn(textsC, 'updateOriginDocSource')
    jest.spyOn(textsC, 'updateTargetDocSource')

    textsC.uploadDocSourceFromFileAll('some file document')

    expect(UploadController.upload).toHaveBeenCalled()
    expect(textsC.updateOriginDocSource).not.toHaveBeenCalled()
    expect(textsC.updateTargetDocSource).not.toHaveBeenCalled()
  })

  it('13 TextsController - downloadData executes DownloadController.download', () => {
    const textsC = new TextsController(appC.store)

    DownloadController.download = jest.fn()

    textsC.downloadData()
    
    expect(DownloadController.download).toHaveBeenCalled()
  })

  it('14 TextsController - startOver - recreates a clear alignment', () => {
    const textsC = new TextsController(appC.store)

    expect(textsC.originDocSource).toBeNull()

    const docSource =  {
      text: 'originDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    }
    textsC.updateOriginDocSource(docSource)

    const docSourceTarget =  {
      text: 'targetDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    }
    textsC.updateTargetDocSource(docSourceTarget)


    textsC.startOver()

    expect(textsC.alignment.origin).toEqual({})
    expect(textsC.alignment.target).not.toBeDefined()
  })

})
