export default class HistoryController {
  /**
   * Checks if we have steps to be undone
   * @returns {Boolean} true - undo could be done, false - not
   */
  get redoAvailable () {
    return Boolean(this.alignment) &&
           ((this.alignment.hasActiveAlignment && !this.alignment.currentStepOnLastInActiveGroup) ||
           (this.alignment.hasActiveAlignment && this.alignment.currentStepOnLastInActiveGroup && this.alignment.undoneGroups.length > 0) ||
           (!this.alignment.hasActiveAlignment && this.alignment.undoneGroups.length > 0))
  }

  /**
   * Checks if we have steps to be redone
   * @returns {Boolean} true - redo could be done, false - not
   */
  get undoAvailable () {
    return Boolean(this.alignment) &&
           ((this.alignment.hasActiveAlignment && this.alignment.activeAlignmentGroup.groupLen >= 1) ||
           (!this.alignment.hasActiveAlignment && this.alignment.alignmentGroups.length > 0))
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
  undo () {
    if (this.alignment.hasActiveAlignment && this.alignment.activeAlignmentGroup.groupLen > 1) {
      return this.alignment.undoInActiveGroup()
    }
    if (this.alignment.hasActiveAlignment && this.alignment.activeAlignmentGroup.groupLen === 1) {
      return this.alignment.undoActiveGroup()
    }
    if (!this.alignment.hasActiveAlignment && this.alignment.alignmentGroups.length > 0) {
      return this.alignment.activateGroupByGroupIndex(this.alignment.alignmentGroups.length - 1)
    }
  }

  /**
   * Step forward
   *   if there is an active alignment group and there are some steps that were undone, then execute redo inside active group
   *   if there is an active alignment group and there are no undone steps, then we simply finish the group
   *   if there is no active alignment group and there are some saved undone groups, then we would reactivate next group from the list
   */
  redo () {
    if (this.alignment.hasActiveAlignment && !this.alignment.currentStepOnLastInActiveGroup) {
      return this.alignment.redoInActiveGroup()
    }
    if (this.alignment.hasActiveAlignment && this.alignment.currentStepOnLastInActiveGroup && this.alignment.undoneGroups.length > 0) {
      return this.alignment.returnActiveGroupToList()
    }
    if (!this.alignment.hasActiveAlignment && this.alignment.undoneGroups.length > 0) {
      return this.alignment.redoActiveGroup()
    }
  }
}
