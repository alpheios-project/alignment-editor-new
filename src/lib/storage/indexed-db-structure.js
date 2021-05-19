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
      docSource: this.docSourceStructure
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
          { indexName: 'langCode', keyPath: 'langCode', unique: false }
        ]
      },
      serialize: this.serializeDocSource.bind(this)
    }
  }

  static serializeCommon (data) {
    const uniqueID = `${data.userID}-${data.id}`
    return [{
      ID: uniqueID,
      alignmentID: data.id,
      userID: data.userID,
      createdDT: data.createdDT,
      updatedDT: data.updatedDT
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
        text: dataItem.text
      })
    }

    return finalData
  }

  static prepareQuery (objectStoreData, data) {
    console.info('prepareQuery objectStoreData', objectStoreData)
    console.info('prepareQuery data', data)

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
}
