/* eslint-disable no-unused-vars */
import IndexedDBStructure from '@/lib/storage/indexed-db-structure.js'

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

  async update (data) {
    if (!this.available) { return }
    try {
      let result
      for (const objectStoreData of Object.values(IndexedDBStructure.allObjectStoreData)) {
        const query = IndexedDBStructure.prepareQuery(objectStoreData, data)
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
    console.info('_putItem', data)
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
}
