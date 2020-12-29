export default class MetadataTerm {
  constructor (property, value) {
    this.property = property
    this.saveValue(value)
  }

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

  get isMultivalued () {
    return this.property.multivalued
  }

  getValue () {
    return this.value
  }

  deleteValueByIndex (valueIndex) {
    if (this.isMultivalued && valueIndex < this.value.length) {
      this.value.splice(valueIndex, 1)
    }
  }
}

MetadataTerm.property = {
  IDENTIFIER: {
    label: 'identifier',
    labell10n: 'METADATA_TERM_LABEL_IDENTIFIER',
    fieldtype: 'URI',
    multivalued: false,
    URI: 'http://purl.org/dc/terms/identifier',
    description: 'An unambiguous reference to the resource within a given context.'
  },
  TITLE: {
    label: 'title',
    labell10n: 'METADATA_TERM_LABEL_TITLE',
    fieldtype: 'string',
    multivalued: false,
    URI: 'http://purl.org/dc/terms/title',
    description: 'A name given to the resource.'
  },
  CREATOR: {
    label: 'creator',
    labell10n: 'METADATA_TERM_LABEL_CREATOR',
    fieldtype: 'string',
    multivalued: true,
    URI: 'http://purl.org/dc/elements/1.1/creator',
    description: 'An entity primarily responsible for making the resource.'
  },
  CONTRIBUTOR: {
    label: 'contributor',
    labell10n: 'METADATA_TERM_LABEL_CONTRIBUTOR',
    fieldtype: 'string',
    multivalued: true,
    URI: 'http://purl.org/dc/elements/1.1/contributor',
    description: 'An entity responsible for making contributions to the resource.'
  },
  PUBLISHER: {
    label: 'publisher',
    labell10n: 'METADATA_TERM_LABEL_PUBLISHER',
    fieldtype: 'string',
    multivalued: false,
    URI: 'http://purl.org/dc/elements/1.1/publisher',
    description: 'An entity responsible for making the resource available.'
  },
  DATE_COPYRIGHTED: {
    label: 'date copyrighted',
    labell10n: 'METADATA_TERM_LABEL_DATE_COPYRIGHTED',
    fieldtype: 'date',
    multivalued: false,
    URI: 'http://purl.org/dc/terms/dateCopyrighted',
    description: 'Date of copyright of the resource.'
  },
  SOURCE: {
    label: 'source',
    fieldtype: 'URI',
    multivalued: false,
    URI: 'http://purl.org/dc/terms/source',
    description: 'A related resource from which the described resource is derived.'
  },
  DESCRIPTION: {
    label: 'description',
    fieldtype: 'string',
    multivalued: false,
    URI: 'http://purl.org/dc/elements/1.1/description',
    description: 'An account of the resource.'
  }
}
