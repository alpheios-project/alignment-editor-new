import HistoryStep from '@/lib/data/history/history-step.js'

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
      case 'next' :
        return alignedText.segments.length > token.segmentIndex ? alignedText.segments[token.segmentIndex] : null
      case 'prev' :
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
  getToken (token, tokenType) {
    const segment = this.getSegmentByToken(token)
    const tokenIndex = segment.getTokenIndex(token)

    const check = (tokenType === 'prev') ? (!segment.isFirstTokenInSegment(tokenIndex)) : (!segment.isLastTokenInSegment(tokenIndex))

    if (check) {
      return {
        segment,
        tokenIndex,
        position: (tokenType === 'prev') ? HistoryStep.directions.NEXT : HistoryStep.directions.PREV,
        tokenResult: segment.getTokenByIndex((tokenType === 'prev') ? (tokenIndex - 1) : (tokenIndex + 1))
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
    return token.update({ word, idWord: newIdWord })
  }

  /**
   * @param {Token} token - token for update
   * @param {String} direction - left/right
   * @returns {Boolean}
   */
  mergeToken (token, direction) {
    const { segment, tokenIndex, tokenResult, position } = (direction === HistoryStep.directions.PREV) ? this.getToken(token, 'prev') : this.getToken(token, 'next')

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
    const newSegment = (direction === HistoryStep.directions.PREV) ? this.getSegmentByToken(token, 'prev') : this.getSegmentByToken(token, 'next')

    const tokenIndex = segment.getTokenIndex(token)
    segment.deleteToken(tokenIndex)

    const changeType = (direction === HistoryStep.directions.PREV) ? HistoryStep.types.TO_PREV_SEGMENT : HistoryStep.types.TO_NEXT_SEGMENT

    const alignedText = this.getAlignedTextByToken(token)
    const newIdWord = alignedText.getNewIdWord({
      token,
      segment: newSegment,
      changeType
    })

    const stepParams = {
      token,
      wasIdWord: token.idWord,
      wasSegmentIndex: segment.index,
      newIdWord,
      newSegmentIndex: newSegment.index,
      wasTokenIndex: tokenIndex
    }

    token.update({
      idWord: newIdWord,
      segmentIndex: newSegment.index
    })

    const insertPosition = (direction === HistoryStep.directions.PREV) ? newSegment.tokens.length : 0

    stepParams.newTokenIndex = insertPosition

    newSegment.insertToken(token, insertPosition)

    this.tokensEditHistory.truncateSteps()
    this.tokensEditHistory.addStep(token, changeType, stepParams)

    return true
  }

  /**
   * Check if the token could be merged with the previous
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedMergePrev (token) {
    return Boolean(this.getToken(token, 'prev'))
  }

  /**
   * Check if the token could be merged with the next
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedMergeNext (token) {
    return Boolean(this.getToken(token, 'next'))
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
    return !token.hasLineBreak
  }

  /**
   * Check if a line break could be removed after the token
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedRemoveLineBreak (token) {
    return Boolean(token.hasLineBreak)
  }

  /**
   * Check if the token could be moved to the next segment
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedToNextSegment (token) {
    return !this.getToken(token, 'next') && Boolean(this.getSegmentByToken(token, 'next'))
  }

  /**
   * Check if the token could be moved to the previous segment
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedToPrevSegment (token) {
    return !this.getToken(token, 'prev') && Boolean(this.getSegmentByToken(token, 'prev'))
  }

  /**
   * Check if the token could be deleted
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedDelete (token) {
    const alignedText = this.getAlignedTextByToken(token)
    return (!this.getToken(token, 'prev') && (token.segmentIndex === alignedText.segments[0].index)) ||
           (!this.getToken(token, 'next') && (token.segmentIndex === alignedText.segments[alignedText.segments.length - 1].index))
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

    return true
  }

  /**
   * Delete token
   * @param {Token} token
   * @returns {Boolean}
   */
  deleteToken (token) {
    const segment = this.getSegmentByToken(token)
    const tokenIndex = segment.getTokenIndex(token)
    return segment.deleteToken(tokenIndex)
  }

  // history actions

  removeStepUpdate (step) {
    step.token.update({ word: step.params.wasWord, idWord: step.params.wasIdWord })
    return {
      result: true
    }
  }

  applyStepUpdate (step) {
    step.token.update({ word: step.params.newWord, idWord: step.params.newIdWord })
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

    return {
      result: true
    }
  }

  removeStepSplit (step) {
    const segment = this.getSegmentByToken(step.token)
    const tokenIndex = segment.getTokenIndex(step.token)

    step.token.update({ word: step.params.wasWord, idWord: step.params.wasIdWord })
    segment.deleteToken(tokenIndex + 1)

    return {
      result: true
    }
  }

  applyStepSplit (step) {
    const segment = this.getSegmentByToken(step.token)
    const tokenIndex = segment.getTokenIndex(step.token)

    step.token.update({ word: step.params.newWord1, idWord: step.params.newIdWord1 })
    segment.addNewToken(tokenIndex, step.params.newIdWord2, step.params.newWord2)
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

    return {
      result: true
    }
  }

  removeStepInsertTokens (step) {
    step.params.createdTokens.forEach((token) => {
      const tokenIndex = step.params.segmentToInsert.getTokenIndex(token)
      step.params.segmentToInsert.deleteToken(tokenIndex)
    })
    return {
      result: true
    }
  }

  applyStepInsertTokens (step) {
    step.params.createdTokens.forEach((token) => {
      const insertPosition = (step.params.insertType === 'start') ? 0 : step.params.segmentToInsert.tokens.length
      step.params.segmentToInsert.insertToken(token, insertPosition)
    })
    return {
      result: true
    }
  }
}
