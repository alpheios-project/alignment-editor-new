import TokensEditStep from '@/lib/data/history/tokens-edit-step.js'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

export default class TokensEditHistory {
  constructor () {
    this.steps = []
    this.currentStepIndex = null
  }

  addStep (token, stepType, params) {
    this.steps.push(new TokensEditStep(token, stepType, params))
    this.defineCurrentStepIndex()
  }

  defineCurrentStepIndex () {
    this.currentStepIndex = this.steps.length - 1
  }

  get undoAvailable () {
    return (this.steps.length > 0 && this.currentStepIndex > -1)
  }

  get redoAvailable () {
    return (this.steps.length > 0 && this.currentStepIndex < (this.steps.length - 1))
  }

  undo () {
    if (this.undoAvailable) {
      return this.alignToStep(this.currentStepIndex - 1)
    } else {
      console.error(L10nSingleton.getMsgS('TOKENS_EDIT_UNDO_ERROR'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TOKENS_EDIT_UNDO_ERROR'),
        type: NotificationSingleton.types.ERROR
      })
    }
  }

  redo () {
    if (this.redoAvailable) {
      return this.alignToStep(this.currentStepIndex + 1)
    } else {
      console.error(L10nSingleton.getMsgS('TOKENS_EDIT_REDO_ERROR'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('TOKENS_EDIT_REDO_ERROR'),
        type: NotificationSingleton.types.ERROR
      })
    }
  }

  alignToStep (stepIndex) {
    if (this.currentStepIndex === stepIndex) {
      return
    }

    let data = [] // eslint-disable-line prefer-const
    let result = true

    if (this.currentStepIndex > stepIndex) {
      for (let i = this.currentStepIndex; i > stepIndex; i--) {
        const dataResult = this.doStepAction(i, 'remove')
        result = result && dataResult.result
        if (dataResult.data) { data.push(dataResult.data) }
      }
    } else if (this.currentStepIndex < stepIndex) {
      for (let i = this.currentStepIndex + 1; i <= stepIndex; i++) {
        const dataResult = this.doStepAction(i, 'apply')
        result = result && dataResult.result
        if (dataResult.data) { data.push(dataResult.data) }
      }
    }

    this.currentStepIndex = stepIndex
    return {
      result, data
    }
  }

  /**
   * The full list with undo/redo actions - removeStepAction, applyStepAction for all step types
   * used in doStepAction
   */
  get allStepActions () {
    const actions = { remove: {}, apply: {} }
    actions.remove[TokensEditStep.types.UPDATE] = (step) => {
      step.token.update({ word: step.wasWord, idWord: step.wasIdWord })
      return {
        result: true
      }
    }

    actions.apply[TokensEditStep.types.UPDATE] = (step) => {
      step.token.update({ word: step.newWord, idWord: step.newIdWord })
      return {
        result: true
      }
    }
    return actions
  }

  /**
   * Remove/apply step action according to typeAction
   * the following actions are defined - add, remove, merge
   * @param {Number} stepIndex
   * @param {String} typeAction - remove/apply
   */
  doStepAction (stepIndex, typeAction) {
    const step = this.steps[stepIndex]
    if (!step.hasValidType) {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_GROUP_STEP_ERROR', { type: step.type }))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('ALIGNMENT_GROUP_STEP_ERROR', { type: step.type }),
        type: NotificationSingleton.types.ERROR
      })
      return
    }

    const actions = this.allStepActions
    let finalResult
    try {
      finalResult = actions[typeAction][step.type](step)
    } catch (e) {
      console.error(e)
      finalResult = {
        result: false
      }
    }

    return finalResult
  }
}
