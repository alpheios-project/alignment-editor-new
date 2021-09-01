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
    this.tokensEditHistory.addStep(token, HistoryStep.types.UPDATE, { wasIdWord: token.idWord, wasWord: token.word, newWord: word, newIdWord })
    token.update({ word, idWord: newIdWord })
    this.reIndexSentence(segment)

    return true
  }

  /**
   * @param {Token} token - token for update
   * @param {String} direction - left/right
   * @returns {Boolean}
   */
  mergeToken (token, direction) {
    const { segment, tokenIndex, tokenResult, position } = this.getNextPrevToken(token, direction)

    const alignedText = this.getAlignedTextByToken(token)
    const newIdWord = alignedText.getNewIdWord({
      token: tokenResult,
      segment,
      changeType: HistoryStep.types.MERGE
    })

    const stepParams = {
      wasIdWord: tokenResult.idWord,
      wasWord: tokenResult.word,
      mergedToken: token,
      position,
      newIdWord
    }

    tokenResult.merge({ token, position, newIdWord })

    stepParams.newWord = tokenResult.word

    this.tokensEditHistory.truncateSteps()
    this.tokensEditHistory.addStep(tokenResult, HistoryStep.types.MERGE, stepParams)
    segment.deleteToken(tokenIndex)
    this.reIndexSentence(segment)
    return true
  }

  /**
   * @param {Token} token - token for update
   * @param {String} tokenWord - token's word with space
   * @returns {Boolean}
   */
  splitToken (token, tokenWord) {
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

    const stepParams = {
      wasIdWord: token.idWord,
      wasWord: token.word,
      newIdWord1,
      newIdWord2
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
    return true
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

    token.update({ hasLineBreak, idWord: newIdWord })
    return true
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
      newSegmentIndex: newSegment.index
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
    const alignedText = this.getAlignedTextByToken(token)
    const segment = this.getSegmentByToken(token)
    return segment.tokens.length > 1 &&
           ((!this.getNextPrevToken(token, HistoryStep.directions.PREV) && (token.segmentIndex === alignedText.segments[0].index)) ||
           (!this.getNextPrevToken(token, HistoryStep.directions.NEXT) && (token.segmentIndex === alignedText.segments[alignedText.segments.length - 1].index)))
  }

  /**
   *
   * @param {String} tokensText - string that would be converted to tokens
   * @param {String} textType - origin/target
   * @param {String} textId - docSourceId
   * @param {String} insertType - start (insert to the start of the first segment), end (insert to the end of the last segment)
   */
  insertTokens (tokensText, textType, textId, insertType) {
    const alignedText = (textType === 'origin') ? this.origin.alignedText : this.targets[textId].alignedText
    const segmentToInsert = (insertType === 'start') ? alignedText.segments[0] : alignedText.segments[alignedText.segments.length - 1]

    const partNum = (insertType === 'start') ? 1 : segmentToInsert.allPartNums[segmentToInsert.allPartNums.length - 1].partNum

    let words = tokensText.split(' ')
    if (insertType === 'start') { words = words.reverse() }

    const createdTokens = []
    words.forEach(word => {
      const baseToken = (insertType === 'start') ? segmentToInsert.tokens[0] : segmentToInsert.tokens[segmentToInsert.tokens.length - 1]

      const newIdWord = alignedText.getNewIdWord({
        token: baseToken,
        segment: segmentToInsert,
        changeType: HistoryStep.types.NEW,
        insertType
      })

      const insertPosition = (insertType === 'start') ? -1 : segmentToInsert.tokens.length - 1
      const token = segmentToInsert.addNewToken(insertPosition, newIdWord, word, false)

      createdTokens.push(token)
    })

    this.tokensEditHistory.truncateSteps()
    this.tokensEditHistory.addStep(null, HistoryStep.types.NEW, {
      createdTokens, segmentToInsert, insertType
    })

    this.reIndexSentence(segmentToInsert)
    // add new partNum
    return {
      result: true,
      segmentIndex: segmentToInsert.index,
      partNum
    }
  }

  reIndexSentence (segment) {
    const alignedText = (segment.textType === 'origin') ? this.origin.alignedText : this.targets[segment.docSourceId].alignedText
    const getReIndexSentenceMethod = TokenizeController.getReIndexSentenceMethod(alignedText.tokenization.tokenizer)
    getReIndexSentenceMethod(segment)
  }

  /**
   * Delete token
   * @param {Token} token
   * @returns {Boolean}
   */
  deleteToken (token) {
    const segment = this.getSegmentByToken(token)
    const tokenIndex = segment.getTokenIndex(token)

    const deletedToken = segment.deleteToken(tokenIndex)
    if (deletedToken) {
      this.tokensEditHistory.truncateSteps()
      this.tokensEditHistory.addStep(null, HistoryStep.types.DELETE, {
        segmentToDelete: segment, deleteIndex: tokenIndex, deletedToken
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
      result: true
    }
  }

  applyStepUpdate (step) {
    const segment = this.getSegmentByToken(step.token)
    step.token.update({ word: step.params.newWord, idWord: step.params.newIdWord })
    this.reIndexSentence(segment)
    return {
      result: true
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
      result: true
    }
  }

  applyStepMerge (step) {
    const segment = this.getSegmentByToken(step.token)
    step.token.update({ word: step.params.newWord, idWord: step.params.newIdWord })

    const tokenIndex = segment.getTokenIndex(step.token)
    const deleteIndex = (step.params.position === HistoryStep.directions.PREV) ? tokenIndex - 1 : tokenIndex + 1
    segment.deleteToken(deleteIndex)
    this.reIndexSentence(segment)
    return {
      result: true
    }
  }

  removeStepSplit (step) {
    const segment = this.getSegmentByToken(step.token)
    const tokenIndex = segment.getTokenIndex(step.token)

    step.token.update({ word: step.params.wasWord, idWord: step.params.wasIdWord })
    segment.deleteToken(tokenIndex + 1)
    this.reIndexSentence(segment)
    return {
      result: true
    }
  }

  applyStepSplit (step) {
    const segment = this.getSegmentByToken(step.token)
    const tokenIndex = segment.getTokenIndex(step.token)

    step.token.update({ word: step.params.newWord1, idWord: step.params.newIdWord1 })
    segment.addNewToken(tokenIndex, step.params.newIdWord2, step.params.newWord2)
    this.reIndexSentence(segment)
    return {
      result: true
    }
  }

  removeStepAddLineBreak (step) {
    step.token.update({ hasLineBreak: false, idWord: step.params.wasIdWord })
    return {
      result: true
    }
  }

  applyStepAddLineBreak (step) {
    step.token.update({ hasLineBreak: true, idWord: step.params.newIdWord })
    return {
      result: true
    }
  }

  removeStepRemoveLineBreak (step) {
    step.token.update({ hasLineBreak: true, idWord: step.params.wasIdWord })
    return {
      result: true
    }
  }

  applyStepRemoveLineBreak (step) {
    step.token.update({ hasLineBreak: false, idWord: step.params.newIdWord })
    return {
      result: true
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
      result: true
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
      result: true
    }
  }

  removeStepInsertTokens (step) {
    step.params.createdTokens.forEach((token) => {
      const tokenIndex = step.params.segmentToInsert.getTokenIndex(token)
      step.params.segmentToInsert.deleteToken(tokenIndex)
    })
    this.reIndexSentence(step.params.segmentToInsert)
    return {
      result: true
    }
  }

  applyStepInsertTokens (step) {
    step.params.createdTokens.forEach((token) => {
      const insertPosition = (step.params.insertType === 'start') ? 0 : step.params.segmentToInsert.tokens.length
      step.params.segmentToInsert.insertToken(token, insertPosition)
    })
    this.reIndexSentence(step.params.segmentToInsert)
    return {
      result: true
    }
  }

  removeStepDeleteToken (step) {
    step.params.segmentToDelete.insertToken(step.params.deletedToken, step.params.deleteIndex)
    this.reIndexSentence(step.params.segmentToDelete)
    return {
      result: true
    }
  }

  applyStepDeleteToken (step) {
    step.params.segmentToDelete.deleteToken(step.params.tokenIndex)
    this.reIndexSentence(step.params.segmentToDelete)
    return {
      result: true
    }
  }
}
