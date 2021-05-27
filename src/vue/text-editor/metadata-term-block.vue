<template>
    <div class="alpheios-alignment-editor-metadata-item  alpheios-meta-single-item">
      <p class="alpheios-alignment-editor-metadata-item__input-value">
          <label class="alpheios-alignment-editor-metadata-item__label">{{ metadataTermLabel }}
            <tooltip :tooltipText="metadataTermDescription" tooltipDirection="right">
              <span class="alpheios-alignment-editor-metadata-item__label-help">?</span>
            </tooltip>
          </label>

          <input
              class="alpheios-alignment-input alpheios-alignment-editor-metadata-item__control  alpheios-meta-single-item-value"
              type="text"
              v-model="value"
              :id="itemId"
              @change = "changeMetadataItem('change')"
              @keyup.enter = "changeMetadataItem('enter')"
          >
          <span :id="removeId" class="alpheios-alignment-editor-metadata-item__remove" v-show="showDeleteIcon" @click="clearValue">
            <delete-icon />
          </span>
        </p>

        <p class="alpheios-alignment-editor-metadata-item__allvalues" v-show="showllValuesData" v-if="metadataTerm.property.multivalued">
          <span class = "alpheios-alignment-editor-metadata-item__allvalues-item"
                v-for = "(termVal, termValIndex) in sourceMetaValues" :key="termValIndex"
                @click = "activateValue(termValIndex)"
          >{{ termVal }}</span>
        </p>
    </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import DeleteIcon from '@/inline-icons/delete.svg'
import Tooltip from '@/vue/common/tooltip.vue'
export default {
  name: 'MetadataTermBlock',
  components: {
    deleteIcon: DeleteIcon,
    tooltip: Tooltip
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
    l10n () {
      return L10nSingleton
    },
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
      return this.$store.state.docSourceUpdated && this.metadataTerm.value.sort()
    },
    showDeleteIcon () {
      return this.metadataTerm.property.multivalued && this.value && (this.value.length > 0)
    },
    showllValuesData () {
      return this.sourceMetaValues.filter(val => Boolean(val)).length > 0
    },
    metadataTermLabel () {
      return this.metadataTerm.property.labell10n ? this.l10n.getMsgS(this.metadataTerm.property.labell10n) : this.metadataTerm.property.label
    },
    metadataTermDescription () {
      return this.metadataTerm.property.descriptionl10n ? this.l10n.getMsgS(this.metadataTerm.property.descriptionl10n) : this.metadataTerm.property.description
    }
  },
  methods: {
    changeMetadataItem (typeEvent) {
      if (this.metadataTerm.property.multivalued && (typeEvent === 'change')) { return }
      if (!this.metadataTerm.property.multivalued && (typeEvent === 'enter')) { return }

      // if (!this.value) { return }

      this.$textC.changeMetadataTerm(this.metadataTerm, this.value, this.textType, this.textId)

      if (this.metadataTerm.property.multivalued) { this.clearValue() }
    },
    activateValue (termValIndex) {
      this.value = this.metadataTerm.value[termValIndex]
      this.deleteValueByIndex(termValIndex)
      this.$textC.deleteValueByIndex(this.metadataTerm, termValIndex, this.textType, this.textId)
    },
    deleteValueByIndex (termValIndex) {
      this.metadataTerm.value.splice(termValIndex, 1)
    },
    clearValue () {
      this.value = null
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-metadata-item {
    margin-bottom: 10px;

    p > label {
      width: 38%;
      display: inline-block;
      vertical-align: top;
      text-transform: capitalize;

     .alpheios-alignment-editor-metadata-item__label-help {
        display: inline-block;
        vertical-align: middle;
        width: 20px;
        height: 20px;
        background: #185F6D;
        color: #fff;
        border: 1px solid #185F6D;
        border-radius: 20px;
        text-align: center;
        line-height: 20px;
        margin-left: 5px;
      }
    }

    p > input.alpheios-alignment-editor-metadata-item__control {
      display: inline-block;
      width: 60%;
      vertical-align: top;
    }

    .alpheios-alignment-editor-metadata-item__allvalues {
      padding-left: 30%;
    }

    .alpheios-alignment-editor-metadata-item__allvalues-item {
      display: inline-block;
      vertical-align: baseline;
      cursor: pointer;
      text-decoration: underline;
      padding: 0 7px 0 0;
    }

    .alpheios-alignment-editor-metadata-item__input-value {
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