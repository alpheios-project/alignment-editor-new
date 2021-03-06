import { ClientAdapters } from 'alpheios-client-adapters'
import NotificationSingleton from '@/lib/notifications/notification-singleton'
const cachedContent = {}

export default class UploadDTSAPI {
  static get rootCollections () {
    return [
      { baseUrl: 'https://dts.alpheios.net/api/dts/', title: 'Alpheios DTS API', formattedTitle: 'Alpheios DTS API', type: 'collection', id: 'Alpheios DTS API', skipId: true },
      { baseUrl: 'https://betamasaheft.eu/api/dts/', title: 'Beta maṣāḥǝft DTS API', formattedTitle: 'Beta maṣāḥǝft DTS API', type: 'collection', id: 'Beta maṣāḥǝft DTS API', skipId: true }
    ]
  }

  static hasErrors (result) {
    if (result.errors && result.errors.length > 0) {
      result.errors.forEach(err => {
        console.error(err)
        NotificationSingleton.addNotification({
          text: err.message,
          type: NotificationSingleton.types.ERROR
        })
      })

      return true
    }
    return false
  }

  static async getCollection (linkData) {
    const cachedIndex = linkData.page ? `${linkData.id}-${linkData.page}` : linkData.id

    if (cachedContent[cachedIndex]) {
      return cachedContent[cachedIndex]
    }

    const data = await ClientAdapters.dtsapiGroup.dtsapi({
      method: 'getCollection',
      params: {
        baseUrl: linkData.baseUrl,
        id: !linkData.skipId ? linkData.id : null,
        page: linkData.page
      }
    })

    if (this.hasErrors(data)) { return }

    const formattedPagination = data.result.pagination ? Object.assign({ id: data.result.id, baseUrl: data.result.baseUrl }, data.result.pagination) : null
    cachedContent[cachedIndex] = { links: data.result.links, pagination: formattedPagination }

    return { links: data.result.links, pagination: formattedPagination }
  }

  static async getNavigation (linkData) {
    if (cachedContent[linkData.id]) {
      return cachedContent[linkData.id]
    }

    const data = await ClientAdapters.dtsapiGroup.dtsapi({
      method: 'getNavigation',
      params: {
        baseUrl: linkData.baseUrl,
        id: linkData.id,
        resource: linkData.resource
      }
    })

    if (this.hasErrors(data)) { return }

    if (linkData.resource && linkData.resource.refs) {
      cachedContent[linkData.id] = linkData.resource.refsLinks
      return linkData.resource.refsLinks
    }
    return []
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
    if (this.hasErrors(data)) { return }

    const xmlDoc = data.result
    const parser = new DOMParser()
    const dom = parser.parseFromString(xmlDoc, 'application/xml')
    const check = dom.documentElement.nodeName === 'parsererror' ? null : dom.documentElement.nodeName
    let lang
    if (check) {
      const body = dom.documentElement.getElementsByTagName('body')[0]
      if (body) {
        lang = body.getAttribute('xml:lang')
      }

      if (!lang) {
        const divs = dom.documentElement.getElementsByTagName('div')
        if (divs.length > 0) {
          for (let i = 0; i < divs.length; i++) {
            lang = divs[i].getAttribute('xml:lang')
            if (lang) { break }
          }
        }
      }
    }
    return { tei: xmlDoc, lang, extension: 'xml' }
  }
}
