import TokensEditStep from '@/lib/data/history/tokens-edit-step'
// import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
// import NotificationSingleton from '@/lib/notifications/notification-singleton'

export default class TokensEditActions {
  constructor ({ origin, target, tokensEditHistory }) {
    this.origin = origin
    this.target = target
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

  getToken (token, tokenType) {
    const segment = this.getSegmentByToken(token)
    const tokenIndex = segment.getTokenIndex(token)

    const check = (tokenType === 'prev') ? (!segment.isFirstTokenInSegment(tokenIndex)) : (!segment.isLastTokenInSegment(tokenIndex))
    if (check) {
      return {
        segment,
        tokenIndex,
        position: (tokenType === 'prev') ? TokensEditStep.directions.NEXT : TokensEditStep.directions.PREV,
        tokenMergeTo: segment.getTokenByIndex((tokenType === 'prev') ? (tokenIndex - 1) : (tokenIndex + 1))
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
      changeType: TokensEditStep.types.UPDATE
    })

    this.tokensEditHistory.addStep(token, TokensEditStep.types.UPDATE, { wasIdWord: token.idWord, wasWord: token.word, newWord: word, newIdWord })
    return token.update({ word, idWord: newIdWord })
  }

  /**
   * @param {Token} token - token for update
   * @param {String} direction - left/right
   * @returns {Boolean}
   */
  mergeToken (token, direction) {
    const { segment, tokenIndex, tokenMergeTo, position } = (direction === TokensEditStep.directions.PREV) ? this.getToken(token, 'prev') : this.getToken(token, 'next')
    const alignedText = this.getAlignedTextByToken(token)
    const newIdWord = alignedText.getNewIdWord({
      token: tokenMergeTo,
      segment,
      changeType: TokensEditStep.types.MERGE
    })

    const stepParams = {
      wasIdWord: tokenMergeTo.idWord,
      wasWord: tokenMergeTo.word,
      mergedToken: token,
      position,
      newIdWord
    }

    tokenMergeTo.merge({ token, position, newIdWord })

    stepParams.newWord = tokenMergeTo.word

    this.tokensEditHistory.addStep(tokenMergeTo, TokensEditStep.types.MERGE, stepParams)
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
      changeType: TokensEditStep.types.SPLIT,
      indexWord: 1
    })

    const newIdWord2 = alignedText.getNewIdWord({
      token,
      segment,
      changeType: TokensEditStep.types.SPLIT,
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

    this.tokensEditHistory.addStep(token, TokensEditStep.types.SPLIT, stepParams)

    segment.addNewToken(tokenIndex, newIdWord2, tokenWordParts[1])
    return true
  }

  /**
   * Adds a line break after the token
   * @param {Token} token
   * @returns {Boolean}
   */
  addLineBreakAfterToken (token) {
    const segment = this.getSegmentByToken(token)
    const alignedText = this.getAlignedTextByToken(token)

    const newIdWord = alignedText.getNewIdWord({
      token,
      segment,
      changeType: TokensEditStep.types.ADD_LINE_BREAK
    })

    token.addLineBreakAfter()
    token.update({
      idWord: newIdWord
    })
    return true
  }

  /**
   * Removes a line break after the token
   * @param {Token} token
   * @returns {Boolean}
   */
  removeLineBreakAfterToken (token) {
    const segment = this.getSegmentByToken(token)
    const alignedText = this.getAlignedTextByToken(token)

    const newIdWord = alignedText.getNewIdWord({
      token,
      segment,
      changeType: TokensEditStep.types.REMOVE_LINE_BREAK
    })

    token.removeLineBreakAfter()
    token.update({
      idWord: newIdWord
    })

    return true
  }

  /**
   * Moves the token to the next/previous segment
   * @param {Token} token
   * @param {TokensEditStep.directions} direction
   * @returns {Boolean}
   */
  moveToSegment (token, direction) {
    const segment = this.getSegmentByToken(token)
    const newSegment = (direction === TokensEditStep.directions.PREV) ? this.getSegmentByToken(token, 'prev') : this.getSegmentByToken(token, 'next')

    const tokenIndex = segment.getTokenIndex(token)
    segment.deleteToken(tokenIndex)

    const alignedText = this.getAlignedTextByToken(token)
    const newIdWord = alignedText.getNewIdWord({
      token,
      segment: newSegment,
      changeType: (direction === TokensEditStep.directions.PREV) ? TokensEditStep.types.TO_PREV_SEGMENT : TokensEditStep.types.TO_NEXT_SEGMENT
    })

    token.update({
      idWord: newIdWord,
      segmentIndex: newSegment.index
    })

    const insertPosition = (direction === TokensEditStep.directions.PREV) ? newSegment.tokens.length : 0
    newSegment.insertToken(token, insertPosition)
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

    words.forEach(word => {
      const baseToken = (insertType === 'start') ? segmentToInsert.tokens[0] : segmentToInsert.tokens[segmentToInsert.tokens.length - 1]

      const newIdWord = alignedText.getNewIdWord({
        token: baseToken,
        segment: segmentToInsert,
        changeType: TokensEditStep.types.NEW,
        insertType
      })

      const insertPosition = (insertType === 'start') ? -1 : segmentToInsert.tokens.length - 1
      segmentToInsert.addNewToken(insertPosition, newIdWord, word, false)
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

    const insertPosition = (step.params.position === TokensEditStep.directions.PREV) ? tokenIndex : tokenIndex + 1

    segment.insertToken(step.params.mergedToken, insertPosition)
    return {
      result: true
    }
  }

  applyStepMerge (step) {
    const segment = this.getSegmentByToken(step.token)
    step.token.update({ word: step.params.newWord, idWord: step.params.newIdWord })

    const tokenIndex = segment.getTokenIndex(step.token)
    const deleteIndex = (step.params.position === TokensEditStep.directions.PREV) ? tokenIndex - 1 : tokenIndex + 1
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
}
