import TokensEditStep from '@/lib/data/actions/tokens-edit-step'

export default class TokensEditActions {
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
}
