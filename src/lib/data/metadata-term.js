import { v4 as uuidv4 } from 'uuid'

export default class MetadataTerm {
  constructor (property, value, metadataId) {
    this.id = metadataId || uuidv4()
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

  convertToIndexedDB () {
    return {
      id: this.id,
      property: this.property.label,
      value: this.value
    }
  }

  static convertFromIndexedDB (data) {
    const property = Object.values(MetadataTerm.property).find(prop => prop.label === data.property)
    return new MetadataTerm(property, data.value, data.metaId)
  }
}

MetadataTerm.property = {
  TITLE: {
    label: 'title',
    labell10n: 'METADATA_TERM_LABEL_TITLE',
    fieldtype: 'string',
    multivalued: false,
    URI: 'http://purl.org/dc/terms/title',
    description: 'A name given to the resource.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_TITLE',
    order: 1,
    group: 'dublin'
  },

  CREATOR: {
    label: 'creator',
    labell10n: 'METADATA_TERM_LABEL_CREATOR',
    fieldtype: 'string',
    multivalued: true,
    URI: 'http://purl.org/dc/elements/1.1/creator',
    description: 'An entity primarily responsible for making the resource.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_CREATOR',
    order: 2,
    group: 'dublin'
  },

  CONTRIBUTOR: {
    label: 'contributor',
    labell10n: 'METADATA_TERM_LABEL_CONTRIBUTOR',
    fieldtype: 'string',
    multivalued: true,
    URI: 'http://purl.org/dc/elements/1.1/contributor',
    description: 'An entity responsible for making contributions to the resource.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_CONTRIBUTOR',
    order: 3,
    group: 'dublin'
  },

  DUBLIN_COVERAGE: {
    label: 'coverage',
    labell10n: 'METADATA_TERM_LABEL_DUBLIN_COVERAGE',
    fieldtype: 'string',
    multivalued: true,
    URI: 'http://purl.org/dc/elements/1.1/coverage',
    description: 'The spatial or temporal topic of the resource, spatial applicability of the resource, or jurisdiction under which the resource is relevant.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_DUBLIN_COVERAGE',
    order: 4,
    group: 'dublin'
  },

  DATE_COPYRIGHTED: {
    label: 'date copyrighted',
    labell10n: 'METADATA_TERM_LABEL_DATE_COPYRIGHTED',
    fieldtype: 'date',
    multivalued: false,
    URI: 'http://purl.org/dc/terms/dateCopyrighted',
    description: 'Date of copyright of the resource.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_DATE_COPYRIGHTED',
    order: 5,
    group: 'dublin'
  },

  DESCRIPTION: {
    label: 'description',
    labell10n: 'METADATA_TERM_LABEL_DESCRIPTION',
    fieldtype: 'string',
    multivalued: false,
    URI: 'http://purl.org/dc/elements/1.1/description',
    description: 'An account of the resource.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_DESCRIPTION',
    order: 6,
    group: 'dublin'
  },

  DUBLIN_FORMAT: {
    label: 'format',
    labell10n: 'METADATA_TERM_LABEL_DUBLIN_FORMAT',
    fieldtype: 'string',
    multivalued: true,
    URI: 'http://purl.org/dc/elements/1.1/format',
    description: 'The file format, physical medium, or dimensions of the resource.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_DUBLIN_FORMAT',
    order: 7,
    group: 'dublin'
  },

  IDENTIFIER: {
    label: 'identifier',
    labell10n: 'METADATA_TERM_LABEL_IDENTIFIER',
    fieldtype: 'URI',
    multivalued: false,
    URI: 'http://purl.org/dc/terms/identifier',
    description: 'An unambiguous reference to the resource within a given context.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_IDENTIFIER',
    order: 8,
    group: 'dublin'
  },

  DUBLIN_LANGUAGE: {
    label: 'language',
    labell10n: 'METADATA_TERM_LABEL_DUBLIN_LANGUAGE',
    fieldtype: 'string',
    multivalued: true,
    URI: 'http://purl.org/dc/elements/1.1/language',
    description: 'A language of the resource.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_DUBLIN_LANGUAGE',
    order: 7,
    group: 'dublin'
  },

  PUBLISHER: {
    label: 'publisher',
    labell10n: 'METADATA_TERM_LABEL_PUBLISHER',
    fieldtype: 'string',
    multivalued: false,
    URI: 'http://purl.org/dc/elements/1.1/publisher',
    description: 'An entity responsible for making the resource available.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_PUBLISHER',
    order: 8,
    group: 'dublin'
  },

  DUBLIN_RELATION: {
    label: 'relation',
    labell10n: 'METADATA_TERM_LABEL_DUBLIN_RELATION',
    fieldtype: 'string',
    multivalued: true,
    URI: 'http://purl.org/dc/elements/1.1/relation',
    description: 'A related resource.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_DUBLIN_RELATION',
    order: 9,
    group: 'dublin'
  },

  DUBLIN_RIGHTS: {
    label: 'rights',
    labell10n: 'METADATA_TERM_LABEL_DUBLIN_RIGHTS',
    fieldtype: 'string',
    multivalued: true,
    URI: 'http://purl.org/dc/elements/1.1/rights',
    description: 'Information about rights held in and over the resource.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_DUBLIN_RIGHTS',
    order: 10,
    group: 'dublin'
  },

  SOURCE: {
    label: 'source',
    labell10n: 'METADATA_TERM_LABEL_SOURCE',
    fieldtype: 'URI',
    multivalued: false,
    URI: 'http://purl.org/dc/terms/source',
    description: 'A related resource from which the described resource is derived.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_SOURCE',
    order: 11,
    group: 'dublin'
  },

  DUBLIN_SUBJECT: {
    label: 'subject',
    labell10n: 'METADATA_TERM_LABEL_DUBLIN_SUBJECT',
    fieldtype: 'string',
    multivalued: true,
    URI: 'http://purl.org/dc/elements/1.1/subject',
    description: 'The topic of the resource.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_DUBLIN_SUBJECT',
    order: 12,
    group: 'dublin'
  },

  DUBLIN_TYPE: {
    label: 'type',
    labell10n: 'METADATA_TERM_LABEL_DUBLIN_TYPE',
    fieldtype: 'string',
    multivalued: true,
    URI: 'http://purl.org/dc/elements/1.1/type',
    description: 'The nature or genre of the resource.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_DUBLIN_TYPE',
    order: 13,
    group: 'dublin'
  },

  ALPH_TITLE: {
    label: 'title',
    labell10n: 'METADATA_TERM_LABEL_TITLE',
    fieldtype: 'string',
    multivalued: false,
    description: '',
    descriptionl10n: '',
    orderVariants: {
      origin: 1,
      target: 6
    },
    group: 'alpheios'
  },
  ALPH_AUTHOR: {
    synonim: 'AUTHOR',
    limitedFor: 'origin',
    label: 'author',
    labell10n: 'METADATA_TERM_LABEL_ALPH_AUTHOR',
    fieldtype: 'string',
    multivalued: false,
    description: 'Homer, Ford Maddox Ford',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_ALPH_AUTHOR',
    order: 2,
    group: 'alpheios'
  },
  ALPH_TRANSLATOR: {
    synonim: 'TRANSLATOR',
    limitedFor: 'target',
    label: 'translator',
    labell10n: 'METADATA_TERM_LABEL_TRANSLATOR',
    fieldtype: 'string',
    multivalued: false,
    description: '',
    descriptionl10n: '',
    order: 1,
    group: 'alpheios'
  },
  ALPH_YEAR_WRITTEN: {
    limitedFor: 'origin',
    label: 'year written',
    labell10n: 'METADATA_TERM_LABEL_ALPH_YEAR_WRITTEN',
    fieldtype: 'string',
    multivalued: false,
    description: '1240, 1240-1245',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_ALPH_YEAR_WRITTEN',
    order: 3,
    group: 'alpheios'
  },
  ALPH_YEAR_FIRST_PUBLISHED: {
    limitedFor: 'origin',
    label: 'year first published',
    labell10n: 'METADATA_TERM_LABEL_ALPH_YEAR_FIRST_PUBLISHED',
    fieldtype: 'string',
    multivalued: false,
    description: '1240, 1240-1245',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_ALPH_YEAR_FIRST_PUBLISHED',
    order: 4,
    group: 'alpheios'
  },

  ALPH_LANGUAGE: {
    label: {
      origin: 'original language',
      target: 'translation language'
    },
    labell10n: {
      origin: 'METADATA_TERM_LABEL_ALPH_ORIGIN_LANGUAGE',
      target: 'METADATA_TERM_LABEL_ALPH_TARGET_LANGUAGE'
    },
    fieldtype: 'string',
    multivalued: false,
    description: '',
    descriptionl10n: '',
    orderVariants: {
      origin: 5,
      target: 2
    },
    group: 'alpheios'
  },

  ALPH_EDITION_YEAR: {
    limitedFor: 'origin',
    label: 'edition year',
    labell10n: 'METADATA_TERM_LABEL_ALPH_EDITION_YEAR',
    fieldtype: 'string',
    multivalued: false,
    description: '1919',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_ALPH_EDITION_YEAR',
    order: 6,
    group: 'alpheios'
  },
  ALPH_EDITOR: {
    limitedFor: 'origin',
    label: 'editor',
    labell10n: 'METADATA_TERM_LABEL_ALPH_EDITOR',
    fieldtype: 'string',
    multivalued: false,
    description: 'Allen',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_ALPH_EDITOR',
    order: 7,
    group: 'alpheios'
  },
  ALPH_DESCRIPTION: {
    limitedFor: 'origin',
    label: 'description',
    labell10n: 'METADATA_TERM_LABEL_ALPH_DESCRIPTION',
    fieldtype: 'string',
    multivalued: false,
    description: 'ad libitum',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_ALPH_DESCRIPTION',
    order: 8,
    group: 'alpheios'
  },
  ALPH_GENRE: {
    limitedFor: 'origin',
    label: 'genre',
    labell10n: 'METADATA_TERM_LABEL_ALPH_GENRE',
    fieldtype: 'list',
    listValues: [
      { value: 'poetry', label: 'poetry' },
      { value: 'history', label: 'history' },
      { value: 'philosophy', label: 'philosophy' },
      { value: 'religious', label: 'religious' },
      { value: 'drama', label: 'drama' },
      { value: 'novel', label: 'novel' },
      { value: 'correspondence', label: 'correspondence' },
      { value: 'journalism', label: 'journalism' },
      { value: 'reference', label: 'reference' },
      { value: 'other', label: 'other' }
    ],
    multivalued: false,
    description: '',
    descriptionl10n: '',
    order: 9,
    group: 'alpheios'
  },

  ALPH_YEAR_TRANSLATED: {
    limitedFor: 'target',
    label: 'year translated',
    labell10n: 'METADATA_TERM_LABEL_ALPH_YEAR_TRANSLATED',
    fieldtype: 'string',
    multivalued: false,
    description: '1240, 1240-1245',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_ALPH_YEAR_TRANSLATED',
    order: 3,
    group: 'alpheios'
  },

  ALPH_YEAR_PUBLISHED: {
    limitedFor: 'target',
    label: 'year published',
    labell10n: 'METADATA_TERM_LABEL_ALPH_YEAR_PUBLISHED',
    fieldtype: 'string',
    multivalued: false,
    description: '1240, 1240-1245',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_ALPH_YEAR_PUBLISHED',
    order: 4,
    group: 'alpheios'
  },

  ALPH_YEAR_EDITION_USED: {
    limitedFor: 'target',
    label: 'edition used',
    labell10n: 'METADATA_TERM_LABEL_ALPH_EDITION_USED',
    fieldtype: 'string',
    multivalued: false,
    description: 'Allen, 1919',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_ALPH_EDITION_USED',
    order: 5,
    group: 'alpheios'
  },

  ALPH_PUBLISHER: {
    limitedFor: 'target',
    label: 'publisher',
    labell10n: 'METADATA_TERM_LABEL_ALPH_PUBLISHER',
    fieldtype: 'string',
    multivalued: false,
    description: '',
    descriptionl10n: '',
    order: 6,
    group: 'alpheios'
  },

  FILTER_BUTTON: {
    label: 'short name',
    labell10n: 'METADATA_TERM_LABEL_FILTER_BUTTON',
    fieldtype: 'string',
    multivalued: false,
    description: 'Filter button title in HTML Output.',
    descriptionl10n: 'METADATA_TERM_DESCRIPTION_FILTER_BUTTON',
    order: 1,
    group: 'common'
  }
}
