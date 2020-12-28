<template>
    <div class="alpheios-alignment-metadata-item alpheios-meta-single-item">
      <p class="alpheios-alignment-metadata-item__input-value">
        <label class="alpheios-alignment-metadata-item__label">{{ metadataTerm.property.label }}</label>
          <input
              class="alpheios-alignment-input alpheios-alignment-metadata-item__control  alpheios-meta-single-item-value"
              type="text"
              v-model="value"
              :id="itemId"
              @change = "changeMetadataItem"
              @key.enter = "changeMetadataItem"
          >
          <span :id="removeId" class="alpheios-alignment-editor-metadata-item__remove" v-show="showDeleteIcon" @click="clearValue">
            <delete-icon />
          </span>
        </p>

        <p class="alpheios-alignment-metadata-item__allvalues" v-show="showllValuesData" v-if="metadataTerm.property.multivalued">
          <span class = "alpheios-alignment-metadata-item__allvalues-item"
                v-for = "(termVal, termValIndex) in sourceMetaValues" :key="termValIndex"
                @click = "activateValue(termValIndex)"
          >{{ termVal }}</span>
        </p>
    </div>
</template>
<script>
import DeleteIcon from '@/inline-icons/delete.svg'

export default {
  name: 'MetadataTermBlock',
  components: {
    deleteIcon: DeleteIcon
  },
  props: {
    metadataTerm: {
      type: Object,
      required: true
    },
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
    this.value = !this.metadataTerm.property.multivalued ? this.metadataTerm.value : null
  },
  computed: {
    itemId () {
      return `alpheios-meta-${this.textType}-${this.textId}-${this.metadataTerm.property.label}-id`
    },
    removeId () {
      return `alpheios-meta-remove-${this.textType}-${this.textId}-${this.metadataTerm.property.label}-id`
    },
    docSource () {
      return this.$textC.getDocSource(this.textType, this.textId)
    },
    sourceMetaValues () {
      return this.$store.state.alignmentUpdated && this.metadataTerm.value.sort()
    },
    showDeleteIcon () {
      return this.metadataTerm.property.multivalued && this.value && (this.value.length > 0)
    },
    showllValuesData () {
      return this.sourceMetaValues.filter(val => Boolean(val)).length > 0
    }
  },
  methods: {
    changeMetadataItem () {
      if (!this.value) { return }

      if (this.metadataTerm.template) {
        this.docSource.addMetadata(this.metadataTerm.property, this.value)
      } else {
        this.metadataTerm.saveValue(this.value)
      }
      this.$textC.changeMetadataTerm(this.textType, this.textId, this.metadataTerm)

      if (this.metadataTerm.property.multivalued) { this.value = null }
    },
    activateValue (termValIndex) {
      this.value = this.metadataTerm.value[termValIndex]
      this.metadataTerm.deleteValueByIndex(termValIndex)
    },
    clearValue () {
      this.value = null
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-metadata-item {
    margin-bottom: 10px;

    p > label {
      width: 28%;
      display: inline-block;
      vertical-align: top;
    }

    p > input.alpheios-alignment-metadata-item__control {
      display: inline-block;
      width: 70%;
      vertical-align: top;
    }

    .alpheios-alignment-metadata-item__allvalues {
      padding-left: 30%;
    }

    .alpheios-alignment-metadata-item__allvalues-item {
      display: inline-block;
      vertical-align: baseline;
      cursor: pointer;
      text-decoration: underline;
      padding: 0 7px 0 0;
    }

    .alpheios-alignment-metadata-item__input-value {
      position: relative;
      padding-right: 30px;
    }
    .alpheios-alignment-editor-metadata-item__remove {
      display: inline-block;
      width: 25px;
      height: 25px;
      right: 0;
      top: 50%;
      top: 0;

      position: absolute;

      cursor: pointer;
      svg {
        display: inline-block;
        width: 100%;
        height: 100%;
      }
    }
  }

</style>