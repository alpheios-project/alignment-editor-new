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

describe('alignment-history-cases.test.js', () => {
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

  it('1 Alignment Annotations - update annotations links on merge tokens', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.COMMENT, text: 'test annotation 1' })
    alignment.addAnnotation({ token: originToken2, type: Annotation.types.COMMENT, text: 'test annotation 2' })

    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-0', '1-0-1' ])

    alignment.mergeToken(originToken1, 'next')
    alignment.addAnnotation({ token: allSegments[0].origin.tokens[0], type: Annotation.types.COMMENT, text: 'test annotation 3' })

    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-1-m-1' ])
    expect(alignment.annotations[ '1-0-1-m-1' ].length).toEqual(3)

    expect(alignment.annotations[ '1-0-1-m-1' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-1-m-1' }),
        text: 'test annotation 1'
      }),
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-1-m-1' }),
        text: 'test annotation 2'
      }),
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-1-m-1' }),
        text: 'test annotation 3'
      })
    ]))

    alignment.undoTokensEditStep()

    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-0', '1-0-1' ])

    expect(alignment.annotations[ '1-0-0' ].length).toEqual(1)
    expect(alignment.annotations[ '1-0-1' ].length).toEqual(2)

    expect(alignment.annotations[ '1-0-0' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-0' }),
        text: 'test annotation 1'
      })
    ])
    )

    expect(alignment.annotations[ '1-0-1' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-1' }),
        text: 'test annotation 2'
      }),
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-1' }),
        text: 'test annotation 3'
      })
    ])
    )

    alignment.redoTokensEditStep()

    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-1-m-1' ])
    expect(alignment.annotations[ '1-0-1-m-1' ].length).toEqual(3)

    expect(alignment.annotations[ '1-0-1-m-1' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-1-m-1' }),
        text: 'test annotation 1'
      }),
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-1-m-1' }),
        text: 'test annotation 2'
      }),
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-1-m-1' }),
        text: 'test annotation 3'
      })
    ]))
  })

  it('2 Alignment Annotations - update annotations links on update token', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.COMMENT, text: 'test annotation 1' })
    
    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-0' ])
    
    alignment.updateTokenWord(originToken1, 'soome')

    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-0-e-1' ])
    expect(alignment.annotations[ '1-0-0-e-1' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-0-e-1' }),
        text: 'test annotation 1'
      })
    ]))

    alignment.undoTokensEditStep()

    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-0' ])
    expect(alignment.annotations[ '1-0-0' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-0' }),
        text: 'test annotation 1'
      })
    ]))

    alignment.redoTokensEditStep()

    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-0-e-1' ])
    expect(alignment.annotations[ '1-0-0-e-1' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-0-e-1' }),
        text: 'test annotation 1'
      })
    ]))

  })

  it('3 Alignment Annotations - update annotations links on addLineBreakAfterToken', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]
    const originToken2 = allSegments[0].origin.tokens[1]
    
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.COMMENT, text: 'test annotation 1' })
    
    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-0' ])
    
    alignment.addLineBreakAfterToken(originToken1)

    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-0-al-1' ])
    expect(alignment.annotations[ '1-0-0-al-1' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-0-al-1' }),
        text: 'test annotation 1'
      })
    ]))

    alignment.undoTokensEditStep()

    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-0' ])
    expect(alignment.annotations[ '1-0-0' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-0' }),
        text: 'test annotation 1'
      })
    ]))

    alignment.redoTokensEditStep()

    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-0-al-1' ])
    expect(alignment.annotations[ '1-0-0-al-1' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-0-al-1' }),
        text: 'test annotation 1'
      })
    ]))

  })

  it('4 Alignment Annotations - update annotations links on moveToSegment', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[2]
    
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.COMMENT, text: 'test annotation 1' })
    
    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-2' ])
    
    alignment.moveToSegment(originToken1, 'next')

    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-2-ns-1' ])
    expect(alignment.annotations[ '1-0-2-ns-1' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-2-ns-1' }),
        text: 'test annotation 1'
      })
    ]))

    alignment.undoTokensEditStep()

    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-2' ])
    expect(alignment.annotations[ '1-0-2' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-2' }),
        text: 'test annotation 1'
      })
    ]))

    alignment.redoTokensEditStep()

    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-2-ns-1' ])
    expect(alignment.annotations[ '1-0-2-ns-1' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-2-ns-1' }),
        text: 'test annotation 1'
      })
    ]))

  })

  it('5 Alignment Annotations - update annotations links on split', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    let alignment = new Alignment()
    alignment.updateOriginDocSource(originDocSource)
    alignment.updateTargetDocSource(targetDocSource1)

    await alignment.createAlignedTexts('simpleLocalTokenizer')
    const allSegments = alignment.allAlignedTextsSegments
    const originToken1 = allSegments[0].origin.tokens[0]
    
    alignment.addAnnotation({ token: originToken1, type: Annotation.types.COMMENT, text: 'test annotation 1' })
    
    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-0' ])

    alignment.splitToken(originToken1, 'so me')

    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-0-s1-1' ])
    expect(alignment.annotations[ '1-0-0-s1-1' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-0-s1-1' }),
        text: 'test annotation 1'
      })
    ]))

    alignment.undoTokensEditStep()

    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-0' ])
    expect(alignment.annotations[ '1-0-0' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-0' }),
        text: 'test annotation 1'
      })
    ]))

    alignment.redoTokensEditStep()
    expect(Object.keys(alignment.annotations)).toEqual([ '1-0-0-s1-1' ])
    expect(alignment.annotations[ '1-0-0-s1-1' ]).toEqual(expect.arrayContaining([
      expect.objectContaining({
        token: expect.objectContaining( { idWord: '1-0-0-s1-1' }),
        text: 'test annotation 1'
      })
    ]))
  })
 

  it('6 Alignment Annotations - update annotations links on delete', async () => {
    const originDocSource = new SourceText('origin', {
      text: 'some origin text\u2028for origin test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })

    const targetDocSource1 = new SourceText('target', {
      text: 'some target1 text\u2028for target1 test', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
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
})
