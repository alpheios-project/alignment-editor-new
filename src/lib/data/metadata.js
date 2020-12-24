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
    return this.properties[property.label].addValue(value)
  }

  getMetadata (property) {
    if (this.hasProperty(property)) {
      return this.properties[property.label].getValue()
    }
    return null
  }
}
