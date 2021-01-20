import AlignmentGroupStep from '@/lib/data/history/alignment-group-step.js'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import NotificationSingleton from '@/lib/notifications/notification-singleton'
import EditorHistory from '@/lib/data/history/editor-history'

export default class AlignmentGroupHistory extends EditorHistory {
  constructor (allStepActions) {
    super(allStepActions)
    this.firstStepToken = null
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

  addStep (token, stepType, params) {
    this.steps.push(new AlignmentGroupStep(token, stepType, params))
  }

  /**
   * Redefines currentStepIndex as the last one (no redo steps)
   */
  defineCurrentStepIndex () {
    this.currentStepIndex = this.steps.length - 1
  }

  /**
   * Step back
   * @retuns { Object }
   *         { Boolean } result - true - action was successful, false - was not
   *         { Array } data - additional data, for merge { tokensGroup, indexDeleted }
   */
  undo () {
    if (this.steps.length > 1 && this.currentStepIndex > 0) {
      return this.alignToStep(this.currentStepIndex - 1)
    } else {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_GROUP_UNDO_ERROR'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('ALIGNMENT_GROUP_UNDO_ERROR'),
        type: NotificationSingleton.types.ERROR
      })
    }
  }

  /**
   * Step forward
   */
  redo () {
    if (this.currentStepIndex < (this.steps.length - 1)) {
      return this.alignToStep(this.currentStepIndex + 1)
    } else {
      console.error(L10nSingleton.getMsgS('ALIGNMENT_GROUP_REDO_ERROR'))
      NotificationSingleton.addNotification({
        text: L10nSingleton.getMsgS('ALIGNMENT_GROUP_REDO_ERROR'),
        type: NotificationSingleton.types.ERROR
      })
    }
  }

  /**
   * Defines current position in the step tracker and apply/remove step actions according to the position
   * @param {Number} stepIndex
   * @retuns { Array(Object) } - results of undone steps, for example result of unmerge action
   */
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
