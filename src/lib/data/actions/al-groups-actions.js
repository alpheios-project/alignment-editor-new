// import HistoryStep from '@/lib/data/history/history-step.js'
// import TokenizeController from '@/lib/controllers/tokenize-controller.js'

export default class AlGroupsActions {
  constructor ({ alignmentGroups, alignmentHistory }) {
    this.alignmentGroups = alignmentGroups
    this.alignmentHistory = alignmentHistory
  }

  applyStartGroupStep (step) {
    return {
      data: { resStartAlGroup: true, groupId: step.params.groupId, token: step.token }
    }
  }

  removeStartGroupStep (step) {
    return {
      data: { removeActiveAlGroup: true }
    }
  }

  applyAddStep (step) {
    this.activeAlignmentGroup[step.token.textType].push(step.token.idWord)
    return {
      result: true
    }
  }

  removeAddStep (step) {
    const tokenIndex = this.activeAlignmentGroup[step.token.textType].findIndex(tokenId => tokenId === step.token.idWord)
    this.activeAlignmentGroup[step.token.textType].splice(tokenIndex, 1)

    return {
      result: true
    }
  }

  applyRemoveStep (step) {
    const tokenIndex = this.activeAlignmentGroup[step.token.textType].findIndex(tokenId => tokenId === step.token.idWord)
    this.activeAlignmentGroup[step.token.textType].splice(tokenIndex, 1)
    return {
      result: true
    }
  }

  removeRemoveStep (step) {
    this.activeAlignmentGroup[step.token.textType].push(step.token.idWord)
    return {
      result: true
    }
  }

  removeFinishGroupStep (step) {
    return {
      data: { reactivateAlGroup: true, groupId: step.params.groupId }
    }
  }

  applyFinishGroupStep (step) {
    return {
      data: { finishActiveAlGroup: true }
    }
  }

  removeStepMerge (step) {
    const data = this.activeAlignmentGroup.unmerge(step)
    return {
      result: true,
      data
    }
  }

  applyStepMerge (step) {
    this.activeAlignmentGroup.origin.push(...step.token.origin)
    this.activeAlignmentGroup.target.push(...step.token.target)
    return {
      result: true
    }
  }
}
