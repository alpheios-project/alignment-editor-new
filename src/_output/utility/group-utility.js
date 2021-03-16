export default class GroupUtility {
  /**
   *
   * @param {Object} fullData - json object with full alignment data for output
   * @returns {Array[String]} - array of targetId
   */
  static allTargetTextsIds (fullData) {
    const sortFn = (a, b) => {
      if (fullData.targets[a].langName < fullData.targets[b].langName) { return -1 }
      if (fullData.targets[a].langName > fullData.targets[b].langName) { return 1 }
      return 0
    }

    return Object.keys(fullData.targets).sort(sortFn)
  }

  static allLanguagesTargets (fullData) {
    return this.allTargetTextsIds(fullData).map(targetId => {
      return {
        targetId, lang: fullData.targets[targetId].lang, langName: fullData.targets[targetId].langName, hidden: false
      }
    })
  }

  static targetDataForTabs (fullData) {
    const allTargetIds = this.allTargetTextsIds(fullData)

    const dataForTabs = {}
    allTargetIds.forEach(targetId => {
      dataForTabs[targetId] = fullData.targets[targetId].langName

      const metadata = fullData.targets[targetId].metadataShort
      if (metadata) {
        dataForTabs[targetId] = `${dataForTabs[targetId]} - ${metadata}`
      }
    })
    return dataForTabs
  }

  /**
   *
   * @param {Array[String]} shownTabs - array of targetId that is visible on the screen
   * @param {String} targetId
   * @returns {Boolean} - true - targetId is visible, false - otherwise
   */
  static isShownTab (shownTabs, targetId) {
    return shownTabs.includes(targetId)
  }

  /**
   *
   * @param {Object} fullData - json object with full alignment data for output
   * @returns {Array[Object]} - data with origin segments
   *          {Number} index - segment index
   *          {Object} segment - segment data
   *          {Object} targets - empty object
   */
  static allOriginSegments (fullData) {
    let allS = [] // eslint-disable-line prefer-const

    fullData.origin.segments.forEach((segment, indexS) => {
      allS.push({
        index: indexS,
        origin: segment,
        targets: []
      })
    })
    return allS
  }

  /**
   *
   * @param {Object} fullData - json object with full alignment data for output
   * @param {Array[String]} shownTabs - array of targetId that is visible on the screen
   * @returns {Array[Object]} - data with origin and target segments shown on the screen
   *          {Number} index - segment index
   *          {Object} segment - segment data
   *          {Object} targets - target segments grouped by targetId
   */
  static allShownSegments (fullData, languageTargetIds) {
    const allS = this.allOriginSegments(fullData)

    languageTargetIds.forEach(targetId => {
      const targetSegments = fullData.targets[targetId].segments
      if (targetSegments) {
        targetSegments.forEach((segment, indexS) => {
          allS[indexS].targets.push({ targetId, segment })
        })
      }
    })

    return allS
  }

  static segmentsForColumns (fullData, languageTargetIds, columns = 3) {
    const allS = []
    fullData.origin.segments.forEach((segment, indexS) => {
      segment.textType = 'origin'

      const segmentRows = []
      const textsInsegmentCount = languageTargetIds.length + 1

      for (let i = 1; i <= Math.ceil(textsInsegmentCount / columns); i++) {
        segmentRows.push([])
      }

      segmentRows[0][0] = segment
      allS.push({
        index: indexS,
        segmentRows
      })
    })

    languageTargetIds.forEach((targetId, targetIdIndex) => {
      const targetSegments = fullData.targets[targetId].segments
      const segmentRowIndex = Math.floor((targetIdIndex + 1) / columns)
      const segmentCellIndex = (targetIdIndex + 1) % columns

      if (targetSegments) {
        targetSegments.forEach((segment, indexS) => {
          segment.textType = 'target'
          segment.targetId = targetId
          allS[indexS].segmentRows[segmentRowIndex][segmentCellIndex] = segment
        })
      }
    })

    for (let i = 0; i < allS.length; i++) {
      const allSSegment = allS[i]
      const lastIndex = allSSegment.segmentRows.length - 1
      const currentLength = allSSegment.segmentRows[lastIndex].length

      for (let j = currentLength; j < columns; j++) {
        allSSegment.segmentRows[lastIndex].push([])
      }
    }

    return allS
  }

  /**
   *
   * @param {Object} fullData - json object with full alignment data for output
   * @param {String} view - full, short, sentence, equivalence
   * @param {Number} sentenceCount  - only for sentence view
   * @returns { Object } - all alignment groups - groupId - groupData
   *           {String} targetId
   *           {Number} segIndex - segment index
   *           {Array[String]} origin - array of token.idWord from origin
   *           {Array[String|Object]} target - array of token.idWord for full, token for others from target
   *           {Array[]} targetSentence - empty array - filled only for sentence in collectSentences
   *           {String} metadata - metadata of target
   *           {String} langName - language name of target
   */
  static alignmentGroups (fullData, view = 'full', sentenceCount = 0) {
    let allG = {} // eslint-disable-line prefer-const

    fullData.origin.segments.forEach((segment, segIndex) => {
      segment.tokens.forEach(token => {
        if (token.grouped) {
          token.groupData.forEach(groupDataItem => {
            if (!allG[groupDataItem.groupId]) {
              allG[groupDataItem.groupId] = { targetId: groupDataItem.targetId, segIndex, origin: [], target: [], targetSentence: [] }
            }
            allG[groupDataItem.groupId].origin.push(token.idWord)
          })
        }
      })
    })

    // collect all targets in groups
    this.allTargetTextsIds(fullData).forEach(targetId => {
      const langName = fullData.targets[targetId].langName
      const metadata = fullData.targets[targetId].metadata

      if (fullData.targets[targetId].segments) {
        fullData.targets[targetId].segments.forEach(segment => {
          segment.tokens.forEach(token => {
            if (token.grouped) {
              token.groupData.forEach(groupDataItem => {
                if (!allG[groupDataItem.groupId].metadata) { allG[groupDataItem.groupId].metadata = metadata }
                if (!allG[groupDataItem.groupId].langName) { allG[groupDataItem.groupId].langName = langName }

                const tokenData = (view === 'full') ? token.idWord : token
                allG[groupDataItem.groupId].target.push(tokenData)
              })
            }
          })
        })
      }
    })

    if (view === 'sentence') {
      // collect sentence data
      this.collectSentences(fullData, sentenceCount, allG)
    }

    return allG
  }

  /**
   * Completes targetSentence with an array of tokens of collected sentence
   *
   * @param {Object} fullData - json object with full alignment data for output
   * @param {Number} sentenceCount  - amount of sentence before/after the current sentence; sentences between the first word in the group
   *                                  and the last included by default (even when sentence = 0)
   * @param {Object} allG - allGroups from alignmentGroups
   *           {String} targetId
   *           {Number} segIndex - segment index
   *           {Array[String]} origin - array of token.idWord from origin
   *           {Array[String|Object]} target - array of token.idWord for full, token for others from target
   *           {Array[]} targetSentence -
   *           {String} metadata - metadata of target
   *           {String} langName - language name of target
   *
   */
  static collectSentences (fullData, sentenceCount, allG) {
    this.allTargetTextsIds(fullData).forEach(targetId => {
      if (fullData.targets[targetId].segments) {
        fullData.targets[targetId].segments.forEach(segment => {
          const startedGroups = []

          segment.tokens.forEach((token, tokenIndex) => {
            if (token.grouped) {
              token.groupData.forEach(groupDataItem => {
                // if it is the first token in group
                if (!startedGroups.includes(groupDataItem.groupId)) {
                  startedGroups.push(groupDataItem.groupId)
                  const currentSentenceIndex = token.sentenceIndex

                  allG[groupDataItem.groupId].targetSentence = this.collectPrevTokensInSentence(segment, tokenIndex, currentSentenceIndex, sentenceCount, allG[groupDataItem.groupId].targetSentence)
                  allG[groupDataItem.groupId].targetSentence.push(token)
                } else {
                  allG[groupDataItem.groupId].targetSentence.push(token)

                  // it is the last token
                }
                const lastTarget = allG[groupDataItem.groupId].target[allG[groupDataItem.groupId].target.length - 1].idWord
                if (lastTarget === token.idWord) {
                  const currentSentenceIndex = token.sentenceIndex
                  allG[groupDataItem.groupId].targetSentence = this.collectNextTokensInSentence(segment, tokenIndex, currentSentenceIndex, sentenceCount, allG[groupDataItem.groupId].targetSentence)

                  startedGroups.splice(startedGroups.indexOf(groupDataItem.groupId), 1)
                }
              })
            } else {
              startedGroups.forEach(groupId => {
                allG[groupId].targetSentence.push(token)
              })
            }
          })
        })
      }
    })
  }

  /**
   *
   * @param {Object} segment
   *         {Array[Object]} segment.tokens
   * @param {Number} tokenIndex - token index BEFORE what we would collect tokens in a sentence
   * @param {Number} currentSentenceIndex - sentenceIndex for the current sentenece
   * @param {Number} sentenceCount - amount sentences that would be collected before currentSentenceIndex
   * @param {Array} target - empty array that would be filled with tokens, that are previous to the tokenIndex
   * @returns {Array[Object]} -  array of collected tokens
   */
  static collectPrevTokensInSentence (segment, tokenIndex, currentSentenceIndex, sentenceCount, target) {
    let prevToken = tokenIndex > 0 ? segment.tokens[tokenIndex - 1] : null
    if (prevToken && (Math.abs(prevToken.sentenceIndex - currentSentenceIndex) <= sentenceCount)) {
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

  /**
   *
   * @param {Object} segment
   *         {Array[Object]} segment.tokens
   * @param {Number} tokenIndex - token index AFTER what we would collect tokens in a sentence
   * @param {Number} currentSentenceIndex - sentenceIndex for the current sentenece
   * @param {Number} sentenceCount - amount sentences that would be collected before currentSentenceIndex
   * @param {Array} target - empty array that would be filled with tokens, that are previous to the tokenIndex
   * @returns {Array[Object]} -  array of collected tokens
   */
  static collectNextTokensInSentence (segment, tokenIndex, currentSentenceIndex, sentenceCount, target) {
    const nextToken = tokenIndex < segment.tokens.length ? segment.tokens[tokenIndex + 1] : null

    if (nextToken && (Math.abs(nextToken.sentenceIndex - currentSentenceIndex) <= sentenceCount)) {
      let shouldCheckNext = true
      let shouldCheckTokenIndex = tokenIndex + 1

      while (shouldCheckNext && (shouldCheckTokenIndex < segment.tokens.length)) {
        const nextToken = segment.tokens[shouldCheckTokenIndex]
        if (nextToken && Math.abs(nextToken.sentenceIndex - currentSentenceIndex) <= sentenceCount) {
          target.push(nextToken)
          shouldCheckTokenIndex++
        } else {
          shouldCheckNext = false
        }
      }
    }
    return target
  }

  /**
   *
   * @param {Object} fullData - json object with full alignment data for output
   * @param {Array[Object]} allGroups - all groups from alignmentGroups method
   * @returns {Object} - groups by equivalence - keys: words
   *           {Array[String]} allIds - origin tokens idWords for the current word
   *           {Array[String]} allGroupIds - all groupIds with this origin word
   *           {Array[Array[Object]]} targets - array of targets tokens for this word from alignment groups, each alignment group = each element from array
   *           {Array[Object]} filtered targets
   *              {Number} count - amount of occurance of the group (compared by words)
   *              {Array[Object]} - target - target part of alignment groups (tokens from the first occurance)
   */
  static tokensEquivalentGroups (fullData, allGroups, languageTargetIds) {
    let tokensEq = {} // eslint-disable-line prefer-const
    fullData.origin.segments.forEach((segment, segIndex) => {
      segment.tokens.forEach(token => {
        if (token.grouped) {
          token.groupData.forEach(groupDataItem => {
            if (!tokensEq[token.word]) { tokensEq[token.word] = { allIds: [], allGroupIds: [], targets: {} } }
            tokensEq[token.word].allIds.push(token.idWord)
            tokensEq[token.word].allGroupIds.push(groupDataItem.groupId)

            if (languageTargetIds.includes(groupDataItem.targetId)) {
              if (!tokensEq[token.word].targets[groupDataItem.targetId]) {
                tokensEq[token.word].targets[groupDataItem.targetId] = {
                  langName: allGroups[groupDataItem.groupId].langName,
                  metadata: allGroups[groupDataItem.groupId].metadata,
                  targets: []
                }
              }
              tokensEq[token.word].targets[groupDataItem.targetId].targets.push(allGroups[groupDataItem.groupId].target)
            }
          })
        }
      })
    })

    // collapse the same
    Object.values(tokensEq).forEach(tokenWordData => {
      Object.values(tokenWordData.targets).forEach(targetIdData => {
        let filteredTargets = {} // eslint-disable-line prefer-const

        targetIdData.targets.forEach(targetData => {
          const keyWords = targetData.map(targetItem => targetItem.word).join('_')
          if (!filteredTargets[keyWords]) {
            filteredTargets[keyWords] = { count: 1, target: targetData }
          } else {
            filteredTargets[keyWords].count++
          }
        })

        targetIdData.filteredTargets = filteredTargets
      })
    })

    return tokensEq
  }
}
