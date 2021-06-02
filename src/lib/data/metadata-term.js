export default class MetadataTerm {
  constructor (property, value) {
    this.property = property
    this.saveValue(value)
  }

  /**
   * Saves new value to MetadataTerm
   * @param {String|Array[String]} value - value for metadataItem - single/multivalued
   */
  saveValue (value) {
    if (!this.property.multivalued) {
      this.value = value
    } else {
      if (!this.value) { this.value = [] }

      if (!Array.isArray(value)) { value = [value] }
      value.forEach(val => {
        if (this.value.indexOf(val) === -1) {
          this.value.push(val)
        }
      })
    }
  }

  /**
   * @returns {Boolean} - true - is Multivalued, false - otherwise
   */
  get isMultivalued () {
    return this.property.multivalued
  }

  /**
   * @returns {String|Array[String]} value - value for metadataItem - single/multivalued
   */
  getValue () {
    return this.value
  }

  /**
   * Delete value from the index
   * @param {Number} valueIndex
   */
  deleteValueByIndex (valueIndex) {
    if (this.isMultivalued && valueIndex < this.value.length) {
      this.value.splice(valueIndex, 1)
    }
  }

  convertToJSON () {
    return {
      property: this.property.label,
      value: this.value
    }
  }

  static convertFromJSON (data) {
    const property = Object.values(MetadataTerm.property).find(prop => prop.label === data.property)
    return new MetadataTerm(property, data.value)
  }
}

MetadataTerm.property = {
  IDENTIFIER: {
    label: 'identifier',
    labell10n: 'METADATA_TERM_LABEL_IDENTIFIER',
    fieldtype: 'URI',
    multivalued: false,
    URI: 'http://purl.org/dc/terms/identifier',
    description: 'An unambiguous reference to the resource within a given context.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_IDENTIFIER',
    order: 8
  },
  TITLE: {
    label: 'title',
    labell10n: 'METADATA_TERM_LABEL_TITLE',
    fieldtype: 'string',
    multivalued: false,
    URI: 'http://purl.org/dc/terms/title',
    description: 'A name given to the resource.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_TITLE',
    order: 1
  },
  CREATOR: {
    label: 'creator',
    labell10n: 'METADATA_TERM_LABEL_CREATOR',
    fieldtype: 'string',
    multivalued: true,
    URI: 'http://purl.org/dc/elements/1.1/creator',
    description: 'An entity primarily responsible for making the resource.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_CREATOR',
    order: 2
  },
  CONTRIBUTOR: {
    label: 'contributor',
    labell10n: 'METADATA_TERM_LABEL_CONTRIBUTOR',
    fieldtype: 'string',
    multivalued: true,
    URI: 'http://purl.org/dc/elements/1.1/contributor',
    description: 'An entity responsible for making contributions to the resource.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_CONTRIBUTOR',
    order: 4
  },
  PUBLISHER: {
    label: 'publisher',
    labell10n: 'METADATA_TERM_LABEL_PUBLISHER',
    fieldtype: 'string',
    multivalued: false,
    URI: 'http://purl.org/dc/elements/1.1/publisher',
    description: 'An entity responsible for making the resource available.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_PUBLISHER',
    order: 5
  },
  DATE_COPYRIGHTED: {
    label: 'date copyrighted',
    labell10n: 'METADATA_TERM_LABEL_DATE_COPYRIGHTED',
    fieldtype: 'date',
    multivalued: false,
    URI: 'http://purl.org/dc/terms/dateCopyrighted',
    description: 'Date of copyright of the resource.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_DATE_COPYRIGHTED',
    order: 3
  },
  SOURCE: {
    label: 'source',
    labell10n: 'METADATA_TERM_LABEL_SOURCE',
    fieldtype: 'URI',
    multivalued: false,
    URI: 'http://purl.org/dc/terms/source',
    description: 'A related resource from which the described resource is derived.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_SOURCE',
    order: 6
  },
  DESCRIPTION: {
    label: 'description',
    labell10n: 'METADATA_TERM_LABEL_DESCRIPTION',
    fieldtype: 'string',
    multivalued: false,
    URI: 'http://purl.org/dc/elements/1.1/description',
    description: 'An account of the resource.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_DESCRIPTION',
    order: 7
  }
}
