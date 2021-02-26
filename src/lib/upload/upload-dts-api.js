import { ClientAdapters } from 'alpheios-client-adapters'
import NotificationSingleton from '@/lib/notifications/notification-singleton'
const cachedContent = {}

export default class UploadDTSAPI {
  static get rootCollections () {
    return [
      { baseUrl: 'https://dts.alpheios.net/api/dts/', title: 'Alpheios DTS API', type: 'Collection', id: 'Alpheios DTS API', skipId: true },
      { baseUrl: 'https://betamasaheft.eu/api/dts/', title: 'Beta maṣāḥǝft DTS API', type: 'Collection', id: 'Beta maṣāḥǝft DTS API', skipId: true }
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
        id: !linkData.skipId ? linkData.id : null
      }
    })

    if (data.errors && data.errors.length > 0) {
      data.errors.forEach(err => {
        console.error(err)
        NotificationSingleton.addNotification({
          text: err.message,
          type: NotificationSingleton.types.ERROR
        })
      })

      return null
    }

    const collection = data.result

    if ((collection.members.length === 0) && collection.navigation) {
      const result = await ClientAdapters.dtsapiGroup.dtsapi({
        method: 'getNavigation',
        params: {
          baseUrl: linkData.baseUrl,
          id: collection.navigation.id,
          collection
        }
      })
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach(err => {
          console.error(err)
          NotificationSingleton.addNotification({
            text: err.message,
            type: NotificationSingleton.types.ERROR
          })
        })

        return null
      }
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
        totalItems: collection.totalItems,
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
    if (data.errors && data.errors.length > 0) {
      data.errors.forEach(err => {
        console.error(err)
        NotificationSingleton.addNotification({
          text: err.message,
          type: NotificationSingleton.types.ERROR
        })
      })

      return null
    }
    return data.result
  }
}
