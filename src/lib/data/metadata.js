import MetadataTerm from '@/lib/data/metadata-term.js'

export default class Metadata {
  constructor () {
    this.properties = {}
  }

  static get groups () {
    return {
      alpheios: { key: 'alpheios', label: 'Alpheios', order: 1 },
      dublin: { key: 'dublin', label: 'Dublin Core', order: 2 },
      common: { key: 'common', label: 'Common', order: 0 }
    }
  }

  static get commonGroupLabel () {
    return 'common'
  }

  get isEmpty () {
    return Object.values(MetadataTerm.property).every(property => !this.hasProperty(property))
  }

  isSupportedProperty (property) {
    return Object.values(MetadataTerm.property).includes(property)
  }

  hasProperty (property) {
    return Boolean(this.properties[property.id])
  }

  addProperty (property, value, metaId) {
    if (!this.isSupportedProperty(property)) {
      return false
    }

    if (!this.hasProperty(property) && value) {
      this.properties[property.id] = new MetadataTerm(property, value, metaId)
      return true
    } else if (this.hasProperty(property)) {
      if (value) { this.getProperty(property).saveValue(value) } else { delete this.properties[property.id] }
      return true
    }
    return false
  }

  deleteValueByIndex (metadataItem, termValIndex) {
    if (!this.isSupportedProperty(metadataItem.property)) {
      return false
    }

    metadataItem.deleteValueByIndex(termValIndex)

    if (metadataItem.getValue().length === 0) {
      delete this.properties[metadataItem.property.id]
    }
    return true
  }

  getProperty (property) {
    return this.properties[property.id]
  }

  getPropertyValue (property) {
    if (this.hasProperty(property)) {
      return this.getProperty(property).getValue()
    }
    return null
  }

  allAvailableMetadata (textType) {
    const allMeta = Object.assign({}, Metadata.groups)
    Object.values(allMeta).forEach(metaGroupItem => { metaGroupItem.items = [] })

    Object.values(MetadataTerm.property).forEach(property => {
      if (!property.limitedFor || (property.limitedFor === textType)) {
        allMeta[property.group].items.push(this.hasProperty(property) ? this.getProperty(property) : { template: true, property, value: (property.multivalued ? [null] : null) })
      }
    })

    Object.values(allMeta).forEach(metaGroup => { metaGroup.items.sort((a, b) => a.property.order - b.property.order) })
    return allMeta
  }

  convertToJSON (textType) {
    return {
      properties: Object.values(this.properties).map(prop => prop.convertToJSON(textType))
    }
  }

  convertToJSONLine () {
    return Object.values(this.properties).sort((a, b) => (a.property.order - b.property.order)).map(metadataTerm => metadataTerm.getValue()).join('; ')
  }

  convertToShortJSONLine () {
    const propsToShow = ['TITLE', 'CREATOR', 'DATE_COPYRIGHTED', 'ALPH_AUTHOR', 'ALPH_TRANSLATOR']
    const propsValues = propsToShow.map(prop => this.getPropertyValue(MetadataTerm.property[prop])).filter(value => value)

    const result = propsValues.length > 0 ? propsValues.join('; ') : ''
    return result || this.convertToFilterTitle()
  }

  convertToFilterTitle () {
    const propsToShow = ['FILTER_BUTTON']
    const propsValues = propsToShow.map(prop => this.getPropertyValue(MetadataTerm.property[prop])).filter(value => value)

    return propsValues.length > 0 ? propsValues.join('; ') : ''
  }

  static convertFromJSON (data) {
    const metadata = new Metadata()
    data.properties.forEach(prop => {
      const metaItem = MetadataTerm.convertFromJSON(prop)
      metadata.addProperty(metaItem.property, metaItem.value)
    })
    return metadata
  }

  convertToIndexedDB (textType) {
    return {
      properties: Object.values(this.properties).map(prop => prop.convertToIndexedDB(textType))
    }
  }

  static convertFromIndexedDB (data) {
    const metadata = new Metadata()
    data.forEach(prop => {
      const metaItem = MetadataTerm.convertFromIndexedDB(prop)
      metadata.addProperty(metaItem.property, metaItem.value, metaItem.id)
    })

    return metadata
  }
}
