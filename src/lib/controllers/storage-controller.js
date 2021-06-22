import IndexedDBAdapter from '@/lib/storage/indexed-db-adapter.js'

let dbAdapter

export default class StorageController {
  static definedDBAdapter () {
    if (!dbAdapter) {
      dbAdapter = new IndexedDBAdapter()
    }
  }

  static get dbAdapterAvailable () {
    return dbAdapter && dbAdapter.available
  }

  static async update (alignment, clearFirst = false, textAsBlob = false) {
    if (this.dbAdapterAvailable && alignment && alignment.origin.docSource) {
      if (clearFirst) {
        await this.deleteMany(alignment.id, 'alignmentDataByID')
      }

      const result = await dbAdapter.update(alignment.convertToIndexedDB({ textAsBlob }))
      this.printErrors()
      return result
    }
  }

  static async select (data, typeQuery = 'allAlignmentsByUserID') {
    if (this.dbAdapterAvailable) {
      const result = await dbAdapter.select(data, typeQuery)
      this.printErrors()
      return result
    }
  }

  static async deleteMany (indexData, typeQuery) {
    if (this.dbAdapterAvailable) {
      const result = await dbAdapter.deleteMany(indexData, typeQuery)
      this.printErrors()
      return result
    }
  }

  static async clear () {
    if (this.dbAdapterAvailable) {
      const result = await dbAdapter.clear()
      this.printErrors()
      return result
    }
  }

  static printErrors () {
    if (dbAdapter.errors && dbAdapter.errors.length > 0) {
      dbAdapter.errors.forEach(err => console.error(err))
      dbAdapter.errors = []
    }
  }
}
