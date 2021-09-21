import StorageController from '@/lib/controllers/storage-controller.js'

export default class HistoryAlGroupsController {
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
    return Boolean(this.alignment) && !this.tabsViewMode && this.alignment.redoAvailableAlGroups
  }

  /**
   * Checks if we have steps to be redone
   * @returns {Boolean} true - redo could be done, false - not
   */
  get undoAvailable () {
    return Boolean(this.alignment) && !this.tabsViewMode && this.alignment.undoAvailableAlGroups
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
    if (!this.undoAvailable) { return }
    const result = this.alignment.undoAlGroups()
    if (result) {
      this.store.commit('incrementAlignmentUpdated')
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
    if (!this.redoAvailable) { return }
    const result = this.alignment.redoAlGroups()

    if (result) {
      if (result.deleteActiveAlGroupFromStorage) {
        await this.deleteAlGroupFromStorage(this.alignment.activeAlignmentGroup.id)
      }
      this.store.commit('incrementAlignmentUpdated')
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
