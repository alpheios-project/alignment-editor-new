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

  static async update (alignment) {
    if (this.dbAdapterAvailable && alignment) {
      const result = await dbAdapter.update(alignment.convertToIndexedDB())
      return result
    }
  }
}
