import HistoryStep from '@/lib/data/history/history-step.js'
import TokenizeController from '@/lib/controllers/tokenize-controller.js'

export default class TokensEditActions {
  /**
   * @param {Object {SourceText, AlignedText} } origin - it is a reference from alignment.origin
   * @param {Object {targetId: {SourceText, AlignedText} } } targets - it is a reference from alignment.targets
   * @param {TokensEditHistory} tokensEditHistory - it is a reference from alignment.tokensEditHistory
   */
  constructor ({ origin, targets, tokensEditHistory }) {
    this.origin = origin
    this.targets = targets
    this.tokensEditHistory = tokensEditHistory
  }

  /**
   * @param {Token} token
   * @returns {AlignedText}
   */
  getAlignedTextByToken (token) {
    let alignedText
    if (token.textType === 'origin') {
      alignedText = this.origin.alignedText
    } else {
      alignedText = this.targets[token.docSourceId].alignedText
    }
    return alignedText
  }

  /**
   *
   * @param {Token} token
   * @param {String} segmentType - current/next/prev
   * @returns {Segment}
   */
  getSegmentByToken (token, segmentType = 'current') {
    const alignedText = this.getAlignedTextByToken(token)
    switch (segmentType) {
      case 'current' :
        return alignedText.segments[token.segmentIndex - 1]
      case HistoryStep.directions.NEXT :
        return alignedText.segments.length > token.segmentIndex ? alignedText.segments[token.segmentIndex] : null
      case HistoryStep.directions.PREV :
        return token.segmentIndex > 1 ? alignedText.segments[token.segmentIndex - 2] : null
    }
    return null
  }

  /**
   *
   * @param {Token} token
   * @param {String} tokenType - prev/next
   * @returns {Object}
   *          {Segment} segment
   *          {Number} tokenIndex
   *          {String} position - prev/next
   *          {Token} tokenResult
   */
  getNextPrevToken (token, direction) {
    const segment = this.getSegmentByToken(token)
    const tokenIndex = segment.getTokenIndex(token)

    const check = (direction === HistoryStep.directions.PREV) ? (!segment.isFirstTokenInSegment(token)) : (!segment.isLastTokenInSegment(token))

    if (check) {
      return {
        segment,
        tokenIndex,
        position: (direction === HistoryStep.directions.PREV) ? HistoryStep.directions.NEXT : HistoryStep.directions.PREV,
        tokenResult: segment.getTokenByIndex((direction === HistoryStep.directions.PREV) ? (tokenIndex - 1) : (tokenIndex + 1))
      }
    }

    return null
  }

  /**
   * @param {Token} token - token for update
   * @param {String} word - new word
   * @returns {Boolean}
   */
  updateTokenWord (token, word) {
    const segment = this.getSegmentByToken(token)
    const alignedText = this.getAlignedTextByToken(token)

    const newIdWord = alignedText.getNewIdWord({
      token,
      segment,
      changeType: HistoryStep.types.UPDATE
    })

    this.tokensEditHistory.truncateSteps()

    const wasIdWord = token.idWord
    this.tokensEditHistory.addStep(token, HistoryStep.types.UPDATE, { wasIdWord, wasWord: token.word, newWord: word, newIdWord })
    token.update({ word, idWord: newIdWord })
    this.reIndexSentence(segment)

    return { wasIdWord }
  }

  /**
   * @param {Token} token - token for update
   * @param {String} direction - left/right
   * @returns {Boolean}
   */
  mergeToken (token, direction, annotations) {
    const { segment, tokenIndex, tokenResult, position } = this.getNextPrevToken(token, direction)

    const alignedText = this.getAlignedTextByToken(token)
    const newIdWord = alignedText.getNewIdWord({
      token: tokenResult,
      segment,
      changeType: HistoryStep.types.MERGE
    })

    const wasIdWord = tokenResult.idWord
    const stepParams = {
      wasIdWord,
      wasWord: tokenResult.word,
      mergedToken: token,
      position,
      newIdWord
    }

    const deletedAnnotations = {}
    if (annotations && annotations[wasIdWord]) {
      deletedAnnotations[wasIdWord] = annotations[wasIdWord]
    }

    if (annotations && annotations[token.idWord]) {
      deletedAnnotations[token.idWord] = annotations[token.idWord]
    }

    if (deletedAnnotations) {
      stepParams.deletedAnnotations = deletedAnnotations
    }

    tokenResult.merge({ token, position, newIdWord })

    stepParams.newWord = tokenResult.word

    this.tokensEditHistory.truncateSteps()
    this.tokensEditHistory.addStep(tokenResult, HistoryStep.types.MERGE, stepParams)
    segment.deleteToken(tokenIndex)
    this.reIndexSentence(segment)
    return {
      wasIdWord: [wasIdWord, token.idWord], token: tokenResult
    }
  }

  /**
   * @param {Token} token - token for update
   * @param {String} tokenWord - token's word with space
   * @returns {Boolean}
   */
  splitToken (token, tokenWord, annotations) {
    const segment = this.getSegmentByToken(token)
    const tokenIndex = segment.getTokenIndex(token)
    const alignedText = this.getAlignedTextByToken(token)

    const newIdWord1 = alignedText.getNewIdWord({
      token,
      segment,
      changeType: HistoryStep.types.SPLIT,
      indexWord: 1
    })

    const newIdWord2 = alignedText.getNewIdWord({
      token,
      segment,
      changeType: HistoryStep.types.SPLIT,
      indexWord: 2
    })

    const wasIdWord = token.idWord
    const stepParams = {
      wasIdWord,
      wasWord: token.word,
      newIdWord1,
      newIdWord2
    }

    if (annotations) {
      stepParams.deletedAnnotations = { [wasIdWord]: annotations }
    }

    const tokenWordParts = tokenWord.split(' ')

    token.update({
      word: tokenWordParts[0],
      idWord: newIdWord1
    })

    stepParams.newWord1 = tokenWordParts[0]
    stepParams.newWord2 = tokenWordParts[1]

    this.tokensEditHistory.truncateSteps()
    this.tokensEditHistory.addStep(token, HistoryStep.types.SPLIT, stepParams)

    segment.addNewToken(tokenIndex, newIdWord2, tokenWordParts[1])
    this.reIndexSentence(segment)
    return {
      result: true,
      wasIdWord,
      token
    }
  }

  changeLineBreak (token, hasLineBreak) {
    const segment = this.getSegmentByToken(token)
    const alignedText = this.getAlignedTextByToken(token)

    const changeType = hasLineBreak ? HistoryStep.types.ADD_LINE_BREAK : HistoryStep.types.REMOVE_LINE_BREAK
    const newIdWord = alignedText.getNewIdWord({
      token,
      segment,
      changeType
    })

    this.tokensEditHistory.truncateSteps()
    this.tokensEditHistory.addStep(token, changeType, { wasIdWord: token.idWord, newIdWord })

    const wasIdWord = token.idWord
    token.update({ hasLineBreak, idWord: newIdWord })
    return { wasIdWord }
  }

  /**
   * Moves the token to the next/previous segment
   * @param {Token} token
   * @param {HistoryStep.directions} direction
   * @returns {Boolean}
   */
  moveToSegment (token, direction) {
    const segment = this.getSegmentByToken(token)
    const newSegment = this.getSegmentByToken(token, direction)
    const partNum = token.partNum

    const tokenIndex = segment.getTokenIndex(token)
    segment.deleteToken(tokenIndex)

    const changeType = (direction === HistoryStep.directions.PREV) ? HistoryStep.types.TO_PREV_SEGMENT : HistoryStep.types.TO_NEXT_SEGMENT

    const alignedText = this.getAlignedTextByToken(token)
    const wasIdWord = token.idWord
    const newIdWord = alignedText.getNewIdWord({
      token,
      segment: newSegment,
      changeType
    })

    const newPartNum = (direction === HistoryStep.directions.PREV) ? newSegment.allPartNums[newSegment.allPartNums.length - 1].partNum : 1
    token.update({
      idWord: newIdWord,
      segmentIndex: newSegment.index,
      partNum: newPartNum
    })
    // update part num
    const insertPosition = (direction === HistoryStep.directions.PREV) ? newSegment.tokens.length : 0

    const stepParams = {
      token,
      wasIdWord,
      wasSegmentIndex: segment.index,
      wasPartNum: partNum,
      newIdWord,
      newSegmentIndex: newSegment.index,
      wasTokenIndex: tokenIndex,
      newPartNum,
      newTokenIndex: insertPosition
    }

    newSegment.insertToken(token, insertPosition)

    this.tokensEditHistory.truncateSteps()
    this.tokensEditHistory.addStep(token, changeType, stepParams)

    this.reIndexSentence(segment)
    this.reIndexSentence(newSegment)
    return {
      result: true,
      newSegmentIndex: newSegment.index,
      wasIdWord
    }
  }

  /**
   * Check if the token could be merged with the previous
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedMergePrev (token) {
    return Boolean(this.getNextPrevToken(token, HistoryStep.directions.PREV))
  }

  /**
   * Check if the token could be merged with the next
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedMergeNext (token) {
    return Boolean(this.getNextPrevToken(token, HistoryStep.directions.NEXT))
  }

  /**
   * Check if the token could be splitted (for now it is always true)
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedSplit (token) {
    return token.word.length > 1
  }

  /**
   * Check if a line break could be added after the token
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedAddLineBreak (token) {
    return !token.hasLineBreak && Boolean(this.getNextPrevToken(token, HistoryStep.directions.NEXT))
  }

  /**
   * Check if a line break could be removed after the token
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedRemoveLineBreak (token) {
    return Boolean(token.hasLineBreak) && Boolean(this.getNextPrevToken(token, HistoryStep.directions.NEXT))
  }

  /**
   * Check if the token could be moved to the next segment
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedToNextSegment (token) {
    const segment = this.getSegmentByToken(token)
    const nextSegment = this.getSegmentByToken(token, HistoryStep.directions.NEXT)
    return segment.tokens.length > 1 && !this.getNextPrevToken(token, HistoryStep.directions.NEXT) && Boolean(nextSegment)
  }

  /**
   * Check if the token could be moved to the previous segment
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedToPrevSegment (token) {
    const segment = this.getSegmentByToken(token)
    const prevSegment = this.getSegmentByToken(token, HistoryStep.directions.PREV)
    return segment.tokens.length > 1 && !this.getNextPrevToken(token, HistoryStep.directions.PREV) && Boolean(prevSegment)
  }

  /**
   * Check if the token could be deleted
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedDelete (token) {
    const segment = this.getSegmentByToken(token)
    return segment.tokens.length > 1
  }

  insertTokens (tokensText, token, direction) {
    const alignedText = this.getAlignedTextByToken(token)
    const segment = this.getSegmentByToken(token)

    let words = tokensText.split(' ')

    if (direction === HistoryStep.directions.PREV) { words = words.reverse() }

    let tokenIndex = segment.getTokenIndex(token)
    const createdTokens = []

    const changeType = (direction === HistoryStep.directions.PREV) ? HistoryStep.types.NEW_BEFORE : HistoryStep.types.NEW_AFTER
    let baseToken = token
    words.forEach(word => {
      const newIdWord = alignedText.getNewIdWord({
        token: baseToken,
        segment,
        changeType,
        insertType: direction
      })
      tokenIndex = (direction === HistoryStep.directions.PREV) ? tokenIndex - 1 : tokenIndex
      const tokenNew = segment.addNewToken(tokenIndex, newIdWord, word, false)
      tokenIndex = segment.getTokenIndex(tokenNew)

      createdTokens.push(tokenNew)
      baseToken = tokenNew
    })

    const newIdWordSource = alignedText.getNewIdWord({
      token,
      segment,
      changeType: HistoryStep.types.NEW_SOURCE
    })
    const wasIdWordSource = token.idWord

    token.update({ idWord: newIdWordSource })

    this.tokensEditHistory.truncateSteps()
    this.tokensEditHistory.addStep(token, HistoryStep.types.NEW, {
      createdTokens,
      segment,
      insertType: direction,
      wasIdWord: wasIdWordSource,
      newIdWord: newIdWordSource
    })

    this.reIndexSentence(segment)
    // add new partNum
    return {
      result: true,
      segmentIndex: segment.index,
      partNum: token.partNum,
      wasIdWord: wasIdWordSource
    }
  }

  reIndexSentence (segment) {
    const alignedText = (segment.textType === 'origin') ? this.origin.alignedText : this.targets[segment.docSourceId].alignedText
    const getReIndexSentenceMethod = TokenizeController.getReIndexSentenceMethod(alignedText.tokenization.tokenizer)
    getReIndexSentenceMethod(segment, false)
  }

  /**
   * Delete token
   * @param {Token} token
   * @returns {Boolean}
   */
  deleteToken (token, annotations) {
    const segment = this.getSegmentByToken(token)
    const tokenIndex = segment.getTokenIndex(token)

    const deletedToken = segment.deleteToken(tokenIndex)
    if (deletedToken) {
      this.tokensEditHistory.truncateSteps()
      this.tokensEditHistory.addStep(null, HistoryStep.types.DELETE, {
        segmentToDelete: segment, deleteIndex: tokenIndex, deletedToken, deletedAnnotations: { [deletedToken.idWord]: annotations }
      })

      this.reIndexSentence(segment)
      return true
    }
    return false
  }

  // history actions

  removeStepUpdate (step) {
    const segment = this.getSegmentByToken(step.token)
    step.token.update({ word: step.params.wasWord, idWord: step.params.wasIdWord })
    this.reIndexSentence(segment)
    return {
      result: true,
      data: {
        updateAnnotations: true,
        type: 'single',
        token: step.token,
        wasIdWord: [step.params.newIdWord],
        idWordNewAnnotations: step.params.newIdWord
      }
    }
  }

  applyStepUpdate (step) {
    const segment = this.getSegmentByToken(step.token)
    step.token.update({ word: step.params.newWord, idWord: step.params.newIdWord })
    this.reIndexSentence(segment)

    return {
      result: true,
      data: {
        updateAnnotations: true,
        type: 'single',
        token: step.token,
        wasIdWord: [step.params.wasIdWord],
        idWordNewAnnotations: step.params.newIdWord,
        newAnnotations: step.params.newAnnotations
      }
    }
  }

  removeStepMerge (step) {
    const segment = this.getSegmentByToken(step.token)
    const tokenIndex = segment.getTokenIndex(step.token)

    step.token.update({ word: step.params.wasWord, idWord: step.params.wasIdWord })

    const insertPosition = (step.params.position === HistoryStep.directions.PREV) ? tokenIndex : tokenIndex + 1

    segment.insertToken(step.params.mergedToken, insertPosition)
    this.reIndexSentence(segment)

    return {
      result: true,
      data: {
        updateAnnotations: true,
        type: 'local',
        mergedToken: step.params.mergedToken,
        annotations: step.params.deletedAnnotations,
        wasToken: step.token,
        newIdWord: step.params.newIdWord,
        idWordNewAnnotations: step.params.newIdWord
      }
    }
  }

  applyStepMerge (step) {
    const segment = this.getSegmentByToken(step.token)
    const tokenRef = segment.getTokenById(step.token.idWord)
    tokenRef.update({ word: step.params.newWord, idWord: step.params.newIdWord })
    step.token = tokenRef

    const tokenIndex = segment.getTokenIndex(step.params.mergedToken)
    segment.deleteToken(tokenIndex)
    this.reIndexSentence(segment)

    return {
      result: true,
      data: {
        updateAnnotations: true,
        type: 'delete',
        token: step.token,
        wasIdWord: [step.params.wasIdWord, step.params.mergedToken.idWord],
        idWordNewAnnotations: step.params.newIdWord,
        newAnnotations: step.params.newAnnotations
      }
    }
  }

  removeStepSplit (step) {
    const segment = this.getSegmentByToken(step.token)
    const tokenIndex = segment.getTokenIndex(step.token)

    step.token.update({ word: step.params.wasWord, idWord: step.params.wasIdWord })
    segment.deleteToken(tokenIndex + 1)
    this.reIndexSentence(segment)
    return {
      result: true,
      data: {
        updateAnnotations: true,
        type: 'local',
        token: step.token,
        wasIdWord: [step.params.newIdWord1],
        annotations: step.params.deletedAnnotations,
        idWordNewAnnotations: step.params.newIdWord
      }
    }
  }

  applyStepSplit (step) {
    const segment = this.getSegmentByToken(step.token)
    const tokenIndex = segment.getTokenIndex(step.token)

    step.token.update({ word: step.params.newWord1, idWord: step.params.newIdWord1 })
    segment.addNewToken(tokenIndex, step.params.newIdWord2, step.params.newWord2)
    this.reIndexSentence(segment)
    return {
      result: true,
      data: {
        updateAnnotations: true,
        type: 'delete',
        token: step.token,
        wasIdWord: [step.params.wasIdWord],
        idWordNewAnnotations: step.params.newIdWord,
        newAnnotations: step.params.newAnnotations
      }
    }
  }

  removeStepAddLineBreak (step) {
    step.token.update({ hasLineBreak: false, idWord: step.params.wasIdWord })
    return {
      result: true,
      data: {
        updateAnnotations: true,
        type: 'single',
        token: step.token,
        wasIdWord: [step.params.newIdWord],
        idWordNewAnnotations: step.params.newIdWord
      }
    }
  }

  applyStepAddLineBreak (step) {
    step.token.update({ hasLineBreak: true, idWord: step.params.newIdWord })
    return {
      result: true,
      data: {
        updateAnnotations: true,
        type: 'single',
        token: step.token,
        wasIdWord: [step.params.wasIdWord],
        idWordNewAnnotations: step.params.newIdWord,
        newAnnotations: step.params.newAnnotations
      }
    }
  }

  removeStepRemoveLineBreak (step) {
    step.token.update({ hasLineBreak: true, idWord: step.params.wasIdWord })
    return {
      result: true,
      data: {
        updateAnnotations: true,
        type: 'single',
        token: step.token,
        wasIdWord: [step.params.newIdWord],
        idWordNewAnnotations: step.params.newIdWord
      }
    }
  }

  applyStepRemoveLineBreak (step) {
    step.token.update({ hasLineBreak: false, idWord: step.params.newIdWord })
    return {
      result: true,
      data: {
        updateAnnotations: true,
        type: 'single',
        token: step.token,
        wasIdWord: [step.params.wasIdWord],
        idWordNewAnnotations: step.params.newIdWord,
        newAnnotations: step.params.newAnnotations
      }
    }
  }

  removeStepToOtherSegment (step) {
    const alignedText = this.getAlignedTextByToken(step.token)
    const newSegment = alignedText.segments[step.params.newSegmentIndex - 1]
    const wasSegment = alignedText.segments[step.params.wasSegmentIndex - 1]

    step.token.update({
      idWord: step.params.wasIdWord,
      segmentIndex: step.params.wasSegmentIndex
    })

    newSegment.deleteToken(step.params.newTokenIndex)
    wasSegment.insertToken(step.token, step.params.wasTokenIndex)

    this.reIndexSentence(newSegment)
    this.reIndexSentence(wasSegment)
    return {
      result: true,
      data: {
        updateAnnotations: true,
        type: 'single',
        token: step.token,
        wasIdWord: [step.params.newIdWord],
        idWordNewAnnotations: step.params.newIdWord
      }
    }
  }

  applyStepToOtherSegment (step) {
    const alignedText = this.getAlignedTextByToken(step.token)
    const newSegment = alignedText.segments[step.params.newSegmentIndex - 1]
    const wasSegment = alignedText.segments[step.params.wasSegmentIndex - 1]

    step.token.update({
      idWord: step.params.newIdWord,
      segmentIndex: step.params.newSegmentIndex
    })

    wasSegment.deleteToken(step.params.wasTokenIndex)
    newSegment.insertToken(step.token, step.params.newTokenIndex)

    this.reIndexSentence(newSegment)
    this.reIndexSentence(wasSegment)
    return {
      result: true,
      data: {
        updateAnnotations: true,
        type: 'single',
        token: step.token,
        wasIdWord: [step.params.wasIdWord],
        idWordNewAnnotations: step.params.newIdWord,
        newAnnotations: step.params.newAnnotations
      }
    }
  }

  removeStepInsertTokens (step) {
    step.params.createdTokens.forEach((token) => {
      const tokenIndex = step.params.segment.getTokenIndex(token)
      step.params.segment.deleteToken(tokenIndex)
    })

    step.token.update({ idWord: step.params.wasIdWord })

    this.reIndexSentence(step.params.segment)
    return {
      result: true,
      data: {
        token: step.token,
        idWordNewAnnotations: step.params.createdTokens.map(token => token.idWord),

        updateAnnotations: true,
        type: 'single',
        wasIdWord: [step.params.newIdWord]
      }
    }
  }

  applyStepInsertTokens (step) {
    let tokenIndex = step.params.segment.getTokenIndex(step.token)

    step.params.createdTokens.forEach((token) => {
      tokenIndex = (step.params.insertType === HistoryStep.directions.PREV) ? tokenIndex : tokenIndex + 1
      step.params.segment.insertToken(token, tokenIndex)

      tokenIndex = step.params.segment.getTokenIndex(token)
    })

    step.token.update({ idWord: step.params.newIdWord })

    this.reIndexSentence(step.params.segment)

    return {
      result: true,
      data: {
        token: step.token,
        idWordNewAnnotations: step.params.createdTokens.map(token => token.idWord),
        newAnnotations: step.params.newAnnotations,

        updateAnnotations: true,
        type: 'single',
        wasIdWord: [step.params.wasIdWord]

      }
    }
  }

  removeStepDeleteToken (step) {
    step.params.segmentToDelete.insertToken(step.params.deletedToken, step.params.deleteIndex)
    this.reIndexSentence(step.params.segmentToDelete)

    return {
      result: true,
      data: {
        updateAnnotations: true,
        type: 'local',
        token: step.params.deletedToken,
        annotations: step.params.deletedAnnotations
      }
    }
  }

  applyStepDeleteToken (step) {
    step.params.segmentToDelete.deleteToken(step.params.deleteIndex)
    this.reIndexSentence(step.params.segmentToDelete)
    return {
      result: true,
      data: {
        updateAnnotations: true,
        type: 'delete',
        token: step.params.deletedToken
      }
    }
  }
}
