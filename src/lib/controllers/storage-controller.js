import IndexedDBAdapter from '@/lib/storage/indexed-db-adapter.js'

let dbAdapter

export default class StorageController {
  static definedDBAdapter () {
    if (!dbAdapter) {
      dbAdapter = new IndexedDBAdapter()
    }
  }

  static async update (alignment) {
    if (alignment) {
      const result = await dbAdapter.update(alignment.convertToIndexedDB())
      return result
    }
  }
}
