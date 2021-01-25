import TokensEditStep from '@/lib/data/history/tokens-edit-step.js'

import EditorHistory from '@/lib/data/history/editor-history'

export default class TokensEditHistory extends EditorHistory {
  get stepClass () {
    return TokensEditStep
  }
}
