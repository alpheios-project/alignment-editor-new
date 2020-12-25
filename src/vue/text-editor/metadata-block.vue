<template>
    <div class="alpheios-alignment-text-editor-single-metadata" v-if="metadataAvailable">
      <div class="alpheios-alignment-option-item" v-if="">
        <label class="alpheios-alignment-option-item__label">{{ metadataTerm.property.label }}</label>
        <input
            class="alpheios-alignment-input alpheios-alignment-option-item__control"
            type="text"
            v-model="value"
            :id="itemId"
            @change = "changeMeatadataItem"
        >
      </div>

    </div>
</template>
<script>
export default {
  name: 'MetadataBlock',
  props: {
    textType: {
      type: String,
      required: true
    },
    textId: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      value: null
    }
  },
  mounted () {
    this.value = this.metadataTerm.value
  },
  computed: {
    itemId () {
      return `${this.textType}-${this.textId}-${this.metadataTerm.label}-id`
    },
    docSource () {
      return this.$textC.getDocSource(this.textType, this.textId)
    },
    metadataAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && Boolean(this.docSource)
    },
    allMetadata () {
      return this.metadataAvailable && this.docSource.allAvailableMetadata
    },
    metadataTerm () {
      return this.$store.state.alignmentUpdated && this.metadataAvailable && Object.values(this.allMetadata)[1]
    }
  },
  methods: {
    changeMeatadataItem () {
      if (this.metadataTerm.template) {
        this.docSource.addMetadata(this.metadataTerm.property, this.value)
      } else {
        this.metadataTerm.saveValue(this.value)
      }
      this.$textC.changeMetadataTerm(this.textType, this.textId, this.metadataTerm)

      console.info('allMetadata', this.docSource)
    }
  }
}
</script>
