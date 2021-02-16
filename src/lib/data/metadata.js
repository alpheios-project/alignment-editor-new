import MetadataTerm from '@/lib/data/metadata-term.js'

export default class Metadata {
  constructor () {
    this.properties = {}
  }

  isSupportedProperty (property) {
    return Object.values(MetadataTerm.property).includes(property)
  }

  hasProperty (property) {
    return Boolean(this.properties[property.label])
  }

  addProperty (property, value) {
    if (!this.isSupportedProperty(property)) {
      return false
    }
    if (!this.hasProperty(property)) {
      this.properties[property.label] = new MetadataTerm(property, value)
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
    return Object.values(this.properties).sort((a, b) => (a.order - b.order)).map(metadataTerm => metadataTerm.getValue()).join('; ')
  }

  static convertFromJSON (data) {
    const metadata = new Metadata()
    data.properties.forEach(prop => {
      const metaItem = MetadataTerm.convertFromJSON(prop)
      metadata.addProperty(metaItem.property, metaItem.value)
    })
    return metadata
  }
}
