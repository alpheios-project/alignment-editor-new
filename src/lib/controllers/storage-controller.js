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

  static async update (alignment, clearFirst = false) {
    if (this.dbAdapterAvailable && alignment && alignment.origin.docSource) {
      if (clearFirst) {
        await this.deleteMany(alignment.id, 'alignmentDataByID')
      }

      const result = await dbAdapter.update(alignment.convertToIndexedDB())
      return result
    }
  }

  static async select (data, typeQuery = 'allAlignmentsByUserID') {
    if (this.dbAdapterAvailable) {
      const result = await dbAdapter.select(data, typeQuery)
      return result
    }
  }

  static async deleteMany (alignmentID, typeQuery) {
    if (this.dbAdapterAvailable) {
      const result = await dbAdapter.deleteMany(alignmentID, typeQuery)
      return result
    }
  }
}
