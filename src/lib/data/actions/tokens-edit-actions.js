import TokensEditStep from '@/lib/data/history/tokens-edit-step'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

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

  /**
   * @param {Token} token
   * @returns {Segment}
   */
  getSegmentByToken (token) {
    const alignedText = this.getAlignedTextByToken(token)
    return alignedText.segments[token.segmentIndex - 1]
  }

  getNextSegmentByToken (token) {
    const alignedText = this.getAlignedTextByToken(token)
    return alignedText.segments.length > token.segmentIndex ? alignedText.segments[token.segmentIndex] : null
  }

  getPrevSegmentByToken (token) {
    const alignedText = this.getAlignedTextByToken(token)
    return token.segmentIndex > 1 ? alignedText.segments[token.segmentIndex - 2] : null
  }

  /**
   * @param {Token} token
   * @returns {Token} - token on the left hand in the segment
   */
  getPrevToken (token) {
    const segment = this.getSegmentByToken(token)
    const tokenIndex = segment.getTokenIndex(token)

    if (!segment.isFirstTokenInSegment(tokenIndex)) {
      return {
        segment,
        tokenIndex,
        position: TokensEditStep.directions.NEXT,
        tokenMergeTo: segment.getTokenByIndex(tokenIndex - 1)
      }
    }
    return null
  }

  /**
   * @param {Token} token
   * @returns {Token} - token on the right hand in the segment
   */
  getNextToken (token) {
    const segment = this.getSegmentByToken(token)
    const tokenIndex = segment.getTokenIndex(token)

    if (!segment.isLastTokenInSegment(tokenIndex)) {
      return {
        segment,
        tokenIndex,
        position: TokensEditStep.directions.PREV,
        tokenMergeTo: segment.getTokenByIndex(tokenIndex + 1)
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
    const { segment, tokenIndex, tokenMergeTo, position } = (direction === TokensEditStep.directions.PREV) ? this.getPrevToken(token) : this.getNextToken(token)

    if (!this.isEditableToken(tokenMergeTo)) {
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TOKENS_EDIT_IS_NOT_EDITABLE_MERGETO_TOOLTIP'),
        type: NotificationSingleton.types.ERROR
      })
      return false
    }

    const alignedText = this.getAlignedTextByToken(token)
    const newIdWord = alignedText.getNewIdWord({
      token: tokenMergeTo,
      segment,
      changeType: TokensEditStep.types.MERGE
    })

    tokenMergeTo.merge({ token, position, newIdWord })
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

    const tokenWordParts = tokenWord.split(' ')

    token.update({
      word: tokenWordParts[0],
      idWord: newIdWord1
    })

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
    const newSegment = (direction === TokensEditStep.directions.PREV) ? this.getPrevSegmentByToken(token) : this.getNextSegmentByToken(token)

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
    return Boolean(this.getPrevToken(token))
  }

  /**
   * Check if the token could be merged with the next
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedMergeNext (token) {
    return Boolean(this.getNextToken(token))
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
    return !this.getNextToken(token) && Boolean(this.getNextSegmentByToken(token))
  }

  /**
   * Check if the token could be moved to the previous segment
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedToPrevSegment (token) {
    return !this.getPrevToken(token) && Boolean(this.getPrevSegmentByToken(token))
  }

  /**
   * Check if the token could be deleted
   * @param {Token} token
   * @returns {Boolean}
   */
  allowedDelete (token) {
    const alignedText = this.getAlignedTextByToken(token)
    return (!this.getPrevToken(token) && (token.segmentIndex === alignedText.segments[0].index)) ||
           (!this.getNextToken(token) && (token.segmentIndex === alignedText.segments[alignedText.segments.length - 1].index))
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
}
