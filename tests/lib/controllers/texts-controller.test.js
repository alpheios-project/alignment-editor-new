/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import TextsController from '@/lib/controllers/texts-controller.js'
import L10n from '@/lib/l10n/l10n.js'
import Alignment from '@/lib/data/alignment'
import UploadController from '@/lib/controllers/upload-controller.js'
import DownloadController from '@/lib/controllers/download-controller.js'
import SourceText from '@/lib/data/source-text'

describe('texts-controller.test.js', () => {

  console.error = function () {}
  console.log = function () {}
  console.warn = function () {}

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 TextsController - creates TextsController and uploads l10n from parameters, l10n is an Instance of L10n module', () => {
    const l10n = new L10n()
    const textsC = new TextsController(l10n)

    expect(console.error).not.toHaveBeenCalled()
    expect(textsC.l10n).toBeInstanceOf(L10n)
  })

  it('2 TextsController - creates TextsController and prints an error, if l10n is not an Instance of L10n module', () => {
    const textsC = new TextsController()

    expect(console.error).toHaveBeenCalled()
    expect(textsC.l10n).not.toBeDefined()
  })

  it('3 TextsController - createAlignment defines alignment object ', () => {
    const l10n = new L10n()
    const textsC = new TextsController(l10n)

    textsC.createAlignment(null, null, l10n)

    expect(textsC.alignment).toBeInstanceOf(Alignment)
  })

  it('4 TextsController - updateOriginDocSource creates alignment if it is not created yet ', () => {
    const l10n = new L10n()
    const textsC = new TextsController(l10n)

    textsC.createAlignment = jest.fn()
    const docSource = { text: 'originDocSource', direction: 'ltr', lang: 'lat' }
    textsC.updateOriginDocSource(docSource)

    expect(textsC.alignment).not.toBeDefined()
    expect(textsC.createAlignment).toHaveBeenCalledWith(docSource, null, l10n)
  })

  it('5 TextsController - updateOriginDocSource updates origin document source to an existed alignment object ', () => {
    const l10n = new L10n()
    const textsC = new TextsController(l10n)

    textsC.createAlignment(null, null, l10n)

    jest.spyOn(textsC, 'createAlignment')
    jest.spyOn(textsC.alignment, 'updateOriginDocSource')

    const docSource = { text: 'originDocSource', direction: 'ltr', lang: 'lat' }
    textsC.updateOriginDocSource(docSource)

    expect(textsC.createAlignment).not.toHaveBeenCalled()
    expect(textsC.alignment.updateOriginDocSource).toHaveBeenCalledWith(docSource)
  })

  it('6 TextsController - updateTargetDocSource creates alignment if it is not created yet ', () => {
    const l10n = new L10n()
    const textsC = new TextsController(l10n)

    textsC.createAlignment = jest.fn()
    const docSource = { text: 'targetDocSource', direction: 'ltr', lang: 'lat' }
    textsC.updateTargetDocSource(docSource)

    expect(textsC.alignment).not.toBeDefined()
    expect(textsC.createAlignment).toHaveBeenCalledWith(null, docSource, l10n)
  })

  it('7 TextsController - updateTargetDocSource updates target document source to an existed alignment object ', () => {
    const l10n = new L10n()
    const textsC = new TextsController(l10n)


    textsC.createAlignment(null, null, l10n)

    jest.spyOn(textsC, 'createAlignment')
    jest.spyOn(textsC.alignment, 'updateTargetDocSource')

    const docSource = { text: 'targetDocSource', direction: 'ltr', lang: 'lat' }
    textsC.updateTargetDocSource(docSource)

    expect(textsC.createAlignment).not.toHaveBeenCalled()
    expect(textsC.alignment.updateTargetDocSource).toHaveBeenCalledWith(docSource)
  })

  it('8 TextsController - originDocSource returns origin document source if alignment is defined otherwise it returns null ', () => {
    const l10n = new L10n()
    const textsC = new TextsController(l10n)

    expect(textsC.originDocSource).toBeNull()

    const docSource = { text: 'originDocSource', direction: 'ltr', lang: 'lat' }
    textsC.updateOriginDocSource(docSource)
    expect(textsC.originDocSource).toBeInstanceOf(SourceText)
  })

  it('9 TextsController - targetDocSource returns target document source if alignment is defined otherwise it returns null ', () => {
    const l10n = new L10n()
    const textsC = new TextsController(l10n)

    expect(textsC.targetDocSource).toBeNull()

    const docSource = { text: 'targetDocSource', direction: 'ltr', lang: 'lat' }
    textsC.updateTargetDocSource(docSource)
    expect(textsC.targetDocSource).toBeInstanceOf(SourceText)
  })

  it('10 TextsController - uploadDocSourceFromFile prints error if fileData is empty', () => {
    const l10n = new L10n()
    const textsC = new TextsController(l10n)

    UploadController.upload = jest.fn()
    jest.spyOn(textsC, 'updateOriginDocSource')
    jest.spyOn(textsC, 'updateTargetDocSource')

    textsC.uploadDocSourceFromFile()
    expect(console.error).toHaveBeenCalled()
    
    expect(UploadController.upload).not.toHaveBeenCalled()
    expect(textsC.updateOriginDocSource).not.toHaveBeenCalled()
    expect(textsC.updateTargetDocSource).not.toHaveBeenCalled()
  })

  it('11 TextsController - uploadDocSourceFromFile executes UploadController.upload and update document source texts from it', () => {
    const l10n = new L10n()
    const textsC = new TextsController(l10n)

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

  it('12 TextsController - uploadDocSourceFromFile executes UploadController.upload and does not update document source texts if upload result is false ', () => {
    const l10n = new L10n()
    const textsC = new TextsController(l10n)

    UploadController.upload = jest.fn(() => false)

    jest.spyOn(textsC, 'updateOriginDocSource')
    jest.spyOn(textsC, 'updateTargetDocSource')

    textsC.uploadDocSourceFromFile('some file document')

    expect(UploadController.upload).toHaveBeenCalled()
    expect(textsC.updateOriginDocSource).not.toHaveBeenCalled()
    expect(textsC.updateTargetDocSource).not.toHaveBeenCalled()
  })

  it('13 TextsController - downloadData executes DownloadController.download', () => {
    const l10n = new L10n()
    const textsC = new TextsController(l10n)

    DownloadController.download = jest.fn()

    textsC.downloadData()
    
    expect(DownloadController.download).toHaveBeenCalled()
  })
})
