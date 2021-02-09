/* eslint-env jest */
/* eslint-disable no-unused-vars */

import TokensEditActions from '@/lib/data/actions/tokens-edit-actions.js'
import TokensEditHistory from '@/lib/data/history/tokens-edit-history.js'

import AppController from '@/lib/controllers/app-controller.js'
import AlignedText from '@/lib/data/aligned-text'
import SourceText from '@/lib/data/source-text'
import HistoryStep from '@/lib/data/history/history-step.js'

describe('tokens-edit-actions.test.js', () => {
  console.error = function () { }
  console.log = function () { }
  console.warn = function () { }

  const prepareParams = async () => {
    const sourceText1 = new SourceText('origin', {
      text: 'vir femina a\u2028vir\u2028femina vir', direction: 'ltr', lang: 'lat', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
    
    const alignedText1 = new AlignedText({
      docSource: sourceText1, 
      tokenPrefix: '1'
    })
  
    await alignedText1.tokenize(sourceText1)
  
    const sourceText2 = new SourceText('target', {
      text: 'male female\u2028male female\u2028male female', direction: 'ltr', lang: 'eng', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
     
    const alignedText2 = new AlignedText({
      docSource: sourceText2, 
      tokenPrefix: '2'
    })
    
    await alignedText2.tokenize(sourceText2)
  
    const sourceText3 = new SourceText('target', {
      text: 'macho femenino\u2028macho femenino\u2028macho femenino', direction: 'ltr', lang: 'spa', sourceType: 'text', tokenization: { tokenizer: "simpleLocalTokenizer" }
    })
        
    const alignedText3 = new AlignedText({
      docSource: sourceText3, 
      tokenPrefix: '3'
    })
      
    await alignedText3.tokenize(sourceText3)
  
    const origin = {
      alignedText: alignedText1
    }
  
    const targets = {
      [ alignedText2.id ]: { alignedText: alignedText2 },
      [ alignedText3.id ]: { alignedText: alignedText3 }
    }

    return {
      origin,
      targets,
      tokensEditHistory: new TokensEditHistory()
    }
  }

  beforeAll(() => {
    const appC = new AppController({
      appidWord: 'alpheios-alignment-editor'
    })
    appC.defineStore()
    appC.defineL10Support()
    appC.defineNotificationSupport(appC.store)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error')
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
  })

  it('1 TokensEditActions - constructor inits origin, target, tokensEditHistory', async () => {
    const params = await prepareParams()
    const tokensEditActions = new TokensEditActions(params)

    expect(tokensEditActions.origin).toEqual(params.origin)
    expect(tokensEditActions.targets).toEqual(params.targets)
    expect(tokensEditActions.tokensEditHistory).toEqual(expect.any(TokensEditHistory))
  })

  it('2 TokensEditActions - getAlignedTextByToken returns alignedText by token', async () => {
    const params = await prepareParams()
    const tokensEditActions = new TokensEditActions(params)

    const token = params.origin.alignedText.segments[0].tokens[0] // vir
    const alignedText = tokensEditActions.getAlignedTextByToken(token)
    
    expect(alignedText).toEqual(params.origin.alignedText)
  })

  it('3 TokensEditActions - getSegmentByToken returns segment by token - current, prev, next', async () => {
    const params = await prepareParams()

    const tokensEditActions = new TokensEditActions(params)

    const token1 = params.origin.alignedText.segments[0].tokens[0] // vir

    const segmentCurrent1 = tokensEditActions.getSegmentByToken(token1)
    expect(segmentCurrent1).toEqual(params.origin.alignedText.segments[0])

    const segmentNext = tokensEditActions.getSegmentByToken(token1, 'next')
    expect(segmentNext).toEqual(params.origin.alignedText.segments[1])

    const token2 = params.origin.alignedText.segments[1].tokens[0] // vir

    const segmentCurrent2 = tokensEditActions.getSegmentByToken(token2, 'current')
    expect(segmentCurrent2).toEqual(params.origin.alignedText.segments[1])

    const segmentPrevious = tokensEditActions.getSegmentByToken(token2, 'prev')
    expect(segmentPrevious).toEqual(params.origin.alignedText.segments[0])


    const segmentFake = tokensEditActions.getSegmentByToken(token2, 'fake')
    expect(segmentFake).toBeNull()
  })

  it('4 TokensEditActions - getNextPrevToken returns several results - segment, tokenResult, position, tokenIndex - for merge', async () => {
    const params = await prepareParams()

    const tokensEditActions = new TokensEditActions(params)
    const token1 = params.origin.alignedText.segments[0].tokens[1] // femina

    const results1 = tokensEditActions.getNextPrevToken(token1, 'prev')

    expect(results1.segment).toEqual(params.origin.alignedText.segments[0])
    expect(results1.tokenIndex).toEqual(1)
    expect(results1.position).toEqual('next')
    expect(results1.tokenResult).toEqual(params.origin.alignedText.segments[0].tokens[0])

    const token2 = params.origin.alignedText.segments[0].tokens[0] // vir
    const results2 = tokensEditActions.getNextPrevToken(token2, 'next')

    expect(results2.segment).toEqual(params.origin.alignedText.segments[0])
    expect(results2.tokenIndex).toEqual(0)
    expect(results2.position).toEqual('prev')
    expect(results2.tokenResult).toEqual(params.origin.alignedText.segments[0].tokens[1])

  })

  it('5 TokensEditActions - updateTokenWord updates token\'s word and adds step to history', async () => {
    const params = await prepareParams()

    const tokensEditActions = new TokensEditActions(params)
    const token = params.origin.alignedText.segments[0].tokens[1] // femina

    expect(token.word).toEqual('femina')
    expect(tokensEditActions.tokensEditHistory.steps.length).toEqual(0)

    tokensEditActions.updateTokenWord(token, 'fem')

    expect(token.word).toEqual('fem')
    expect(tokensEditActions.tokensEditHistory.steps[0].params.wasIdWord).toEqual('1-0-1')
    expect(tokensEditActions.tokensEditHistory.steps[0].params.newIdWord).toEqual('1-0-1-e-1')
    expect(tokensEditActions.tokensEditHistory.steps[0].token).toEqual(token)
    expect(tokensEditActions.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.UPDATE)
  })

  it('6 TokensEditActions - mergeToken merges with another token by direction - to next', async () => {
    const params = await prepareParams()

    const tokensEditActions = new TokensEditActions(params)
    const token = params.origin.alignedText.segments[0].tokens[0] // [0] vir [1] femina
    const nextToken = params.origin.alignedText.segments[0].tokens[1]

    expect(token.idWord).toEqual('1-0-0')
    expect(token.word).toEqual('vir')

    expect(nextToken.idWord).toEqual('1-0-1')
    expect(nextToken.word).toEqual('femina')

    expect(tokensEditActions.tokensEditHistory.steps.length).toEqual(0)

    tokensEditActions.mergeToken(token, 'next')

    expect(params.origin.alignedText.segments[0].tokens.length).toEqual(2)
    expect(nextToken.word).toEqual('vir femina')
    expect(tokensEditActions.tokensEditHistory.steps[0].params.wasIdWord).toEqual('1-0-1') // result nextToken, the first token was merged to the next
    expect(tokensEditActions.tokensEditHistory.steps[0].params.newIdWord).toEqual('1-0-1-m-1')
    expect(tokensEditActions.tokensEditHistory.steps[0].params.mergedToken).toEqual(token)
    expect(tokensEditActions.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.MERGE)
  })

  it('7 TokensEditActions - mergeToken merges with another token by direction - to prev', async () => {
    const params = await prepareParams()

    const tokensEditActions = new TokensEditActions(params)

    const token = Object.values(params.targets)[0].alignedText.segments[0].tokens[1] // [0] male [1] female

    const prevToken = Object.values(params.targets)[0].alignedText.segments[0].tokens[0] // [0] male [1] female

    expect(prevToken.idWord).toEqual('2-0-0')
    expect(prevToken.word).toEqual('male')
    expect(tokensEditActions.tokensEditHistory.steps.length).toEqual(0)

    tokensEditActions.mergeToken(token, 'prev')

    expect(Object.values(params.targets)[0].alignedText.segments[0].tokens.length).toEqual(1)
    expect(prevToken.word).toEqual('male female')
    expect(tokensEditActions.tokensEditHistory.steps[0].params.wasIdWord).toEqual('2-0-0') // result prevToken, the first token was merged to the prev
    expect(tokensEditActions.tokensEditHistory.steps[0].params.newIdWord).toEqual('2-0-0-m-1') // result prevToken, the first token was merged to the prev
    expect(tokensEditActions.tokensEditHistory.steps[0].params.mergedToken).toEqual(token)
    expect(tokensEditActions.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.MERGE)
  })

  it('8 TokensEditActions - splitToken splits to two tokens', async () => {
    const params = await prepareParams()

    const tokensEditActions = new TokensEditActions(params)

    const token = Object.values(params.targets)[0].alignedText.segments[0].tokens[1] // [0] male [1] female

    expect(token.idWord).toEqual('2-0-1')
    expect(token.word).toEqual('female')
    expect(tokensEditActions.tokensEditHistory.steps.length).toEqual(0)

    tokensEditActions.splitToken(token, 'fem ale')

    expect(Object.values(params.targets)[0].alignedText.segments[0].tokens.length).toEqual(3)
    expect(token.word).toEqual('fem')

    const newToken = Object.values(params.targets)[0].alignedText.segments[0].tokens[2]
    expect(newToken.word).toEqual('ale')

    expect(tokensEditActions.tokensEditHistory.steps[0].params.wasIdWord).toEqual('2-0-1') 
    expect(tokensEditActions.tokensEditHistory.steps[0].params.newIdWord1).toEqual('2-0-1-s1-1') 
    expect(tokensEditActions.tokensEditHistory.steps[0].params.newIdWord2).toEqual('2-0-1-s2-1') 

    expect(tokensEditActions.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.SPLIT)
  })

  it('9 TokensEditActions - changeLineBreak adds/removes hasLineBreak', async () => {
    const params = await prepareParams()

    const tokensEditActions = new TokensEditActions(params)

    const token = Object.values(params.targets)[0].alignedText.segments[0].tokens[0] // [0] male [1] female

    expect(token.idWord).toEqual('2-0-0')
    expect(token.word).toEqual('male')
    expect(token.hasLineBreak).toBeFalsy()

    // adds line break
    tokensEditActions.changeLineBreak(token, true)

    expect(token.hasLineBreak).toBeTruthy()
    expect(token.idWord).toEqual('2-0-0-al-1')

    expect(tokensEditActions.tokensEditHistory.steps[0].params.wasIdWord).toEqual('2-0-0') 
    expect(tokensEditActions.tokensEditHistory.steps[0].params.newIdWord).toEqual('2-0-0-al-1') 

    expect(tokensEditActions.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.ADD_LINE_BREAK)

    // removes line break
    tokensEditActions.changeLineBreak(token, false)

    expect(token.hasLineBreak).toBeFalsy()
    expect(token.idWord).toEqual('2-0-0-al-1-rl-1')

    expect(tokensEditActions.tokensEditHistory.steps[1].params.wasIdWord).toEqual('2-0-0-al-1') 
    expect(tokensEditActions.tokensEditHistory.steps[1].params.newIdWord).toEqual('2-0-0-al-1-rl-1') 

    expect(tokensEditActions.tokensEditHistory.steps[1].type).toEqual(HistoryStep.types.REMOVE_LINE_BREAK)
  })

  it('10 TokensEditActions - moveToSegment - moves to next/prev segment', async () => {
    const params = await prepareParams()

    const tokensEditActions = new TokensEditActions(params)

    // move to the start of the second segment
    const currentSegment = Object.values(params.targets)[0].alignedText.segments[0] 
    const nextSegment = Object.values(params.targets)[0].alignedText.segments[1]

    const token = currentSegment.tokens[1] // [0] male [1] female

    tokensEditActions.moveToSegment(token, 'next')

    expect(currentSegment.tokens.length).toEqual(1) // female was removed from the first segment
    

    expect(currentSegment.tokens.map(token => token.word)).toEqual(['male'])
    expect(nextSegment.tokens.map(token => token.word)).toEqual(['female', 'male', 'female'])

    expect(nextSegment.tokens[0].idWord).toEqual('2-0-1-ns-1')

    expect(tokensEditActions.tokensEditHistory.steps[0].type).toEqual(HistoryStep.types.TO_NEXT_SEGMENT)

    // move to the end of the first segment

    tokensEditActions.moveToSegment(token, 'prev')

    expect(currentSegment.tokens.map(token => token.word)).toEqual(['male', 'female'])
    expect(nextSegment.tokens.map(token => token.word)).toEqual(['male', 'female'])

    expect(currentSegment.tokens[1].idWord).toEqual('2-0-1-ns-1-ps-1')

    expect(tokensEditActions.tokensEditHistory.steps[1].type).toEqual(HistoryStep.types.TO_PREV_SEGMENT)
  })

  it('11 TokensEditActions - insertTokens - inserts tokens to the start/end', async () => {
    const params = await prepareParams()

    const tokensEditActions = new TokensEditActions(params)

    // insert to start
    const firstSegment = Object.values(params.targets)[0].alignedText.segments[0] 
    const lastSegment = Object.values(params.targets)[0].alignedText.segments[2] 

    tokensEditActions.insertTokens('Test start', 'target', Object.keys(params.targets)[0], 'start')

    expect(firstSegment.tokens.map(token => token.word)).toEqual(['Test', 'start', 'male', 'female'])

    expect(firstSegment.tokens[0].idWord).toEqual('2-0-0-n-2')
    expect(firstSegment.tokens[1].idWord).toEqual('2-0-0-n-1')

    // insert to end

    tokensEditActions.insertTokens('End test', 'target', Object.keys(params.targets)[0], 'end')

    expect(lastSegment.tokens.map(token => token.word)).toEqual(['male', 'female', 'End', 'test'])

    expect(lastSegment.tokens[2].idWord).toEqual('2-2-1-n-1')
    expect(lastSegment.tokens[3].idWord).toEqual('2-2-1-n-2')

  })

  it('12 TokensEditActions - allowedMergePrev - true - if there is a left token, otherwise - false', async () => {
    const params = await prepareParams()

    const tokensEditActions = new TokensEditActions(params)

    const currentSegment = Object.values(params.targets)[0].alignedText.segments[0] 
    
    const token0 = currentSegment.tokens[0] // [0] male [1] female
    const token1 = currentSegment.tokens[1] 

    expect(tokensEditActions.allowedMergePrev(token1)).toBeTruthy()
    expect(tokensEditActions.allowedMergePrev(token0)).toBeFalsy()
  })

  it('13 TokensEditActions - allowedMergeNext - true - if there is a right token, otherwise - false', async () => {
    const params = await prepareParams()

    const tokensEditActions = new TokensEditActions(params)

    const currentSegment = Object.values(params.targets)[0].alignedText.segments[0] 
    
    const token0 = currentSegment.tokens[0] // [0] male [1] female
    const token1 = currentSegment.tokens[1] 

    expect(tokensEditActions.allowedMergeNext(token0)).toBeTruthy()
    expect(tokensEditActions.allowedMergeNext(token1)).toBeFalsy()
  })

  it('14 TokensEditActions - allowedSplit - true - if there are more than 1 letter, otherwise - false', async () => {
    const params = await prepareParams()

    const tokensEditActions = new TokensEditActions(params)

    const currentSegment = params.origin.alignedText.segments[0] 
    
    const token0 = currentSegment.tokens[0] // [0] vir [1] femina [2] a
    const token1 = currentSegment.tokens[1] 
    const token2 = currentSegment.tokens[2]

    expect(tokensEditActions.allowedSplit(token0)).toBeTruthy()
    expect(tokensEditActions.allowedSplit(token1)).toBeTruthy()
    expect(tokensEditActions.allowedSplit(token2)).toBeFalsy()
  })

  it('15 TokensEditActions - allowedAddLineBreak - true - if there are no line breaks, otherwise - false; allowedRemoveLineBreak - the opposite', async () => {
    const params = await prepareParams()

    const tokensEditActions = new TokensEditActions(params)

    const currentSegment = params.origin.alignedText.segments[0] 
    
    const token0 = currentSegment.tokens[0] // [0] vir [1] femina [2] a
    const token2 = currentSegment.tokens[2]

    expect(tokensEditActions.allowedAddLineBreak(token0)).toBeTruthy()
    expect(tokensEditActions.allowedRemoveLineBreak(token0)).toBeFalsy()

    expect(tokensEditActions.allowedAddLineBreak(token2)).toBeFalsy() // it is the last
    expect(tokensEditActions.allowedRemoveLineBreak(token2)).toBeFalsy() // it is the last

    token0.hasLineBreak = true // no it has a line break

    expect(tokensEditActions.allowedAddLineBreak(token0)).toBeFalsy()
    expect(tokensEditActions.allowedRemoveLineBreak(token0)).toBeTruthy()
  })

  it('16 TokensEditActions - allowedToNextSegment - true - if it is the last token in a segment, there is a next segment and the current segment has more than 1 token, otherwise - false', async () => {
    const params = await prepareParams()

    const tokensEditActions = new TokensEditActions(params)

    const currentSegment = params.origin.alignedText.segments[0] 
    const nextSegment = params.origin.alignedText.segments[1] 
    const nextNextSegment = params.origin.alignedText.segments[2] 
    
    const tokenC0 = currentSegment.tokens[0] // [0] vir [1] femina [2] a
    const tokenC1 = currentSegment.tokens[1] 
    const tokenC2 = currentSegment.tokens[2]

    const tokenN0 = nextSegment.tokens[0] // [0] vir

    const tokenNN0 = nextNextSegment.tokens[0] // [0] femina [1] vir
    const tokenNN1 = nextNextSegment.tokens[1] 

    expect(tokensEditActions.allowedToNextSegment(tokenC0)).toBeFalsy()
    expect(tokensEditActions.allowedToNextSegment(tokenC1)).toBeFalsy()
    expect(tokensEditActions.allowedToNextSegment(tokenC2)).toBeTruthy()

    expect(tokensEditActions.allowedToNextSegment(tokenN0)).toBeFalsy()
    
    expect(tokensEditActions.allowedToNextSegment(tokenNN0)).toBeFalsy()
    expect(tokensEditActions.allowedToNextSegment(tokenNN1)).toBeFalsy()
  })

  it('17 TokensEditActions - allowedToPrevSegment - true - if it is the first token in a segment, there is a prev segment and the current segment has more than 1 token, otherwise - false', async () => {
    const params = await prepareParams()

    const tokensEditActions = new TokensEditActions(params)

    const prevPrevSegment = params.origin.alignedText.segments[0]
    const prevSegment = params.origin.alignedText.segments[1]
    const currentSegment = params.origin.alignedText.segments[2] 
    
    const tokenPP0 = prevPrevSegment.tokens[0] // [0] vir [1] femina [2] a
    const tokenPP1 = prevPrevSegment.tokens[1] 
    const tokenPP2 = prevPrevSegment.tokens[2]

    const tokenP0 = prevSegment.tokens[0] // [0] vir

    const tokenC0 = currentSegment.tokens[0] // [0] femina [1] vir
    const tokenC1 = currentSegment.tokens[1] 

    expect(tokensEditActions.allowedToPrevSegment(tokenC0)).toBeTruthy()
    expect(tokensEditActions.allowedToPrevSegment(tokenC1)).toBeFalsy()

    expect(tokensEditActions.allowedToPrevSegment(tokenP0)).toBeFalsy()
    
    expect(tokensEditActions.allowedToPrevSegment(tokenPP2)).toBeFalsy()
    expect(tokensEditActions.allowedToPrevSegment(tokenPP1)).toBeFalsy()
    expect(tokensEditActions.allowedToPrevSegment(tokenPP0)).toBeFalsy()
  })

  it('16 TokensEditActions - allowedDelete - true - if it is the first/last token in a text, otherwise - false', async () => {
    const params = await prepareParams()

    const tokensEditActions = new TokensEditActions(params)

    const currentSegment = params.origin.alignedText.segments[0] 
    const nextSegment = params.origin.alignedText.segments[1] 
    const nextNextSegment = params.origin.alignedText.segments[2] 
    
    const tokenC0 = currentSegment.tokens[0] // [0] vir [1] femina [2] a
    const tokenC1 = currentSegment.tokens[1] 
    const tokenC2 = currentSegment.tokens[2]

    const tokenN0 = nextSegment.tokens[0] // [0] vir

    const tokenNN0 = nextNextSegment.tokens[0] // [0] femina [1] vir
    const tokenNN1 = nextNextSegment.tokens[1] 

    expect(tokensEditActions.allowedDelete(tokenC0)).toBeTruthy()
    expect(tokensEditActions.allowedDelete(tokenC1)).toBeFalsy()
    expect(tokensEditActions.allowedDelete(tokenC2)).toBeFalsy()

    expect(tokensEditActions.allowedDelete(tokenN0)).toBeFalsy()
    
    expect(tokensEditActions.allowedDelete(tokenNN0)).toBeFalsy()
    expect(tokensEditActions.allowedDelete(tokenNN1)).toBeTruthy()
  })
})
