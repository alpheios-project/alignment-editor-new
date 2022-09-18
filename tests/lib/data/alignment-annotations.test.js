/* eslint-env jest */
/* eslint-disable no-unused-vars */
import Alignment from '@/lib/data/alignment'
import AppController from '@/lib/controllers/app-controller.js'
import SourceText from '@/lib/data/source-text'
import Annotation from '@/lib/data/annotation'
import AlignedText from '@/lib/data/aligned-text'
import AlignmentGroup from '@/lib/data/alignment-group'
import Segment from '@/lib/data/segment'

import AlignmentHistory from '@/lib/data/history/alignment-history'

describe('alignment-annotations.test.js', () => {
  // console.error = function () {}
  console.log = function () {}
  console.warn = function () {}
  
  beforeAll(async () => {
    const appC = new AppController({
      appId:'alpheios-alignment-editor'
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

  const checkAnnotation = (alignment, idWord, text) => {
    return alignment.annotations[idWord] && alignment.annotations[idWord].some(annot => annot.token.idWord === idWord && annot.text === text)
  }

  it('1 Alignment Annotations - update annotations links on merge tokens', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    
    // add before editing
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.COMMENT, text: 'test annotation 1' })
    alignment.addAnnotation({ token: originToken2, type: Annotation.types.COMMENT, text: 'test annotation 2' })

    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 1')).toBeTruthy()
    expect(checkAnnotation(alignment, '1-0-1', 'test annotation 2')).toBeTruthy()

    alignment.mergeToken(originToken1, 'next')

    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 1')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-1', 'test annotation 2')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-1-m-1', 'test annotation 1')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-1-m-1', 'test annotation 2')).toBeFalsy()

    // add after editing
    alignment.addAnnotation({ token: allSegments[0].origin.tokens[0], type: Annotation.types.COMMENT, text: 'test annotation 3' })

    expect(checkAnnotation(alignment, '1-0-1-m-1', 'test annotation 3')).toBeTruthy()

    alignment.undoTokensEditStep()

    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 1')).toBeTruthy()
    expect(checkAnnotation(alignment, '1-0-1', 'test annotation 2')).toBeTruthy()
    
    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 3')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-1', 'test annotation 3')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-1-m-1', 'test annotation 1')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-1-m-1', 'test annotation 2')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-1-m-1', 'test annotation 3')).toBeFalsy()

    alignment.redoTokensEditStep()

    expect(checkAnnotation(alignment, '1-0-1-m-1', 'test annotation 1')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-1-m-1', 'test annotation 2')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-1-m-1', 'test annotation 3')).toBeTruthy()


    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 1')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-1', 'test annotation 2')).toBeFalsy()

  })

  it('2 Alignment Annotations - update annotations links on update token', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]
    
    // add annotation before editing
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.COMMENT, text: 'test annotation 1' })
    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 1')).toBeTruthy()
    
    alignment.updateTokenWord(originToken1, 'soome')
    expect(checkAnnotation(alignment, '1-0-0-e-1', 'test annotation 1')).toBeTruthy()
    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 1')).toBeFalsy()

    // add annotation after editing
    alignment.addAnnotation({ token: allSegments[0].origin.tokens[0], type: Annotation.types.COMMENT, text: 'test annotation 2' })
    expect(checkAnnotation(alignment, '1-0-0-e-1', 'test annotation 2')).toBeTruthy()

    alignment.undoTokensEditStep()

    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 1')).toBeTruthy()
    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 2')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-0-e-1', 'test annotation 2')).toBeFalsy()

    alignment.redoTokensEditStep()

    expect(checkAnnotation(alignment, '1-0-0-e-1', 'test annotation 1')).toBeTruthy()
    expect(checkAnnotation(alignment, '1-0-0-e-1', 'test annotation 2')).toBeTruthy()
    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 1')).toBeFalsy()
  })

  it('3 Alignment Annotations - update annotations links on addLineBreakAfterToken', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    
    // add annotation before editing
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.COMMENT, text: 'test annotation 1' })
    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 1')).toBeTruthy()
    
    alignment.addLineBreakAfterToken(originToken1)

    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 1')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-0-al-1', 'test annotation 1')).toBeTruthy()

    // add annotation after editing
    alignment.addAnnotation({ token: allSegments[0].origin.tokens[0], type: Annotation.types.COMMENT, text: 'test annotation 2' })

    expect(checkAnnotation(alignment, '1-0-0-al-1', 'test annotation 2')).toBeTruthy()

    alignment.undoTokensEditStep()

    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 1')).toBeTruthy()
    expect(checkAnnotation(alignment, '1-0-0-al-1', 'test annotation 1')).toBeFalsy()

    expect(checkAnnotation(alignment, '1-0-0-al-1', 'test annotation 2')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 2')).toBeFalsy()

    alignment.redoTokensEditStep()

    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 1')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-0-al-1', 'test annotation 1')).toBeTruthy()
    expect(checkAnnotation(alignment, '1-0-0-al-1', 'test annotation 2')).toBeTruthy()

  })

  it('4 Alignment Annotations - update annotations links on moveToSegment', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[2]
    
    // add annotation before editing
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.COMMENT, text: 'test annotation 1' })
    
    expect(checkAnnotation(alignment, '1-0-2', 'test annotation 1')).toBeTruthy()
    
    alignment.moveToSegment(originToken1, 'next')

    // add annotation after editing
    alignment.addAnnotation({ token: allSegments[1].origin.tokens[0], type: Annotation.types.COMMENT, text: 'test annotation 2' })

    expect(checkAnnotation(alignment, '1-0-2', 'test annotation 1')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-2-ns-1', 'test annotation 1')).toBeTruthy()
    expect(checkAnnotation(alignment, '1-0-2-ns-1', 'test annotation 2')).toBeTruthy()

    alignment.undoTokensEditStep()

    expect(checkAnnotation(alignment, '1-0-2', 'test annotation 1')).toBeTruthy()
    expect(checkAnnotation(alignment, '1-0-2-ns-1', 'test annotation 1')).toBeFalsy()
    
    expect(checkAnnotation(alignment, '1-0-2-ns-1', 'test annotation 2')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-2', 'test annotation 2')).toBeFalsy()

    alignment.redoTokensEditStep()

    expect(checkAnnotation(alignment, '1-0-2', 'test annotation 1')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-2-ns-1', 'test annotation 1')).toBeTruthy()
    expect(checkAnnotation(alignment, '1-0-2-ns-1', 'test annotation 2')).toBeTruthy()

  })

  it('5 Alignment Annotations - update annotations links on split', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]
    
    // add annotation before editing
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.COMMENT, text: 'test annotation 1' })
    
    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 1')).toBeTruthy()

    alignment.splitToken(originToken1, 'so me')

    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 1')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-0-s1-1', 'test annotation 1')).toBeFalsy()

    // add annotation after editing
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.COMMENT, text: 'test annotation 2' })
    expect(checkAnnotation(alignment, '1-0-0-s1-1', 'test annotation 2')).toBeTruthy()

    alignment.undoTokensEditStep()

    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 1')).toBeTruthy()

    expect(checkAnnotation(alignment, '1-0-0-s1-1', 'test annotation 1')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-0-s1-1', 'test annotation 2')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 2')).toBeFalsy()

    alignment.redoTokensEditStep()

    expect(checkAnnotation(alignment, '1-0-0', 'test annotation 1')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-0-s1-1', 'test annotation 1')).toBeFalsy()
    expect(checkAnnotation(alignment, '1-0-0-s1-1', 'test annotation 2')).toBeTruthy()
  })
 

  it('6 Alignment Annotations - update annotations links on delete', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]
    
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.COMMENT, text: 'test annotation 1' })
    
    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-0' ])

    alignment.deleteToken(originToken1)

    expect(Object.keys(alignment.annotations)).toEqual([])

    alignment.undoTokensEditStep()

    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-0' ])
    expect(alignment.annotations[ '1-0-0' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-0' }),
        text: 'test annotation 1'
      })
    ]))

    alignment.redoTokensEditStep()

    expect(Object.keys(alignment.annotations)).toEqual([])
  })

  it('7 Alignment Annotations - addAnnotation adds a new annotation', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: 'simpleLocalTokenizer', divideToSegments: true }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]

    alignment.addAnnotation({ token: originToken1, type: Annotation.types.COMMENT, text: 'test annotation 1' })
    // first annotation - COMMENT-1
    const resultedAnnot1 = alignment.annotations['1-0-0'][0]
    expect(resultedAnnot1).toBeInstanceOf(Annotation)
    expect(resultedAnnot1.token).toEqual(originToken1)
    expect(resultedAnnot1.type).toEqual(Annotation.types.COMMENT)
    expect(resultedAnnot1.text).toEqual('test annotation 1')
    expect(resultedAnnot1.index).toEqual('1-0-0-1')

    // second annotation - COMMENT-2
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.COMMENT, text: 'test annotation 2' })
    const resultedAnnot2 = alignment.annotations['1-0-0'][1]
    expect(resultedAnnot2).toBeInstanceOf(Annotation)
    expect(resultedAnnot2.token).toEqual(originToken1)
    expect(resultedAnnot2.type).toEqual(Annotation.types.COMMENT)
    expect(resultedAnnot2.text).toEqual('test annotation 2')
    expect(resultedAnnot2.index).toEqual('1-0-0-2')

    // third annotation - LEMMAID-1
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.LEMMAID, text: 'test annotation 3' })
    const resultedAnnot3 = alignment.annotations['1-0-0'][2]
    expect(resultedAnnot3).toBeInstanceOf(Annotation)
    expect(resultedAnnot3.token).toEqual(originToken1)
    expect(resultedAnnot3.type).toEqual(Annotation.types.LEMMAID)
    expect(resultedAnnot3.text).toEqual('test annotation 3')
    expect(resultedAnnot3.index).toEqual('1-0-0-1')

    // fourth annotation - LEMMAID-2
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.LEMMAID, text: 'test annotation 4' })
    const resultedAnnot4 = alignment.annotations['1-0-0'][3]
    expect(resultedAnnot4).toBeInstanceOf(Annotation)
    expect(resultedAnnot4.token).toEqual(originToken1)
    expect(resultedAnnot4.type).toEqual(Annotation.types.LEMMAID)
    expect(resultedAnnot4.text).toEqual('test annotation 4')
    expect(resultedAnnot4.index).toEqual('1-0-0-2')

    // remove third annotation - LEMMAID-1
    alignment.removeAnnotation(originToken1, resultedAnnot3.id)

    expect(alignment.annotations['1-0-0'].length).toEqual(3)
    expect(alignment.annotations['1-0-0'][2]).toEqual(resultedAnnot4)
    
    // annotation index for LEMMAID anyway would be increased - because max is 2
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.LEMMAID, text: 'test annotation 5' })
    const resultedAnnot5 = alignment.annotations['1-0-0'][3]
    expect(resultedAnnot5).toBeInstanceOf(Annotation)
    expect(resultedAnnot5.token).toEqual(originToken1)
    expect(resultedAnnot5.type).toEqual(Annotation.types.LEMMAID)
    expect(resultedAnnot5.text).toEqual('test annotation 5')
    expect(resultedAnnot5.index).toEqual('1-0-0-3')

    // remove third annotation - COMMENT-2
    alignment.removeAnnotation(originToken1, resultedAnnot2.id)

    expect(alignment.annotations['1-0-0'].length).toEqual(3)

    // annotation index for COMMENT would not be increased - because max is 1
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.COMMENT, text: 'test annotation 6' })

    const resultedAnnot6 = alignment.annotations['1-0-0'][3]
    expect(resultedAnnot6).toBeInstanceOf(Annotation)
    expect(resultedAnnot6.token).toEqual(originToken1)
    expect(resultedAnnot6.type).toEqual(Annotation.types.COMMENT)
    expect(resultedAnnot6.text).toEqual('test annotation 6')
    expect(resultedAnnot6.index).toEqual('1-0-0-2')
  })

})
