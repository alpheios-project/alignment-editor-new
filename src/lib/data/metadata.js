import MetadataTerm from '@/lib/data/metadata-term.js'

export default class Metadata {
  constructor (data) {
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
    return this.getProperty(property).addValue(value)
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
      allMeta[property.label] = this.hasProperty(property) ? this.getProperty(property) : { template: true, property, value: null }
    })
    return allMeta
  }
}
