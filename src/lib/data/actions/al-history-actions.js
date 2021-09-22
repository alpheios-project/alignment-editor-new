// import HistoryStep from '@/lib/data/history/history-step.js'
// import TokenizeController from '@/lib/controllers/tokenize-controller.js'

export default class AlHistoryActions {
  constructor ({ alignmentGroups, alignmentHistory }) {
    this.alignmentGroups = alignmentGroups
    this.alignmentHistory = alignmentHistory
  }

  applyStartGroupStep (step) {
    return {
      data: { resStartAlGroup: true, groupId: step.params.groupId, targetId: step.params.targetId, token: step.token }
    }
  }

  removeStartGroupStep (step) {
    return {
      data: { removeActiveAlGroup: true }
    }
  }

  applyActivateGroupStep (step) {
    return {
      data: { reactivateAlGroup: true, groupId: step.params.groupId, targetId: step.params.targetId, token: step.token }
    }
  }

  removeActivateGroupStep (step) {
    return {
      data: { finishActiveAlGroup: true }
    }
  }

  applyAddStep (step) {
    this.activeAlignmentGroup[step.token.textType].push(step.token.idWord)
    return {
      result: true,
      data: { defineFirstStepToken: true }
    }
  }

  removeAddStep (step) {
    const tokenIndex = this.activeAlignmentGroup[step.token.textType].findIndex(tokenId => tokenId === step.token.idWord)
    this.activeAlignmentGroup[step.token.textType].splice(tokenIndex, 1)

    return {
      result: true,
      data: { defineFirstStepToken: true }
    }
  }

  applyRemoveStep (step) {
    const tokenIndex = this.activeAlignmentGroup[step.token.textType].findIndex(tokenId => tokenId === step.token.idWord)
    this.activeAlignmentGroup[step.token.textType].splice(tokenIndex, 1)
    return {
      result: true,
      data: { defineFirstStepToken: true }
    }
  }

  removeRemoveStep (step) {
    this.activeAlignmentGroup[step.token.textType].push(step.token.idWord)
    return {
      result: true,
      data: { defineFirstStepToken: true }
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

  removeMergeStep (step) {
    const dataGroup = this.activeAlignmentGroup.unmerge(step)
    return {
      result: true,
      data: {
        insertGroups: true, dataGroup: dataGroup
      }
    }
  }

  applyMergeStep (step) {
    const tokensGroup = step.token
    this.activeAlignmentGroup.origin.push(...step.token.origin)
    this.activeAlignmentGroup.target.push(...step.token.target)
    return {
      result: true,
      data: { removeGroup: true, tokensGroup }
    }
  }
}
