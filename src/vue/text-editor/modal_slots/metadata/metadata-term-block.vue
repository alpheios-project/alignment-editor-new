<template>
    <div class="alpheios-alignment-editor-metadata-item  alpheios-meta-single-item">
      <p class="alpheios-alignment-editor-metadata-item__input-value">
          <label class="alpheios-alignment-editor-metadata-item__label">{{ metadataTermLabel }}
            <tooltip :tooltipText="metadataTermDescription" tooltipDirection="right" v-if="metadataTermDescription">
              <span class="alpheios-alignment-editor-metadata-item__label-help">?</span>
            </tooltip>
          </label>

          <input
              class="alpheios-alignment-input alpheios-alignment-editor-metadata-item__control  alpheios-meta-single-item-value"
              type="text"
              v-model="state.value"
              :id="itemId"
              @change = "changeMetadataItem('change')"
              @keyup.enter = "changeMetadataItem('enter')"
              v-if="fieldType === 'string' || fieldType === 'URI' || fieldType === 'date'"
          >

          <select
              class="alpheios-alignment-select alpheios-alignment-editor-metadata-item__control"
              v-model="state.value" :id="itemId"
              @change = "changeMetadataItem('change')"
              v-if="fieldType === 'list'"
              >
            <option v-for="item in listValues" :key="item.value" :value = "item.value">{{ item.label }}</option>
          </select>

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
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import DeleteIcon from '@/inline-icons/delete.svg'
import Tooltip from '@/vue/common/tooltip.vue'

import { computed, inject, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
const emit = defineEmits([  ])

const $store = useStore()

const l10n = computed(() => { return L10nSingleton })
const $textC = inject('$textC')

const props = defineProps({
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
})

const state = reactive({
  value: null
})

onMounted(() => {
  state.value = !props.metadataTerm.property.multivalued ? props.metadataTerm.value : null
})

const itemId = computed(() => {
  return `alpheios-meta-${props.textType}-${props.textId}-${props.metadataTerm.property.id}-id`
})

const removeId = computed(() => {
  return `alpheios-meta-remove-${props.textType}-${props.textId}-${props.metadataTerm.property.id}-id`
})

const docSource = computed(() => {
  return $textC.getDocSource(props.textType, props.textId)
})

const sourceMetaValues = computed(() => {
  return $store.state.docSourceUpdated && props.metadataTerm.value.sort()
})

const showDeleteIcon = computed(() => {
  return props.metadataTerm.property.multivalued && state.value && (state.value.length > 0)
})

const showllValuesData = computed(() => {
  return sourceMetaValues.value.filter(val => Boolean(val)).length > 0
})

const metadataTermLabel = computed(() => {

  const metaProp = props.metadataTerm.property

  if (metaProp.labell10n) {
    return typeof (metaProp.labell10n) === 'object' ? l10n.value.getMsgS(metaProp.labell10n[props.textType]) : l10n.value.getMsgS(metaProp.labell10n)
  }

  return typeof (metaProp.label) === 'object' ? metaProp.label[props.textType] : metaProp.label
})

const metadataTermDescription = computed(() => {
  return props.metadataTerm.property.descriptionl10n ? l10n.value.getMsgS(props.metadataTerm.property.descriptionl10n) : props.metadataTerm.property.description
})

const fieldType = computed(() => {
  return props.metadataTerm.property.fieldtype
})

const listValues = computed(() => {
  return props.metadataTerm.property.fieldtype === 'list' ? props.metadataTerm.property.listValues : []
})

const changeMetadataItem = (typeEvent) => {
  if (props.metadataTerm.property.multivalued && (typeEvent === 'change')) { return }
  if (!props.metadataTerm.property.multivalued && (typeEvent === 'enter')) { return }

  $textC.changeMetadataTerm(props.metadataTerm, state.value, props.textType, props.textId)

  if (props.metadataTerm.property.multivalued) { clearValue() }
}

const activateValue = (termValIndex) => {
  state.value = props.metadataTerm.value[termValIndex]
  deleteValueByIndex(termValIndex)
  $textC.deleteValueByIndex(props.metadataTerm, termValIndex, props.textType, props.textId)
}

const deleteValueByIndex = (termValIndex) => {
  props.metadataTerm.value.splice(termValIndex, 1)
}

const clearValue = () => {
  state.value = null
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

    p > .alpheios-alignment-editor-metadata-item__control {
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