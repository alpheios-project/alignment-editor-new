import StorageController from '@/lib/controllers/storage-controller.js'

export default class HistoryController {
  constructor (store) {
    this.store = store
    this.tabsViewMode = false
    this.undoneSteps = 0
  }

  /**
   * Checks if we have steps to be undone
   * @returns {Boolean} true - undo could be done, false - not
   */
  get redoAvailable () {
    return Boolean(this.alignment) && !this.tabsViewMode &&
           ((this.alignment.hasActiveAlignmentGroup && !this.alignment.currentStepOnLastInActiveGroup) ||
           (this.alignment.hasActiveAlignmentGroup && this.alignment.currentStepOnLastInActiveGroup && (this.undoneSteps > 0)) ||
           (!this.alignment.hasActiveAlignmentGroup && this.alignment.undoneGroups.length > 0))
  }

  /**
   * Checks if we have steps to be redone
   * @returns {Boolean} true - redo could be done, false - not
   */
  get undoAvailable () {
    return Boolean(this.alignment) && !this.tabsViewMode &&
           ((this.alignment.hasActiveAlignmentGroup && this.alignment.activeAlignmentGroup.undoAvailable) ||
           (!this.alignment.hasActiveAlignmentGroup && this.alignment.alignmentGroups.length > 0 && this.alignment.alignmentGroups[this.alignment.alignmentGroups.length - 1].undoAvailable))
  }

  /**
   * Updates tabsViewMode on shownTabs change in align editor
   * @param {Array[String]} shownTabs
   */
  updateMode (shownTabs) {
    this.tabsViewMode = (shownTabs.length > 1)
    this.store.commit('incrementAlignmentUpdated')
  }

  /**
   * Starts saving history for the alignment
   * @param {Alignment} alignment
   */
  startTracking (alignment) {
    this.alignment = alignment
  }

  /**
   * Step back
   *   if there is an active alignment group with more then 1 element, then execute undo inside an active alignment group
   *   if there is an active alignment group with only one element, then we remove the group
   *   if there is no active alignment group but there exists saved alignment groups, then we would activate previous group
   */
  async undo () {
    let result
    if (this.alignment.hasActiveAlignmentGroup && this.alignment.activeAlignmentGroup.groupLen > 1) {
      result = this.alignment.undoInActiveGroup()
    } else if (this.alignment.hasActiveAlignmentGroup && this.alignment.activeAlignmentGroup.groupLen === 1) {
      result = this.alignment.undoActiveGroup()
    } else if (!this.alignment.hasActiveAlignmentGroup && this.alignment.alignmentGroups.length > 0) {
      result = this.alignment.activateGroupByGroupIndex(this.alignment.alignmentGroups.length - 1)
      await this.deleteAlGroupFromStorage(this.alignment.activeAlignmentGroup.id)
    }
    
    if (result) {
      this.store.commit('incrementAlignmentUpdated')
      this.undoneSteps = this.undoneSteps + 1
      await StorageController.update(this.alignment, true)
      return result
    }
  }

  /**
   * Step forward
   *   if there is an active alignment group and there are some steps that were undone, then execute redo inside active group
   *   if there is an active alignment group and there are no undone steps, then we simply finish the group
   *   if there is no active alignment group and there are some saved undone groups, then we would reactivate next group from the list
   */
  async redo () {
    let result
    if (this.alignment.hasActiveAlignmentGroup && !this.alignment.currentStepOnLastInActiveGroup) {
      result = this.alignment.redoInActiveGroup()
    } else if (this.alignment.hasActiveAlignmentGroup && this.alignment.currentStepOnLastInActiveGroup && (this.undoneSteps > 0)) {
      result = this.alignment.finishActiveAlignmentGroup()
    } else if (!this.alignment.hasActiveAlignmentGroup && this.alignment.undoneGroups.length > 0) {
      result = this.alignment.redoActiveGroup()
      await this.deleteAlGroupFromStorage(this.alignment.activeAlignmentGroup.id)
    }
    if (result) {
      this.store.commit('incrementAlignmentUpdated')
      this.undoneSteps = this.undoneSteps - 1
      await StorageController.update(this.alignment, true)
      return result
    }
  }

  /**
   * Clear alignment and start over
   */
  startOver (alignment) {
    this.tabsViewMode = false
    this.undoneSteps = 0
    this.startTracking(alignment)
  }

  deleteAlGroupFromStorage (alGroupItemID) {
    StorageController.deleteMany({
      userID: this.alignment.userID,
      alignmentID: this.alignment.id,
      alGroupItemID
    }, 'alignmentGroupByID')
  }
}
