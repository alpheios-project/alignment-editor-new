import TokensEditStep from '@/lib/data/history/tokens-edit-step.js'

import EditorHistory from '@/lib/data/history/editor-history'
import HistoryStep from '@/lib/data/history/history-step.js'

export default class TokensEditHistory extends EditorHistory {
  get stepClass () {
    return TokensEditStep
  }

  prepareDataForIndexedDBCorrect (step) {
    const onlyToken = [HistoryStep.types.UPDATE, HistoryStep.types.SPLIT, HistoryStep.types.ADD_LINE_BREAK, HistoryStep.types.REMOVE_LINE_BREAK]

    if (onlyToken.includes(step.type)) {
      return { type: step.type, token: step.token }
    } else if (step.type === HistoryStep.types.MERGE) {
      const data = { type: step.type, token: step.token }
      if (step.params.mergedToken && (step.params.mergedToken.partNum !== step.token.partNum)) {
        data.mergedToken = step.params.mergedToken
      }
      return data
    } else if ((step.type === HistoryStep.types.TO_NEXT_SEGMENT) || (step.type === HistoryStep.types.TO_PREV_SEGMENT)) {
      let newSegmentIndex, newPartNum
      if (step.token.segmentIndex === step.params.newSegmentIndex) {
        newSegmentIndex = step.params.wasSegmentIndex
        newPartNum = step.params.wasPartNum
      } else {
        newSegmentIndex = step.params.newSegmentIndex
        newPartNum = step.params.newPartNum
      }

      return { type: step.type, token: step.token, newSegmentIndex, newPartNum }
    } else if (step.type === HistoryStep.types.NEW) {
      const checkToken = (step.params.insertType === 'start') ? step.params.segmentToInsert.tokens[0] : step.params.segmentToInsert.tokens[step.params.segmentToInsert.tokens.length - 1]
      return { type: step.type, token: checkToken }
    } else if (step.type === HistoryStep.types.DELETE) {
      return { type: step.type, token: step.params.deletedToken }
    }
  }

  tokenWasEdited (token) {
    return this.steps.some(step => step.token === token)
  }
}
