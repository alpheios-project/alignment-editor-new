import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'

export default class EditorHistory {
  constructor (allStepActions) {
    this.steps = []
    this.currentStepIndex = null
    this.allStepActions = allStepActions
  }

  /**
   * @returns {Boolean} true - there are no undone steps inside the group, false - there are steps that could be redo
   */
  get currentStepOnLast () {
    return (this.currentStepIndex !== null) && (this.currentStepIndex === this.steps.length - 1)
  }

  /**
   * Truncates steps to the currentStepIndex
   */
  truncateSteps () {
    if ((this.currentStepIndex !== null) && !this.currentStepOnLast) {
      this.steps = this.steps.slice(0, this.currentStepIndex + 1)
    }
  }

  /**
   * Redefines currentStepIndex as the last one (no redo steps)
   */
  defineCurrentStepIndex () {
    this.currentStepIndex = this.steps.length - 1
  }

  addStep (token, stepType, params) {
    this.steps.push(new this.stepClass(token, stepType, params)) // eslint-disable-line new-cap
    this.defineCurrentStepIndex()
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
    const dataIndexedDB = []

    if (this.currentStepIndex > stepIndex) {
      for (let i = this.currentStepIndex; i > stepIndex; i--) {
        const dataResult = this.doStepAction(i, 'remove')

        result = result && dataResult.result
        if (dataResult.data) { data.push(dataResult.data) }
        dataIndexedDB.push(dataResult.dataIndexedDB)
      }
    } else if (this.currentStepIndex < stepIndex) {
      for (let i = this.currentStepIndex + 1; i <= stepIndex; i++) {
        const dataResult = this.doStepAction(i, 'apply')
        result = result && dataResult.result
        if (dataResult.data) { data.push(dataResult.data) }
        dataIndexedDB.push(dataResult.dataIndexedDB)
      }
    }

    this.currentStepIndex = stepIndex
    return {
      result, data, dataIndexedDB
    }
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
    finalResult.dataIndexedDB = this.prepareDataForIndexedDBCorrect(step)
    return finalResult
  }

  prepareDataForIndexedDBCorrect () {
    return {}
  }

  clearHistory () {
    this.steps = []
    this.currentStepIndex = null
    return true
  }

  updateLastStepWithAnnotations () {

  }
}
