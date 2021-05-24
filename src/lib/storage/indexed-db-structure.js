export default class IndexedDBStructure {
  static get dbVersion () {
    return 1
  }

  static get dbName () {
    return 'AlignmentEditorDB'
  }

  static get allObjectStoreData () {
    return {
      common: this.commonStructure,
      docSource: this.docSourceStructure,
      metadata: this.metadataStructure
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
          const uniqueID = `${data.userID}-${data.id}-${dataItem.textId}-${metadataItem.id}`

          finalData.push({
            ID: uniqueID,
            alignmentID: data.id,
            userID: data.userID,
            alTextId: `${data.id}-${dataItem.textId}`,
            textId: dataItem.textId,
            metaId: metadataItem.id,
            property: metadataItem.property,
            value: metadataItem.value
          })
        }
      }
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
    }]
  }
}
