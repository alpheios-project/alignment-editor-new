export default class IndexedDBStructure {
  static get dbVersion () {
    return 2
  }

  static get dbName () {
    return 'AlignmentEditorDB'
  }

  static get allObjectStoreData () {
    return {
      common: this.commonStructure,
      docSource: this.docSourceStructure,
      metadata: this.metadataStructure,
      alignedText: this.alignedTextStructure,
      segments: this.segmentsStructure,
      tokens: this.tokensStructure,
      alGroups: this.alGroupsStructure
    }
  }

  static get commonStructure () {
    return {
      name: 'ALEditorCommon',
      structure: {
        keyPath: 'ID',
        indexes: [
          { indexName: 'ID', keyPath: 'ID', unique: true },
          { indexName: 'alignmentID', keyPath: 'alignmentID', unique: false },
          { indexName: 'userID', keyPath: 'userID', unique: false }
        ]
      },
      serialize: this.serializeCommon.bind(this)
    }
  }

  static get docSourceStructure () {
    return {
      name: 'ALEditorDocSource',
      structure: {
        keyPath: 'ID',
        indexes: [
          { indexName: 'ID', keyPath: 'ID', unique: true },
          { indexName: 'alignmentID', keyPath: 'alignmentID', unique: false },
          { indexName: 'userID', keyPath: 'userID', unique: false },
          { indexName: 'textId', keyPath: 'textId', unique: false }
        ]
      },
      serialize: this.serializeDocSource.bind(this)
    }
  }

  static get metadataStructure () {
    return {
      name: 'ALEditorMetadata',
      structure: {
        keyPath: 'ID',
        indexes: [
          { indexName: 'ID', keyPath: 'ID', unique: true },
          { indexName: 'alignmentID', keyPath: 'alignmentID', unique: false },
          { indexName: 'userID', keyPath: 'userID', unique: false },
          { indexName: 'alTextId', keyPath: 'alTextId', unique: false }
        ]
      },
      serialize: this.serializeMetadata.bind(this)
    }
  }

  static get alignedTextStructure () {
    return {
      name: 'ALEditorAlignedText',
      structure: {
        keyPath: 'ID',
        indexes: [
          { indexName: 'ID', keyPath: 'ID', unique: true },
          { indexName: 'alignmentID', keyPath: 'alignmentID', unique: false },
          { indexName: 'userID', keyPath: 'userID', unique: false },
          { indexName: 'textId', keyPath: 'textId', unique: false }
        ]
      },
      serialize: this.serializeAlignedText.bind(this)
    }
  }

  static get segmentsStructure () {
    return {
      name: 'ALEditorSegments',
      structure: {
        keyPath: 'ID',
        indexes: [
          { indexName: 'ID', keyPath: 'ID', unique: true },
          { indexName: 'alignmentID', keyPath: 'alignmentID', unique: false },
          { indexName: 'userID', keyPath: 'userID', unique: false },
          { indexName: 'alTextId', keyPath: 'alTextId', unique: false }
        ]
      },
      serialize: this.serializeSegments.bind(this)
    }
  }

  static get tokensStructure () {
    return {
      name: 'ALEditorTokens',
      structure: {
        keyPath: 'ID',
        indexes: [
          { indexName: 'ID', keyPath: 'ID', unique: true },
          { indexName: 'alignmentID', keyPath: 'alignmentID', unique: false },
          { indexName: 'userID', keyPath: 'userID', unique: false },
          { indexName: 'alTextIdSegId', keyPath: 'alTextIdSegId', unique: false },
          { indexName: 'alTextIdSegIdSentId', keyPath: 'alTextIdSegIdSentId', unique: false }
        ]
      },
      serialize: this.serializeTokens.bind(this)
    }
  }

  static get alGroupsStructure () {
    return {
      name: 'ALEditorAlGroups',
      structure: {
        keyPath: 'ID',
        indexes: [
          { indexName: 'ID', keyPath: 'ID', unique: true },
          { indexName: 'alignmentID', keyPath: 'alignmentID', unique: false },
          { indexName: 'userID', keyPath: 'userID', unique: false }
        ]
      },
      serialize: this.serializeAlGroups.bind(this)
    }
  }

  static serializeCommon (data) {
    const uniqueID = `${data.userID}-${data.id}`
    return [{
      ID: uniqueID,
      alignmentID: data.id,
      userID: data.userID,
      createdDT: data.createdDT,
      updatedDT: data.updatedDT,
      langsList: data.langsList
    }]
  }

  static serializeDocSource (data) {
    const finalData = []

    const dataItems = Object.values(data.targets).map(target => target.docSource)
    dataItems.unshift(data.origin.docSource)

    for (const dataItem of dataItems) {
      const uniqueID = `${data.userID}-${data.id}-${dataItem.textType}-${dataItem.textId}`
      finalData.push({
        ID: uniqueID,
        alignmentID: data.id,
        userID: data.userID,
        textType: dataItem.textType,
        textId: dataItem.textId,
        lang: dataItem.lang,
        sourceType: dataItem.sourceType,
        direction: dataItem.direction,
        text: dataItem.text,
        tokenization: dataItem.tokenization
      })
    }

    return finalData
  }

  static serializeMetadata (data) {
    const finalData = []

    const dataItems = Object.values(data.targets).map(target => target.docSource)
    dataItems.unshift(data.origin.docSource)

    for (const dataItem of dataItems) {
      if (dataItem.metadata && dataItem.metadata.properties && dataItem.metadata.properties.length > 0) {
        for (const metadataItem of dataItem.metadata.properties) {
          const uniqueID = `${data.userID}-${data.id}-${dataItem.textId}-${metadataItem.property.replace(' ', '-')}`

          finalData.push({
            ID: uniqueID,
            alignmentID: data.id,
            userID: data.userID,
            alTextId: `${data.id}-${dataItem.textId}`,
            textId: dataItem.textId,
            property: metadataItem.property,
            value: metadataItem.value
          })
        }
      }
    }
    return finalData
  }

  static serializeAlignedText (data) {
    const finalData = []

    if (data.origin.alignedText) {
      const dataItems = Object.values(data.targets).map(target => target.alignedText)
      dataItems.unshift(data.origin.alignedText)

      for (const dataItem of dataItems) {
        const uniqueID = `${data.userID}-${data.id}-${dataItem.textType}-${dataItem.textId}`
        finalData.push({
          ID: uniqueID,
          alignmentID: data.id,
          userID: data.userID,
          textType: dataItem.textType,
          textId: dataItem.textId,
          lang: dataItem.lang,
          sourceType: dataItem.sourceType,
          direction: dataItem.direction,
          tokenPrefix: dataItem.tokenPrefix,
          tokenization: dataItem.tokenization
        })
      }
    }

    return finalData
  }

  static serializeSegments (data) {
    const finalData = []

    if (data.origin.alignedText) {
      const dataItems = Object.values(data.targets).map(target => target.alignedText)
      dataItems.unshift(data.origin.alignedText)
      for (const dataItem of dataItems) {
        if (dataItem.segments && dataItem.segments.length > 0) {
          for (const segmentItem of dataItem.segments) {
            const uniqueID = `${data.userID}-${data.id}-${dataItem.textId}-${segmentItem.index}`

            finalData.push({
              ID: uniqueID,
              alignmentID: data.id,
              userID: data.userID,
              alTextId: `${data.id}-${dataItem.textId}`,
              textId: dataItem.textId,

              index: segmentItem.index,
              textType: segmentItem.textType,
              lang: segmentItem.lang,
              direction: segmentItem.direction,
              docSourceId: segmentItem.docSourceId
            })
          }
        }
      }
    }

    return finalData
  }

  static serializeTokens (data) {
    const finalData = []

    if (data.origin.alignedText) {
      const dataItems = Object.values(data.targets).map(target => target.alignedText)
      dataItems.unshift(data.origin.alignedText)
      for (const dataItem of dataItems) {
        if (dataItem.segments && dataItem.segments.length > 0) {
          for (const segmentItem of dataItem.segments) {
            for (const tokenItem of segmentItem.tokens) {
              const uniqueID = `${data.userID}-${data.id}-${dataItem.textId}-${tokenItem.segmentIndex}-${tokenItem.idWord}`

              finalData.push({
                ID: uniqueID,
                alignmentID: data.id,
                userID: data.userID,
                alTextIdSegIndex: `${data.id}-${dataItem.textId}-${tokenItem.segmentIndex}`,
                alTextIdSegIdSentId: `${data.id}-${dataItem.textId}-${tokenItem.segmentIndex}-${tokenItem.sentenceIndex}`,
                textId: dataItem.textId,

                textType: tokenItem.textType,
                idWord: tokenItem.idWord,
                word: tokenItem.word,
                segmentIndex: tokenItem.segmentIndex,
                docSourceId: segmentItem.docSourceId,
                sentenceIndex: tokenItem.sentenceIndex,
                tokenIndex: tokenItem.tokenIndex,

                beforeWord: tokenItem.beforeWord,
                afterWord: tokenItem.afterWord,
                hasLineBreak: tokenItem.hasLineBreak
              })
            }
          }
        }
      }
    }

    return finalData
  }

  static serializeAlGroups (data) {
    const finalData = []
    for (const alGroupItem of data.alignmentGroups) {
      const uniqueID = `${data.userID}-${data.id}-${alGroupItem.id}`

      finalData.push({
        ID: uniqueID,
        alignmentID: data.id,
        userID: data.userID,

        alGroupId: alGroupItem.id,
        segmentIndex: alGroupItem.actions.segmentIndex,
        targetId: alGroupItem.actions.targetId,
        origin: alGroupItem.actions.origin,
        target: alGroupItem.actions.target
      })
    }

    return finalData
  }

  static prepareUpdateQuery (objectStoreData, data) {
    const dataItems = objectStoreData.serialize(data)
    if (dataItems && dataItems.length > 0) {
      return {
        objectStoreName: objectStoreData.name,
        dataItems,
        ready: true
      }
    }
    return { ready: false }
  }

  static prepareSelectQuery (typeQuery, indexData) {
    const typeQueryList = {
      allAlignmentsByUserID: this.prepareAllAlignmentsByUserIDQuery.bind(this),
      alignmentByAlIDQuery: this.prepareAlignmentByAlIDQuery.bind(this)
    }
    return typeQueryList[typeQuery](indexData)
  }

  static prepareAllAlignmentsByUserIDQuery (indexData) {
    return [
      {
        objectStoreName: this.allObjectStoreData.common.name,
        condition: {
          indexName: 'userID',
          value: indexData.userID,
          type: 'only'
        },
        resultType: 'multiple'
      }
    ]
  }

  static prepareAlignmentByAlIDQuery (indexData) {
    return [
      {
        objectStoreName: this.allObjectStoreData.common.name,
        condition: {
          indexName: 'alignmentID',
          value: indexData.alignmentID,
          type: 'only'
        },
        resultType: 'single'
      },
      {
        objectStoreName: this.allObjectStoreData.docSource.name,
        condition: {
          indexName: 'alignmentID',
          value: indexData.alignmentID,
          type: 'only'
        },
        resultType: 'multiple',
        mergeData: {
          mergeBy: 'alignmentID',
          uploadTo: 'docSource'
        }
      },
      {
        objectStoreName: this.allObjectStoreData.metadata.name,
        condition: {
          indexName: 'alignmentID',
          value: indexData.alignmentID,
          type: 'only'
        },
        resultType: 'multiple',
        mergeData: {
          mergeBy: ['alignmentID', 'textId'],
          uploadTo: 'metadata'
        }
      },
      {
        objectStoreName: this.allObjectStoreData.alignedText.name,
        condition: {
          indexName: 'alignmentID',
          value: indexData.alignmentID,
          type: 'only'
        },
        resultType: 'multiple',
        mergeData: {
          mergeBy: 'alignmentID',
          uploadTo: 'alignedText'
        }
      },
      {
        objectStoreName: this.allObjectStoreData.segments.name,
        condition: {
          indexName: 'alignmentID',
          value: indexData.alignmentID,
          type: 'only'
        },
        resultType: 'multiple',
        mergeData: {
          mergeBy: ['alignmentID', 'textId'],
          uploadTo: 'segments'
        }
      },
      {
        objectStoreName: this.allObjectStoreData.tokens.name,
        condition: {
          indexName: 'alignmentID',
          value: indexData.alignmentID,
          type: 'only'
        },
        resultType: 'multiple',
        mergeData: {
          mergeBy: ['alignmentID', 'textId'],
          uploadTo: 'tokens'
        }
      },
      {
        objectStoreName: this.allObjectStoreData.alGroups.name,
        condition: {
          indexName: 'alignmentID',
          value: indexData.alignmentID,
          type: 'only'
        },
        resultType: 'multiple',
        mergeData: {
          mergeBy: ['alignmentID'],
          uploadTo: 'alignmentGroups'
        }
      }
    ]
  }

  static prepareDeleteQuery (typeQuery, indexData) {
    const typeQueryList = {
      alignmentDataByID: this.prepareDeleteAlignmentDataByID.bind(this)
    }
    return typeQueryList[typeQuery](indexData)
  }

  static prepareDeleteAlignmentDataByID (alignmentID) {
    return [{
      objectStoreName: this.allObjectStoreData.docSource.name,
      condition: {
        indexName: 'alignmentID',
        value: alignmentID,
        type: 'only'
      }
    },
    {
      objectStoreName: this.allObjectStoreData.metadata.name,
      condition: {
        indexName: 'alignmentID',
        value: alignmentID,
        type: 'only'
      }
    },
    {
      objectStoreName: this.allObjectStoreData.alignedText.name,
      condition: {
        indexName: 'alignmentID',
        value: alignmentID,
        type: 'only'
      }
    },
    {
      objectStoreName: this.allObjectStoreData.segments.name,
      condition: {
        indexName: 'alignmentID',
        value: alignmentID,
        type: 'only'
      }
    },
    {
      objectStoreName: this.allObjectStoreData.tokens.name,
      condition: {
        indexName: 'alignmentID',
        value: alignmentID,
        type: 'only'
      }
    },
    {
      objectStoreName: this.allObjectStoreData.alGroups.name,
      condition: {
        indexName: 'alignmentID',
        value: alignmentID,
        type: 'only'
      }
    }
    ]
  }
}
