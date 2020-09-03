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

  it('1 TextsController - createAlignment defines alignment object ', () => {
    const textsC = new TextsController()

    textsC.createAlignment(null, null)

    expect(textsC.alignment).toBeInstanceOf(Alignment)
  })

  it('2 TextsController - updateOriginDocSource creates alignment if it is not created yet ', () => {
    const textsC = new TextsController()

    jest.spyOn(textsC, 'createAlignment')
    const docSource = { text: 'originDocSource', direction: 'ltr', lang: 'lat' }
    textsC.updateOriginDocSource(docSource)

    expect(textsC.alignment).toBeDefined()
    expect(textsC.createAlignment).toHaveBeenCalledWith(docSource, null)
  })

  it('3 TextsController - updateOriginDocSource updates origin document source to an existed alignment object ', () => {
    const textsC = new TextsController()

    textsC.createAlignment(null, null)

    jest.spyOn(textsC, 'createAlignment')
    jest.spyOn(textsC.alignment, 'updateOriginDocSource')

    const docSource = { text: 'originDocSource', direction: 'ltr', lang: 'lat' }
    textsC.updateOriginDocSource(docSource)

    expect(textsC.createAlignment).not.toHaveBeenCalled()
    expect(textsC.alignment.updateOriginDocSource).toHaveBeenCalledWith(docSource)
  })

  it('5 TextsController - updateTargetDocSource updates target document source to an existed alignment object ', () => {
    const textsC = new TextsController()

    textsC.createAlignment(null, null)

    jest.spyOn(textsC, 'createAlignment')
    jest.spyOn(textsC.alignment, 'updateTargetDocSource')

    const docSource = { text: 'targetDocSource', direction: 'ltr', lang: 'lat' }
    textsC.updateTargetDocSource(docSource)

    expect(textsC.createAlignment).not.toHaveBeenCalled()
    expect(textsC.alignment.updateTargetDocSource).toHaveBeenCalledWith(docSource)
  })

  it('6 TextsController - originDocSource returns origin document source if alignment is defined otherwise it returns null ', () => {
    const textsC = new TextsController()

    expect(textsC.originDocSource).toBeNull()

    const docSource = { text: 'originDocSource', direction: 'ltr', lang: 'lat' }
    textsC.updateOriginDocSource(docSource)
    expect(textsC.originDocSource).toBeInstanceOf(SourceText)
  })

  it('7 TextsController - targetDocSource returns target document source if alignment is defined otherwise it returns null ', () => {
    const textsC = new TextsController()

    const docSourceOrigin = { text: 'originDocSource', direction: 'ltr', lang: 'lat' }
    textsC.updateOriginDocSource(docSourceOrigin)

    expect(textsC.targetDocSource).toBeNull()

    const docSourceTarget = { text: 'targetDocSource', direction: 'ltr', lang: 'lat' }
    textsC.updateTargetDocSource(docSourceTarget)
    expect(textsC.targetDocSource).toBeInstanceOf(SourceText)
  })

  it('8 TextsController - uploadDocSourceFromFile prints error if fileData is empty', () => {
    const textsC = new TextsController()

    UploadController.upload = jest.fn()
    jest.spyOn(textsC, 'updateOriginDocSource')
    jest.spyOn(textsC, 'updateTargetDocSource')

    textsC.uploadDocSourceFromFile()
    
    expect(UploadController.upload).not.toHaveBeenCalled()
    expect(textsC.updateOriginDocSource).not.toHaveBeenCalled()
    expect(textsC.updateTargetDocSource).not.toHaveBeenCalled()
  })

  it('9 TextsController - uploadDocSourceFromFile executes UploadController.upload and update document source texts from it', () => {
    const textsC = new TextsController()

    UploadController.upload = jest.fn(() => {
      return {
        originDocSource: { text: 'originDocSource', direction: 'ltr', lang: 'lat' },
        targetDocSource: { text: 'targetDocSource', direction: 'ltr', lang: 'eng' }
      }
    })

    jest.spyOn(textsC, 'updateOriginDocSource')
    jest.spyOn(textsC, 'updateTargetDocSource')

    textsC.uploadDocSourceFromFile('some file document')

    expect(UploadController.upload).toHaveBeenCalled()
    expect(textsC.updateOriginDocSource).toHaveBeenCalledWith({ text: 'originDocSource', direction: 'ltr', lang: 'lat' })
    expect(textsC.updateTargetDocSource).toHaveBeenCalledWith({ text: 'targetDocSource', direction: 'ltr', lang: 'eng' })
  })

  it('10 TextsController - uploadDocSourceFromFile executes UploadController.upload and does not update document source texts if upload result is false ', () => {
    const textsC = new TextsController()

    UploadController.upload = jest.fn(() => false)

    jest.spyOn(textsC, 'updateOriginDocSource')
    jest.spyOn(textsC, 'updateTargetDocSource')

    textsC.uploadDocSourceFromFile('some file document')

    expect(UploadController.upload).toHaveBeenCalled()
    expect(textsC.updateOriginDocSource).not.toHaveBeenCalled()
    expect(textsC.updateTargetDocSource).not.toHaveBeenCalled()
  })

  it('11 TextsController - downloadData executes DownloadController.download', () => {
    const textsC = new TextsController()

    DownloadController.download = jest.fn()

    textsC.downloadData()
    
    expect(DownloadController.download).toHaveBeenCalled()
  })
})
