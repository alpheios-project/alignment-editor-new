import MetadataTerm from '@/lib/data/metadata-term.js'

export default class Metadata {
  constructor () {
    this.properties = {}
  }

  static get groups () {
    return {
      alpheios: { label: 'Alpheios', order: 1 },
      dublin: { label: 'Dublin Core', order: 2 },
      common: { label: 'Common', order: 0 }
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
    return Boolean(this.properties[property.label])
  }

  addProperty (property, value, metaId) {
    if (!this.isSupportedProperty(property)) {
      return false
    }

    if (!this.hasProperty(property) && value) {
      this.properties[property.label] = new MetadataTerm(property, value, metaId)
      return true
    } else if (this.hasProperty(property)) {
      if (value) { this.getProperty(property).saveValue(value) } else { delete this.properties[property.label] }
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
      delete this.properties[metadataItem.property.label]
    }
    return true
  }

  getProperty (property) {
    return this.properties[property.label]
  }

  getPropertyValue (property) {
    if (this.hasProperty(property)) {
      return this.getProperty(property).getValue()
    }
    return null
  }

  get allAvailableMetadata () {
    const allMeta = Object.assign({}, Metadata.groups)
    Object.values(allMeta).forEach(metaGroupItem => { metaGroupItem.items = [] })

    Object.values(MetadataTerm.property).forEach(property => {
      allMeta[property.group].items.push(this.hasProperty(property) ? this.getProperty(property) : { template: true, property, value: (property.multivalued ? [null] : null) })
    })

    Object.values(allMeta).forEach(metaGroup => { metaGroup.items.sort((a, b) => a.property.order - b.property.order) })
    return allMeta
  }

  convertToJSON () {
    return {
      properties: Object.values(this.properties).map(prop => prop.convertToJSON())
    }
  }

  convertToJSONLine () {
    return Object.values(this.properties).sort((a, b) => (a.property.order - b.property.order)).map(metadataTerm => metadataTerm.getValue()).join('; ')
  }

  convertToShortJSONLine () {
    const propsToShow = ['TITLE', 'CREATOR', 'DATE_COPYRIGHTED', 'AUTHOR', 'TRANSLATOR']
    const propsValues = propsToShow.map(prop => this.getPropertyValue(MetadataTerm.property[prop])).filter(value => value)

    return propsValues.length > 0 ? propsValues.join('; ') : ''
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

  convertToIndexedDB () {
    return {
      properties: Object.values(this.properties).map(prop => prop.convertToIndexedDB())
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
