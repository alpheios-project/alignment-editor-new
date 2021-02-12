export default class GroupUtility {
  static allTargetTextsIds (fullData) {
    return Object.keys(fullData.targets)
  }

  static isShownTab (shownTabs, targetId) {
    return shownTabs.includes(targetId)
  }

  static allOriginSegments (fullData) {
    let allS = [] // eslint-disable-line prefer-const

    fullData.origin.segments.forEach((segment, indexS) => {
      allS.push({
        index: indexS,
        origin: segment,
        targets: {}
      })
    })
    return allS
  }

  static allShownSegments (fullData, shownTabs) {
    const allS = this.allOriginSegments(fullData)

    this.allTargetTextsIds(fullData).forEach(targetId => {
      if (fullData.targets[targetId].segments && this.isShownTab(shownTabs, targetId)) {
        fullData.targets[targetId].segments.forEach((segment, indexS) => {
          allS[indexS].targets[targetId] = segment
        })
      }
    })
    return allS
  }

  static alignmentGroups (fullData, view = 'full', sentenceCount = 0) {
    let allG = {} // eslint-disable-line prefer-const

    fullData.origin.segments.forEach((segment, segIndex) => {
      segment.tokens.forEach(token => {
        if (token.grouped) {
          token.groupData.forEach(groupDataItem => {
            if (!allG[groupDataItem.groupId]) {
              allG[groupDataItem.groupId] = { targetId: groupDataItem.targetId, segIndex, origin: [], target: [] }
            }
            allG[groupDataItem.groupId].origin.push(token.idWord)
          })
        }
      })
    })

    this.allTargetTextsIds(fullData).forEach(targetId => {
      const metadata = fullData.targets[targetId].metadata
      if (fullData.targets[targetId].segments) {
        fullData.targets[targetId].segments.forEach(segment => {
          segment.tokens.forEach((token, tokenIndex) => {
            if (token.grouped) {
              token.groupData.forEach(groupDataItem => {
                if (!allG[groupDataItem.groupId].metadata) { allG[groupDataItem.groupId].metadata = metadata }

                const currentSentenceIndex = token.sentenceIndex
                if ((view === 'sentence') && (allG[groupDataItem.groupId].target.length === 0)) {
                  allG[groupDataItem.groupId].target = this.collectPrevTokensInSentence(segment, tokenIndex, currentSentenceIndex, sentenceCount, allG[groupDataItem.groupId].target)
                }

                const tokenData = view === 'full' ? token.idWord : token
                allG[groupDataItem.groupId].target.push(tokenData)

                if (view === 'sentence') {
                  allG[groupDataItem.groupId].target = this.collectNextTokensInSentence(segment, tokenIndex, currentSentenceIndex, sentenceCount, allG[groupDataItem.groupId].target)
                }
              })
            }
          })
        })
      }
    })

    return allG
  }

  static collectPrevTokensInSentence (segment, tokenIndex, currentSentenceIndex, sentenceCount, target) {
    let prevToken = tokenIndex > 0 ? segment.tokens[tokenIndex - 1] : null
    if (prevToken && !prevToken.grouped && (Math.abs(prevToken.sentenceIndex - currentSentenceIndex) <= sentenceCount)) {
      let shouldCheckBack = true
      let shouldCheckTokenIndex = tokenIndex - 1

      while (shouldCheckBack && (shouldCheckTokenIndex >= 0)) {
        prevToken = segment.tokens[shouldCheckTokenIndex]
        if (Math.abs(prevToken.sentenceIndex - currentSentenceIndex) <= sentenceCount) {
          target.unshift(prevToken)
          shouldCheckTokenIndex--
        } else {
          shouldCheckBack = false
        }
      }
    }
    return target
  }

  static collectNextTokensInSentence (segment, tokenIndex, currentSentenceIndex, sentenceCount, target) {
    const nextToken = tokenIndex < segment.tokens.length ? segment.tokens[tokenIndex + 1] : null
    if (nextToken && !nextToken.grouped && (Math.abs(nextToken.sentenceIndex - currentSentenceIndex) <= sentenceCount)) {
      let shouldCheckNext = true
      let shouldCheckTokenIndex = tokenIndex + 1

      while (shouldCheckNext && (shouldCheckTokenIndex < segment.tokens.length)) {
        const nextToken = segment.tokens[shouldCheckTokenIndex]
        if (nextToken && !nextToken.grouped && Math.abs(nextToken.sentenceIndex - currentSentenceIndex) <= sentenceCount) {
          target.push(nextToken)
          shouldCheckTokenIndex++
        } else {
          shouldCheckNext = false
        }
      }
    }
    return target
  }
}
