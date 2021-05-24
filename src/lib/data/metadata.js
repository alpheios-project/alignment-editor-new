import MetadataTerm from '@/lib/data/metadata-term.js'

export default class Metadata {
  constructor () {
    this.properties = {}
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
    if (!this.hasProperty(property)) {
      this.properties[property.label] = new MetadataTerm(property, value, metaId)
      return true
    }
    return this.getProperty(property).saveValue(value)
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
    const allMeta = {}

    Object.values(MetadataTerm.property).forEach(property => {
      allMeta[property.label] = this.hasProperty(property) ? this.getProperty(property) : { template: true, property, value: (property.multivalued ? [null] : null) }
    })
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
    const propsToShow = ['TITLE', 'CREATOR', 'DATE_COPYRIGHTED']
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

    console.info('Metadata data - ', data)
    console.info('Metadata metadata - ', metadata)
    return metadata
  }
}
