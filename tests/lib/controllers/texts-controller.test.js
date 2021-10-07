/* eslint-env jest */
/* eslint-disable no-unused-vars */

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import TextsController from '@/lib/controllers/texts-controller.js'
import SettingsController from '@/lib/controllers/settings-controller.js'
import StorageController from '@/lib/controllers/storage-controller.js'

import Alignment from '@/lib/data/alignment'
import Token from '@/lib/data/token'
import UploadController from '@/lib/controllers/upload-controller.js'
import DownloadController from '@/lib/controllers/download-controller.js'
import SourceText from '@/lib/data/source-text'
import AppController from '@/lib/controllers/app-controller.js'

import LatEng from '@tests/lib/storage/alignments/lat-eng-short.json'
import Annotation from '@/lib/data/annotation'

import IndexedDB from 'fake-indexeddb'
import IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange'

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

    textsC.createAlignment()

    expect(textsC.alignment).toBeInstanceOf(Alignment)
  })

  it('2 TextsController - couldStartAlign returns true if all texts defined properly', async () => {
    const textsC = new TextsController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'originDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    const targetDocSource = new SourceText('origin', {
      text: 'targetDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    textsC.createAlignment()
    await textsC.updateOriginDocSource(originDocSource)
    await textsC.updateTargetDocSource(targetDocSource)

    expect(textsC.couldStartAlign).toBeTruthy()

    const targetId = Object.keys(textsC.alignment.targets)[0]

    await textsC.updateTargetDocSource({ text: '', direction: 'ltr', lang: 'lat', id: targetId }, targetId)
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
    expect(textsC.createAlignment).toHaveBeenCalled()
  })

  it('4 TextsController - updateOriginDocSource updates origin document source to an existed alignment object ', () => {
    const textsC = new TextsController(appC.store)

    textsC.createAlignment()

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

    textsC.createAlignment()

    jest.spyOn(textsC, 'createAlignment')
    jest.spyOn(textsC.alignment, 'updateTargetDocSource')

    const targetDocSource = new SourceText('target', {
      text: 'targetDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    textsC.updateTargetDocSource(targetDocSource)

    expect(textsC.createAlignment).not.toHaveBeenCalled()
    expect(textsC.alignment.updateTargetDocSource).toHaveBeenCalledWith(targetDocSource, undefined)
  })

  it('6 TextsController - deleteText removes target source text', () => {
    const textsC = new TextsController(appC.store)

    const originDocSource = new SourceText('origin', {
      text: 'originDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    textsC.updateOriginDocSource(originDocSource)

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

    expect(textsC.allTargetTextsIds.length).toEqual(0)

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
    textsC.updateTargetDocSource(docSourceTarget, textsC.allTargetTextsIds[0])

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


  it.skip('10 TextsController - uploadDocSourceFromFileAll prints error if fileData is empty', () => {
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
    // expect(textsC.updateOriginDocSource).toHaveBeenCalledWith({ text: 'originDocSource', direction: 'ltr', lang: 'lat' })
    // expect(textsC.updateTargetDocSource).toHaveBeenCalledWith({ text: 'targetDocSource', direction: 'ltr', lang: 'eng' })
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

  it('13 TextsController - downloadData executes DownloadController.download', async () => {
    const textsC = new TextsController(appC.store)

    DownloadController.download = jest.fn()

    await textsC.downloadData('plainSourceDownloadAll')
    
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

  it('15 TextsController - allTargetDocSources returns all source texts from target', () => {
    const textsC = new TextsController(appC.store)

    expect(textsC.originDocSource).toBeNull()

    const docSource =  {
      text: 'originDocSource', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    }
    textsC.updateOriginDocSource(docSource)

    const docSourceTarget1 =  {
      text: 'targetDocSource 1', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    }
    textsC.updateTargetDocSource(docSourceTarget1, textsC.allTargetTextsIds[0])

    const docSourceTarget2 =  {
      text: 'targetDocSource 2', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    }
    textsC.updateTargetDocSource(docSourceTarget2)

    expect(textsC.allTargetDocSources.length).toEqual(2)

    expect(textsC.allTargetDocSources[0]).toBeInstanceOf(SourceText)
    expect(textsC.allTargetDocSources[1]).toBeInstanceOf(SourceText)

  })

  it('16 TextsController - addAnnotation - adds a new attonation if no id passed', () => {
    const textsC = new TextsController(appC.store)
    const alignment = Alignment.convertFromJSON(LatEng)
    textsC.alignment = alignment

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    expect(alignment.annotations).toEqual({})

    const result = textsC.addAnnotation({
      token: tokenOrigin1,
      type: 'COMMENT',
      text: 'test annotation'
    })
    expect(result).toBeTruthy()
    expect(Object.keys(alignment.annotations)).toEqual([tokenOrigin1.idWord])
    expect(alignment.annotations[tokenOrigin1.idWord].length).toEqual(1)

    expect(alignment.annotations[tokenOrigin1.idWord][0].type).toEqual('COMMENT')
    expect(alignment.annotations[tokenOrigin1.idWord][0].text).toEqual('test annotation')
    expect(alignment.annotations[tokenOrigin1.idWord][0].token).toEqual(expect.any(Token))
    
  })

  it('17 TextsController - addAnnotation - doesn\'t add a new attonation if no text or type are passed', () => {
    const textsC = new TextsController(appC.store)
    const alignment = Alignment.convertFromJSON(LatEng)
    textsC.alignment = alignment

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    expect(alignment.annotations).toEqual({})

    // let's try to add an annotation without type
    let result = textsC.addAnnotation({
      token: tokenOrigin1,
      text: 'test annotation'
    })
    expect(result).toBeFalsy()
    expect(Object.keys(alignment.annotations)).toEqual([])
    
    // let's try to add an annotation without text
    result = textsC.addAnnotation({
      token: tokenOrigin1,
      type: 'COMMENT',
    })
    expect(result).toBeFalsy()
    expect(Object.keys(alignment.annotations)).toEqual([])

    // let's try to add an annotation without token
    result = textsC.addAnnotation({
      text: 'test annotation',
      type: 'COMMENT',
    })
    expect(result).toBeFalsy()
    expect(Object.keys(alignment.annotations)).toEqual([])
  })

  it('18 TextsController - addAnnotation - updates an existed annotattion if a correct id is passed', () => {
    const textsC = new TextsController(appC.store)
    const alignment = Alignment.convertFromJSON(LatEng)
    textsC.alignment = alignment

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    
    // let's create an annotation
    let result = textsC.addAnnotation({
      token: tokenOrigin1,
      type: 'COMMENT',
      text: 'test annotation'
    })
    expect(result).toBeTruthy()
    expect(Object.keys(alignment.annotations)).toEqual([tokenOrigin1.idWord])
    expect(alignment.annotations[tokenOrigin1.idWord].length).toEqual(1)

    expect(alignment.annotations[tokenOrigin1.idWord][0].type).toEqual('COMMENT')
    expect(alignment.annotations[tokenOrigin1.idWord][0].text).toEqual('test annotation')

    // let's update the text of this annotation
    const annotationId = alignment.annotations[tokenOrigin1.idWord][0].id

    result = textsC.addAnnotation({
      id: annotationId,
      token: tokenOrigin1,
      type: 'COMMENT',
      text: 'updated test annotation'
    })

    expect(result).toBeTruthy()

    expect(Object.keys(alignment.annotations)).toEqual([tokenOrigin1.idWord])
    expect(alignment.annotations[tokenOrigin1.idWord].length).toEqual(1)

    expect(alignment.annotations[tokenOrigin1.idWord][0].type).toEqual('COMMENT')
    expect(alignment.annotations[tokenOrigin1.idWord][0].text).toEqual('updated test annotation')

    // let's update the type and text of this annotation
    result = textsC.addAnnotation({
      id: annotationId,
      token: tokenOrigin1,
      type: 'LEMMAID',
      text: 'updated2 test annotation'
    })

    expect(result).toBeTruthy()

    expect(Object.keys(alignment.annotations)).toEqual([tokenOrigin1.idWord])
    expect(alignment.annotations[tokenOrigin1.idWord].length).toEqual(1)

    expect(alignment.annotations[tokenOrigin1.idWord][0].type).toEqual('LEMMAID')
    expect(alignment.annotations[tokenOrigin1.idWord][0].text).toEqual('updated2 test annotation')
  })

  it('19 TextsController - getAnnotations - returns all annotation attached to token', () => {
    const textsC = new TextsController(appC.store)
    const alignment = Alignment.convertFromJSON(LatEng)
    textsC.alignment = alignment

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    expect(textsC.getAnnotations(tokenOrigin1).length).toEqual(0)

    // let's add the first annotation
    textsC.addAnnotation({
      token: tokenOrigin1,
      type: 'COMMENT',
      text: 'test annotation'
    })

    expect(textsC.getAnnotations(tokenOrigin1).length).toEqual(1)

    // let's add the second annotation
    textsC.addAnnotation({
      token: tokenOrigin1,
      type: 'LEMMAID',
      text: '2 test annotation'
    })

    expect(textsC.getAnnotations(tokenOrigin1).length).toEqual(2)

    // let's update the first annotation
    const annotationId = alignment.annotations[tokenOrigin1.idWord][0].id
    textsC.addAnnotation({
      id: annotationId,
      token: tokenOrigin1,
      type: 'COMMENT',
      text: '3 test annotation'
    })

    expect(textsC.getAnnotations(tokenOrigin1).length).toEqual(2)
  })

  it('20 TextsController - removeAnnotation - removes annotation by id', () => {
    const textsC = new TextsController(appC.store)
    const alignment = Alignment.convertFromJSON(LatEng)
    textsC.alignment = alignment

    const tokenOrigin1 = alignment.origin.alignedText.segments[0].tokens[0]
    expect(textsC.getAnnotations(tokenOrigin1).length).toEqual(0)

    // let's add an annotation
    textsC.addAnnotation({
      token: tokenOrigin1,
      type: 'COMMENT',
      text: 'test annotation'
    })

    expect(textsC.getAnnotations(tokenOrigin1).length).toEqual(1)

    const annotationId = alignment.annotations[tokenOrigin1.idWord][0].id

    // let's remove this annotation
    let result = textsC.removeAnnotation(tokenOrigin1, annotationId)
    expect(result).toBeTruthy()

    expect(textsC.getAnnotations(tokenOrigin1).length).toEqual(0)

    // let's again add an annotation
    textsC.addAnnotation({
      token: tokenOrigin1,
      type: 'COMMENT',
      text: '2test annotation'
    })
    expect(textsC.getAnnotations(tokenOrigin1).length).toEqual(1)

    // let's try to remove annotation without token parameter
    result = textsC.removeAnnotation(null, annotationId)
    expect(result).toBeFalsy()
    expect(textsC.getAnnotations(tokenOrigin1).length).toEqual(1)

    // let's try to remove annotation without id parameter
    result = textsC.removeAnnotation(null, annotationId)
    expect(result).toBeFalsy()
    expect(textsC.getAnnotations(tokenOrigin1).length).toEqual(1)
  })

  it('21 TextsController - checkSize - checks if texts are less then the setting only if IndexedDB support is turned off', () => {
    const textsC = new TextsController(appC.store)
    const alignment = Alignment.convertFromJSON(LatEng)
    textsC.alignment = alignment

    // indexedDB is turned on - all checks would be truthy
    expect(SettingsController.addIndexedDBSupport).toBeTruthy()

    expect(SettingsController.maxCharactersPerTextValue).toEqual(5000)
    expect(alignment.origin.docSource.text.length).toEqual(38)

    expect(Object.values(alignment.targets)[0].docSource.text.length).toEqual(39)

    expect(textsC.checkSize()).toBeTruthy()

    SettingsController.allOptions.app.items.maxCharactersPerText.setValue(30)

    expect(textsC.checkSize()).toBeTruthy()

    // let's turn off indexedDB support
    SettingsController.allOptions.app.items.addIndexedDBSupport.setValue(false)

    // check for maxCharacters = 30, text = 38
    expect(textsC.checkSize()).toBeFalsy()

    SettingsController.allOptions.app.items.maxCharactersPerText.setValue(50)
    expect(textsC.checkSize()).toBeTruthy()
  })

  it('22 TextsController - addNewTarget - adds new empty target', async () => {
    const textsC = new TextsController(appC.store)
    const alignment = Alignment.convertFromJSON(LatEng)
    const resTargetId1 = await textsC.addNewTarget()
    expect(resTargetId1).not.toBeDefined()

    textsC.alignment = alignment

    expect(Object.values(alignment.targets).length).toEqual(1)

    const resTargetId2 = await textsC.addNewTarget()
    expect(Object.values(alignment.targets).length).toEqual(2)
    expect(Object.keys(alignment.targets)[1]).toEqual(resTargetId2)
  })

  it('23 TextsController - originDocSourceHasText', async () => {
    const textsC = new TextsController(appC.store)
    const alignment = Alignment.convertFromJSON(LatEng)

    textsC.alignment = alignment

    expect(alignment.origin.docSource.text.length).toEqual(38)
    expect(textsC.originDocSourceHasText).toBeTruthy()

    textsC.updateOriginDocSource({ text: '' })

    expect(alignment.origin.docSource.text.length).toEqual(0)
    expect(textsC.originDocSourceHasText).toBeFalsy()
  })

  it('24 TextsController - allTargetTextsIdsNumbered', async () => {
    const textsC = new TextsController(appC.store)
    const alignment = Alignment.convertFromJSON(LatEng)

    textsC.alignment = alignment

    textsC.updateTargetDocSource({ text: 'Some test target 2' })

    const resTargets = textsC.allTargetTextsIdsNumbered

    expect(resTargets[0]).toEqual({ targetId: Object.keys(alignment.targets)[1], targetIndex: 1 })
    expect(resTargets[1]).toEqual({ targetId: Object.keys(alignment.targets)[0], targetIndex: 0 })
  })

  it('24 TextsController - getDocSource', async () => {
    const textsC = new TextsController(appC.store)
    const alignment = Alignment.convertFromJSON(LatEng)

    textsC.alignment = alignment

    textsC.updateTargetDocSource({ text: 'Some test target 2' })

    expect(textsC.getDocSource()).toBeNull()
    expect(textsC.getDocSource('origin')).toEqual(alignment.origin.docSource)
    expect(textsC.getDocSource('target', Object.keys(alignment.targets)[0])).toEqual(Object.values(alignment.targets)[0].docSource)
    expect(textsC.getDocSource('target', Object.keys(alignment.targets)[1])).toEqual(Object.values(alignment.targets)[1].docSource)
  })

  it('25 TextsController - checkUploadedFileByExtension', async () => {
    const textsC = new TextsController(appC.store)
    const alignment = Alignment.convertFromJSON(LatEng)

    textsC.alignment = alignment

    // check that jpg is not a good extension for any upload type
    expect(textsC.checkUploadedFileByExtension('jpg', true)).toBeFalsy()
    expect(textsC.checkUploadedFileByExtension('jpg', false)).toBeFalsy()

    // check that txt is a good extension only for a single text upload
    expect(textsC.checkUploadedFileByExtension('txt', true)).toBeFalsy()
    expect(textsC.checkUploadedFileByExtension('txt', false)).toBeTruthy()

    // check that json is a good extension only for a single text upload
    expect(textsC.checkUploadedFileByExtension('json', true)).toBeTruthy()
    expect(textsC.checkUploadedFileByExtension('json', false)).toBeFalsy()
  })

  it.skip('26 TextsController - checkUploadedFileByExtension', async () => {
    window.indexedDB = IndexedDB
    window.IDBKeyRange = IDBKeyRange
    
    const textsC = new TextsController(appC.store)
    StorageController.select = jest.fn()
    
    const res = await textsC.uploadDataFromDB(true)
    console.info('res - ', res)
    expect(StorageController.select).toHaveBeenCalledWith(true, 'alignmentByAlIDQuery')
  })
})
