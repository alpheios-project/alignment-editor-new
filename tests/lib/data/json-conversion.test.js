/* eslint-env jest */
/* eslint-disable no-unused-vars */
import AppController from '@/lib/controllers/app-controller.js'
import TokenizeController from '@/lib/controllers/tokenize-controller.js'
import Alignment from '@/lib/data/alignment'
import Token from '@/lib/data/token'
import Annotation from '@/lib/data/annotation'
import Segment from '@/lib/data/segment'
import SourceText from '@/lib/data/source-text'
import AlignedText from '@/lib/data/aligned-text'

import SimpleLocalTokenizer from '@/lib/tokenizers/simple-local-tokenizer.js'


describe('alignment.test.js', () => {
  console.error = function () {}
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

  it('1 JSON Conversion - token to/from json', async () => {
    const sourceToken = new Token({
      textType: 'origin',
      idWord: '1-0-0',
      word: 'test',
      sentenceIndex: 1,
      tokenIndex: 1,
      partNum: 1
    }, 1, 'originid')

    expect(sourceToken).toEqual(expect.any(Token))

    const tokenJson = sourceToken.convertToJSON()
    expect(tokenJson).toEqual(expect.objectContaining({
      textType: 'origin',
      idWord: '1-0-0',
      word: 'test',
      sentenceIndex: 1,
      tokenIndex: 1,
      segmentIndex: 1,
      docSourceId: 'originid'
    }))

    const tokenUploaded = Token.convertFromJSON(tokenJson)

    expect(tokenUploaded).toEqual(expect.any(Token))
    expect(tokenUploaded).toEqual(expect.objectContaining({
      textType: sourceToken.textType,
      idWord: sourceToken.idWord,
      word: sourceToken.word,
      sentenceIndex: sourceToken.sentenceIndex,
      tokenIndex: sourceToken.tokenIndex,
      segmentIndex: sourceToken.segmentIndex,
      docSourceId: sourceToken.docSourceId
    }))
  })

  it('2 JSON Conversion - annotation to/from json', async () => {
    const sourceToken = new Token({
      textType: 'origin',
      idWord: '1-0-0',
      word: 'test',
      sentenceIndex: 1,
      tokenIndex: 1,
      partNum: 1
    }, 1, 'originid')

    const annotation = new Annotation({
      token: sourceToken, 
      type: 'COMMENT', 
      text: 'Test annotation'
    })

    const annotationJSON = annotation.convertToJSON()

    expect(annotationJSON).toEqual(expect.objectContaining({
      type: 'COMMENT', 
      text: 'Test annotation',
      tokenData: {
        textType: sourceToken.textType,
        idWord: sourceToken.idWord,
        segmentIndex: sourceToken.segmentIndex,
        docSourceId: sourceToken.docSourceId
      }
    }))

    const annotationUploaded = Annotation.convertFromJSON(annotationJSON, sourceToken)

    expect(annotationUploaded).toEqual(annotation)
  })

  it('3 JSON Conversion - segment to/from json', async () => {
    const sourceText = new SourceText('origin', {
      text: 'Some test. Segment text.'
    })
    const result = SimpleLocalTokenizer.tokenize(sourceText, 'test')

    const segment = new Segment({
      index: result.segments[0].index,
      tokens: result.segments[0].tokens,
      textType: sourceText.textType,
      lang: sourceText.lang,
      direction: sourceText.direction,
      docSourceId: sourceText.id
    })
   
    const segmentJSON = segment.convertToJSON()
    expect(segmentJSON).toEqual(expect.objectContaining({
      index: segment.index,
      textType: segment.textType,
      lang: segment.lang,
      direction: segment.direction,
      docSourceId: segment.docSourceId,
      tokens: expect.any(Array)
    }))

    expect(segmentJSON.tokens.length).toEqual(4)
    expect(segmentJSON.tokens.map(token => token.idWord)).toEqual([ 'test-0-0', 'test-0-1', 'test-0-2', 'test-0-3' ])

    const segmentUploaded = Segment.convertFromJSON(segmentJSON)
    expect(segmentUploaded.tokens).toEqual(segment.tokens)
    expect(segmentUploaded).toEqual(expect.objectContaining({
      index: segment.index,
      textType: segment.textType,
      lang: segment.lang,
      direction: segment.direction,
      docSourceId: segment.docSourceId
    }))
  })

  it('4 JSON Conversion - alignedText to/from json', async () => {
    const sourceText = new SourceText('origin', {
      text: 'Some test. Segment text.',
      tokenization: {
        tokenizer: 'simpleLocalTokenizer'
      }
    })

    const alignedText = new AlignedText({
      docSource: sourceText,
      tokenPrefix: 'test'
    })

    await alignedText.tokenize(sourceText)
    
    const alignedTextJSON = alignedText.convertToJSON()

    expect(alignedTextJSON).toEqual(expect.objectContaining({
      textType: alignedText.textType,
      textId: alignedText.id,
      direction: alignedText.direction,
      lang: alignedText.lang,
      sourceType: alignedText.sourceType,
      tokenPrefix: alignedText.tokenPrefix,
      tokenization: alignedText.tokenization,
      segments: expect.any(Array)
    }))

    expect(alignedTextJSON.segments.length).toEqual(alignedText.segments.length)
    
    const alignedTextUploaded = AlignedText.convertFromJSON(alignedTextJSON)

    expect(alignedTextUploaded).toEqual(expect.objectContaining({
      textType: alignedText.textType,
      id: alignedText.id,
      direction: alignedText.direction,
      lang: alignedText.lang,
      sourceType: alignedText.sourceType,
      tokenPrefix: alignedText.tokenPrefix,
      tokenization: alignedText.tokenization,
      segments: expect.any(Array)
    }))

    expect(alignedTextUploaded.segments.length).toEqual(alignedText.segments.length)
  })

  it('4 JSON Conversion - sourceText to/from json', async () => {
    const sourceText = new SourceText('origin', {
      text: 'Some test. Segment text.',
      tokenization: {
        tokenizer: 'simpleLocalTokenizer'
      }
    })

    const sourceTextJSON = sourceText.convertToJSON()

    expect(sourceTextJSON).toEqual(expect.objectContaining({
      textType: sourceText.textType,
      text: sourceText.text,
      lang: sourceText.lang,
      direction: sourceText.direction,
      sourceType: sourceText.sourceType
    }))

    const sourceTextUploaded = SourceText.convertFromJSON('origin', sourceTextJSON)

    expect(sourceTextUploaded).toEqual(expect.objectContaining({
      textType: sourceText.textType,
      text: sourceText.text,
      lang: sourceText.lang,
      direction: sourceText.direction,
      sourceType: sourceText.sourceType
    }))
  })
})