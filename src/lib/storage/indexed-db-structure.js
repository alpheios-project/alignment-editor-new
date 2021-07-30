export default class IndexedDBStructure {
  static get dbVersion () {
    return 7
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
      partNums: this.partNumsStructure,
      tokens: this.tokensStructure,
      alGroups: this.alGroupsStructure,
      annotations: this.annotationsStructure
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

  static get partNumsStructure () {
    return {
      name: 'ALEditorPartNums',
      structure: {
        keyPath: 'ID',
        indexes: [
          { indexName: 'ID', keyPath: 'ID', unique: true },
          { indexName: 'alignmentID', keyPath: 'alignmentID', unique: false },
          { indexName: 'userID', keyPath: 'userID', unique: false },
          { indexName: 'alTextIdSegId', keyPath: 'alTextIdSegId', unique: false }
        ]
      },
      serialize: this.serializePartNums.bind(this)
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
          { indexName: 'alTextIdSegIndex', keyPath: 'alTextIdSegId', unique: false },
          { indexName: 'alTextIdSegIdPartNum', keyPath: 'alTextIdSegIdPartNum', unique: false },
          { indexName: 'alIDPartNum', keyPath: 'alIDPartNum', unique: false }
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

  static get annotationsStructure () {
    return {
      name: 'ALEditorAnnotations ',
      structure: {
        keyPath: 'ID',
        indexes: [
          { indexName: 'ID', keyPath: 'ID', unique: true },
          { indexName: 'alignmentID', keyPath: 'alignmentID', unique: false },
          { indexName: 'userID', keyPath: 'userID', unique: false },
          { indexName: 'fullTokenId', keyPath: 'fullTokenId', unique: false }
        ]
      },
      serialize: this.serializeAnnotations.bind(this)
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
      langsList: data.langsList,
      hasTokens: data.hasTokens
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
      const dataItems = Object.values(data.targets).filter(target => target.alignedText).map(target => target.alignedText)
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
      const dataItems = Object.values(data.targets).filter(target => target.alignedText).map(target => target.alignedText)
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

  static serializePartNums (data) {
    const finalData = []

    if (data.origin.alignedText) {
      const dataItems = Object.values(data.targets).filter(target => target.alignedText).map(target => target.alignedText)
      dataItems.unshift(data.origin.alignedText)

      for (const dataItem of dataItems) {
        if (dataItem.segments && dataItem.segments.length > 0) {
          for (const segmentItem of dataItem.segments) {
            for (const partNumItem of segmentItem.partNums) {
              const uniqueID = `${data.userID}-${data.id}-${dataItem.textId}-${segmentItem.index}-${partNumItem.partNum}`

              finalData.push({
                ID: uniqueID,
                alignmentID: data.id,
                userID: data.userID,
                alTextIdSegId: `${data.id}-${dataItem.textId}-${segmentItem.index}`,
                textId: dataItem.textId,
                segmentIndex: partNumItem.segmentIndex,
                partNum: partNumItem.partNum,
                len: partNumItem.len
              })
            }
          }
        }
      }
      return finalData
    }
  }

  static serializeTokens (data) {
    const finalData = []

    if (data.origin.alignedText) {
      const dataItems = Object.values(data.targets).filter(target => target.alignedText).map(target => target.alignedText)
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
                alTextIdSegIndex: `${data.userID}-${data.id}-${dataItem.textId}-${tokenItem.segmentIndex}`,
                alTextIdSegIdPartNum: `${data.userID}-${data.id}-${dataItem.textId}-${tokenItem.segmentIndex}-${tokenItem.partNum}`,
                alIDPartNum: `${data.userID}-${data.id}-${tokenItem.partNum}`,
                textId: dataItem.textId,

                textType: tokenItem.textType,
                idWord: tokenItem.idWord,
                word: tokenItem.word,
                segmentIndex: tokenItem.segmentIndex,
                docSourceId: segmentItem.docSourceId,
                sentenceIndex: tokenItem.sentenceIndex,
                tokenIndex: tokenItem.tokenIndex,
                partNum: tokenItem.partNum,

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

  static serializeAnnotations (data) {
    const finalData = []
    for (const annotation of data.annotations) {
      const uniqueID = `${data.userID}-${data.id}-${annotation.id}`

      finalData.push({
        ID: uniqueID,
        alignmentID: data.id,
        userID: data.userID,
        fullTokenId: `${data.userID}-${data.id}-${annotation.tokenData.idWord}`,

        annotationId: annotation.id,
        tokenData: annotation.tokenData,
        type: annotation.type,
        text: annotation.text
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
      alignmentByAlIDQueryAllTokens: this.prepareAlignmentByAlIDQueryAllTokens.bind(this),
      alignmentByAlIDQuery: this.prepareAlignmentByAlIDQuery.bind(this),
      tokensByPartNum: this.prepareTokensByPartNumQuery.bind(this),
      allTokensByAlIDQuery: this.prepareAllTokensByAlIDQueryQuery.bind(this)
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
    return this.prepareAlignmentByAlIDQueryTemp(indexData, 1)
  }

  static prepareAlignmentByAlIDQueryAllTokens (indexData) {
    return this.prepareAlignmentByAlIDQueryTemp(indexData)
  }

  static prepareAlignmentByAlIDQueryTemp (indexData, partNum) {
    const tokensCondition = partNum ? {
      indexName: 'alIDPartNum',
      value: `${indexData.userID}-${indexData.alignmentID}-1`,
      type: 'only'
    } : {
      indexName: 'alignmentID',
      value: indexData.alignmentID,
      type: 'only'
    }

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
        objectStoreName: this.allObjectStoreData.partNums.name,
        condition: {
          indexName: 'alignmentID',
          value: indexData.alignmentID,
          type: 'only'
        },
        resultType: 'multiple',
        mergeData: {
          mergeBy: ['alignmentID', 'textId'],
          uploadTo: 'partNums'
        }
      },
      {
        objectStoreName: this.allObjectStoreData.tokens.name,
        condition: tokensCondition,
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
      },
      {
        objectStoreName: this.allObjectStoreData.annotations.name,
        condition: {
          indexName: 'alignmentID',
          value: indexData.alignmentID,
          type: 'only'
        },
        resultType: 'multiple',
        mergeData: {
          mergeBy: ['alignmentID'],
          uploadTo: 'annotations'
        }
      }
    ]
  }

  static prepareTokensByPartNumQuery (indexData) {
    return [
      {
        objectStoreName: this.allObjectStoreData.tokens.name,
        condition: {
          indexName: 'alTextIdSegIdPartNum',
          value: `${indexData.userID}-${indexData.alignmentID}-${indexData.textId}-${indexData.segmentIndex}-${indexData.partNum}`,
          type: 'only'
        },
        resultType: 'multiple'
      }
    ]
  }

  static prepareAllTokensByAlIDQueryQuery (indexData) {
    return [
      {
        objectStoreName: this.allObjectStoreData.tokens.name,
        condition: {
          indexName: 'alignmentID',
          value: indexData.alignmentID,
          type: 'only'
        },
        resultType: 'multiple'
      }
    ]
  }

  /** ** Delete queries */
  static prepareDeleteQuery (typeQuery, indexData) {
    const typeQueryList = {
      alignmentDataByID: this.prepareDeleteAlignmentDataByID.bind(this),
      fullAlignmentByID: this.prepareDeleteFullAlignmentByID.bind(this),
      alignmentGroupByID: this.prepareDeleteAlignmentGroupByID.bind(this),
      allPartNum: this.prepareDeleteAllPartNum.bind(this),
      annotationByID: this.prepareDeleteAnnotationByID.bind(this)
    }
    return typeQueryList[typeQuery](indexData)
  }

  static prepareDeleteAnnotationByID (indexData) {
    return [{
      objectStoreName: this.allObjectStoreData.annotations.name,
      condition: {
        indexName: 'ID',
        value: `${indexData.userID}-${indexData.alignmentID}-${indexData.annotationId}`,
        type: 'only'
      }
    }]
  }

  static prepareDeleteAllPartNum (indexData) {
    return [{
      objectStoreName: this.allObjectStoreData.tokens.name,
      condition: {
        indexName: 'alTextIdSegIdPartNum',
        value: `${indexData.userID}-${indexData.alignmentID}-${indexData.textId}-${indexData.segmentIndex}-${indexData.partNum}`,
        type: 'only'
      }
    }]
  }

  static prepareDeleteAlignmentGroupByID (indexData) {
    return [{
      objectStoreName: this.allObjectStoreData.alGroups.name,
      condition: {
        indexName: 'ID',
        value: `${indexData.userID}-${indexData.alignmentID}-${indexData.alGroupItemID}`,
        type: 'only'
      }
    }]
  }

  static prepareDeleteFullAlignmentByID (alignmentID) {
    const queries = this.prepareDeleteAlignmentDataByID(alignmentID)
    queries.push({
      objectStoreName: this.allObjectStoreData.common.name,
      condition: {
        indexName: 'alignmentID',
        value: alignmentID,
        type: 'only'
      }
    })
    return queries
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
      objectStoreName: this.allObjectStoreData.partNums.name,
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
