/* eslint-disable no-unused-vars */
import IndexedDBStructure from '@/lib/storage/indexed-db-structure.js'
import DownloadController from '@/lib/controllers/download-controller.js'
/**
 * An interface to IndexedDB Storage
 */
export default class IndexedDBAdapter {
  /**
   * @param {String} domain the storage domain
   * @param {Object} dbDriver a driver for a specific data type
   */
  constructor () {
    this.available = this._initIndexedDBNamespaces()
    this.errors = []
  }

  merge (initialData, newData, mergeData) {
    if (!initialData) { return newData }
    for (const dataItem of newData) {
      if (initialData[mergeData.mergeBy] === dataItem[mergeData.mergeBy]) {
        if (!initialData[mergeData.uploadTo]) { initialData[mergeData.uploadTo] = [] }
        initialData[mergeData.uploadTo].push(dataItem)
      }
    }
    return initialData
  }

  /**
   * Query for a set of data items
   * @param {Object} params datatype specific query parameters
   * @return Object[] array of data model items
   */
  async select (data, typeQuery) {
    if (!this.available) { return false }
    try {
      let finalResult
      const queries = IndexedDBStructure.prepareSelectQuery(typeQuery, data)
      for (const query of queries) {
        const queryResult = await this._getFromStore(query)
        finalResult = this.merge(finalResult, queryResult, query.mergeData)
      }

      return finalResult
    } catch (error) {
      console.error(error)
      if (error) {
        this.errors.push(error)
      }
    }
  }

  async update (data) {
    if (!this.available) { return false }
    try {
      let result
      for (const objectStoreData of Object.values(IndexedDBStructure.allObjectStoreData)) {
        const query = IndexedDBStructure.prepareUpdateQuery(objectStoreData, data)
        if (query.ready) {
          result = await this._set(query)
        }
      }
      return result
    } catch (error) {
      console.error(error)
      if (error) {
        this.errors.push(error)
      }
    }
  }

  async deleteMany (data, typeQuery) {
    if (!this.available) { return false }
    try {
      const queries = IndexedDBStructure.prepareDeleteQuery(typeQuery, data)
      for (const query of queries) {
        const now1 = DownloadController.timeNow.bind(new Date())()
        console.info('********deleteMany - objectStoreName', now1, query.objectStoreName)
        const queryResult = await this._deleteFromStore(query)
        const now2 = DownloadController.timeNow.bind(new Date())()
        console.info('deleteMany - queryResult', now2, queryResult)
      }
      return true
    } catch (error) {
      if (error) {
        this.errors.push(error)
      }
      return false
    }
  }

  /**
   * This method checks if IndexedDB is used in the current browser
   */
  _initIndexedDBNamespaces () {
    this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    this.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || { READ_WRITE: 'readwrite' } // This line should only be needed if it is needed to support the object's constants for older browsers
    this.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
    if (!this.indexedDB) {
      console.warn("Alpheios warn: your browser doesn't support IndexedDB.")
      return false
    }
    return true
  }

  _openDatabaseRequest () {
    const request = this.indexedDB.open(IndexedDBStructure.dbName, IndexedDBStructure.dbVersion)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      const upgradeTransaction = event.target.transaction
      this._createObjectStores(db, upgradeTransaction)
    }
    return request
  }

  _createObjectStores (db, upgradeTransaction) {
    try {
      for (const objectStoreData of Object.values(IndexedDBStructure.allObjectStoreData)) {
        let objectStore

        if (!db.objectStoreNames.contains(objectStoreData.name)) {
          objectStore = db.createObjectStore(objectStoreData.name, { keyPath: objectStoreData.structure.keyPath })
        } else {
          objectStore = upgradeTransaction.objectStore(objectStoreData.name)
        }
        objectStoreData.structure.indexes.forEach(index => {
          if (!objectStore.indexNames.contains(index.indexName)) {
            objectStore.createIndex(index.indexName, index.keyPath, { unique: index.unique })
          }
        })
      }
    } catch (error) {
      this.errors.push(error)
    }
  }

  async _set (query) {
    const idba = this
    const promiseOpenDB = await new Promise((resolve, reject) => {
      const request = this._openDatabaseRequest()
      request.onsuccess = async (event) => {
        const db = event.target.result
        const rv = await this._putItem(db, query)
        resolve(rv)
      }
      request.onerror = (event) => {
        idba.errors.push(event.target)
        reject(event.target)
      }
    })
    return promiseOpenDB
  }

  /**
   * Internal method to put an item into a database
   * @param {} db the database handle
   * @param {Object} data data item to be updated  in the format
   *                      { objectStoreName: name of the object store,
   *                        dataItems: array of data items to be updated }
   * @return {Promise} resolves to true on success
   */
  async _putItem (db, data) {
    const idba = this
    const promisePut = await new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([data.objectStoreName], 'readwrite')
        transaction.onerror = (event) => {
          idba.errors.push(event.target)
          reject(event.target)
        }
        const objectStore = transaction.objectStore(data.objectStoreName)
        let objectsDone = data.dataItems.length
        for (const dataItem of data.dataItems) {
          const requestPut = objectStore.put(dataItem)

          requestPut.onsuccess = () => {
            objectsDone = objectsDone - 1
            if (objectsDone === 0) {
              resolve(true)
            }
          }
          requestPut.onerror = () => {
            idba.errors.push(event.target)
            reject(event.target)
          }
        }
        if (objectsDone === 0) {
          resolve(true)
        }
      } catch (error) {
        console.error(error)
        if (error) {
          idba.errors.push(error)
        }
      }
    })
    return promisePut
  }

  /**
   * Internal method to get an item from a database store
   * @param {Object} data data item to be retrieved  in the format
   *                      { objectStoreName: name of the object store,
   *                        condition: query parameters }
   * @return {Promise} resolves to the retrieved items
   */
  async _getFromStore (query) {
    const idba = this
    const promiseOpenDB = await new Promise((resolve, reject) => {
      const request = this._openDatabaseRequest()
      request.onsuccess = (event) => {
        try {
          const db = event.target.result
          const transaction = db.transaction([query.objectStoreName])

          const objectStore = transaction.objectStore(query.objectStoreName)
          const index = objectStore.index(query.condition.indexName)
          const keyRange = this.IDBKeyRange[query.condition.type](query.condition.value)

          const requestOpenCursor = index.getAll(keyRange, 0)
          requestOpenCursor.onsuccess = (event) => {
            const finalResult = query.resultType === 'multiple' ? event.target.result : event.target.result[0]
            resolve(finalResult)
          }

          requestOpenCursor.onerror = (event) => {
            idba.errors.push(event.target)
            reject(event.target)
          }
        } catch (error) {
          idba.errors.push(error)
          reject(event.target)
        }
      }
      request.onerror = (event) => {
        reject(event.target)
      }
    })
    return promiseOpenDB
  }

  /**
   * Internal method to delete an item from  a specific data store
   * @param {Object} data data item to be retrieved  in the format
   *                      { objectStoreName: name of the object store,
   *                        condition: query parameters }
   * @return {Promise} resolves to the number of deleted items
   */
  async _deleteFromStore (data) {
    const idba = this
    const promiseOpenDB = await new Promise((resolve, reject) => {
      const request = this._openDatabaseRequest()
      request.onsuccess = (event) => {
        try {
          const db = event.target.result
          const transaction = db.transaction([data.objectStoreName], 'readwrite')
          const objectStore = transaction.objectStore(data.objectStoreName)

          const index = objectStore.index(data.condition.indexName)
          const keyRange = this.IDBKeyRange[data.condition.type](data.condition.value)

          const requestOpenCursor = index.openCursor(keyRange)
          let deletedItems = 0
          requestOpenCursor.onsuccess = (event) => {
            const cursor = event.target.result
            if (cursor) {
              const requestDelete = cursor.delete()
              requestDelete.onerror = (event) => {
                idba.errors.push(event.target)
                reject(event.target)
              }
              requestDelete.onsuccess = (event) => {
                deletedItems = deletedItems + 1
              }
              cursor.continue()
            } else {
              resolve(deletedItems)
            }
          }
        } catch (error) {
          idba.errors.push(error)
          reject(error)
        }
      }

      request.onerror = (event) => {
        idba.errors.push(event.target)
        reject(event.target)
      }
    })

    return promiseOpenDB
  }

  /**
   * Clear all the object stores
   * Used primarily for testing right now
   * TODO needs to be enhanced to support async removal of old database versions
   */
  async clear () {
    const idba = this

    const promiseDB = await new Promise((resolve, reject) => {
      const request = idba.indexedDB.open(IndexedDBStructure.dbName, IndexedDBStructure.dbVersion)
      request.onsuccess = (event) => {
        try {
          const db = event.target.result
          const objectStores = Object.values(IndexedDBStructure.allObjectStoreData)
          let objectStoresRemaining = objectStores.length

          for (const store of objectStores) {
            // open a read/write db transaction, ready for clearing the data
            const transaction = db.transaction([store.name], 'readwrite')
            // create an object store on the transaction
            const objectStore = transaction.objectStore(store.name)
            // Make a request to clear all the data out of the object store
            const objectStoreRequest = objectStore.clear()
            objectStoreRequest.onsuccess = function (event) {
              objectStoresRemaining = objectStoresRemaining - 1
              if (objectStoresRemaining === 0) {
                resolve(true)
              }
            }
            objectStoreRequest.onerror = function (event) {
              idba.errors.push(event.target)
              reject(event.target)
            }
          }
        } catch (error) {
          idba.errors.push(error)
          reject(error)
        }
      }
      request.onerror = (event) => {
        idba.errors.push(event.target)
        reject(event.target)
      }
    })
    return promiseDB
  }
}
