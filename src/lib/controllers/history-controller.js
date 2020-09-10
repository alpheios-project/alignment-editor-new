export default class HistoryController {
  /**
   * Starts saving history for the alignment
   * @param {Alignment} alignment
   */
  startTracking (alignment) {
    this.alignment = alignment
  }

  /**
   * Step back
   */
  undo () {
    this.undoInActiveGroup()
  }

  /**
   * Step forward
   */
  redo () {
    this.redoInActiveGroup()
  }

  /**
   * Step back inside active group
   */
  undoInActiveGroup () {
    this.alignment.undoInActiveGroup()
  }

  /**
   * Step forward inside active group
   */
  redoInActiveGroup () {
    this.alignment.redoInActiveGroup()
  }
}
