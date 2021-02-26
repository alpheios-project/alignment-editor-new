import { ClientAdapters } from 'alpheios-client-adapters'
const cachedContent = {}

export default class UploadDTSAPI {
  static get rootCollections () {
    return [
      { baseUrl: 'https://dts.alpheios.net/api/dts/', title: 'Alpheios DTS API', type: 'Collection' }
    ]
  }

  static async getCollection (linkData) {
    if (cachedContent[linkData.id]) {
      return cachedContent[linkData.id]
    }

    const data = await ClientAdapters.dtsapiGroup.dtsapi({
      method: 'getCollection',
      params: {
        baseUrl: linkData.baseUrl,
        id: linkData.id
      }
    })

    const collection = data.result
    console.info('collection', collection)
    if ((collection.members.length === 0) && collection.navigation) {
      await ClientAdapters.dtsapiGroup.dtsapi({
        method: 'getNavigation',
        params: {
          baseUrl: linkData.baseUrl,
          id: collection.navigation.id,
          collection
        }
      })
    }

    let content

    if (collection.members.length > 0) {
      content = this.convertCollectionToLinks(collection)
    } else if (collection.navigation && collection.navigation.refs && collection.navigation.refs.length > 0) {
      content = this.convertNavigationToLinks(collection)
    }

    cachedContent[linkData.id] = [...content]
    return content
  }

  static convertCollectionToLinks (collection) {
    const content = []
    collection.members.forEach(dataMember => {
      const link = {
        baseUrl: collection.baseUrl,
        title: dataMember.title,
        id: dataMember.id,
        type: 'Collection'
      }
      content.push(link)
    })
    return content
  }

  static convertNavigationToLinks (collection) {
    const content = []
    collection.navigation.refs.forEach(dataRef => {
      const link = {
        baseUrl: collection.baseUrl,
        title: dataRef,
        id: collection.navigation.id,
        ref: dataRef,
        type: 'Navigation'
      }
      content.push(link)
    })
    return content
  }

  static async getDocument (linkData, refParams) {
    const data = await ClientAdapters.dtsapiGroup.dtsapi({
      method: 'getDocument',
      params: {
        baseUrl: linkData.baseUrl,
        id: linkData.id,
        refParams
      }
    })

    return data.result
  }
}
