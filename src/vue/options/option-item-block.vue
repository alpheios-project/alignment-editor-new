<template>
  <div class="alpheios-alignment-option-item" v-if="props.optionItem && !props.optionItem.hidden">
    <label class="alpheios-alignment-option-item__label-container" v-show="props.showLabelText" 
           :class="{ 'alpheios-alignment-option-item__label-invisible': props.showLabelTextAsCheckboxLabel }">
      <span class="alpheios-alignment-option-item__label-text" 
            :class = "{ 'alpheios-alignment-option-item__label-hasinfo': props.optionInfo }"
            v-html="labelText"></span>
      <tooltip :tooltipText="l10n.getMsgS(props.optionInfo)" tooltipDirection="right"
                v-if="props.optionInfo" :additionalStyles="{ width: '200px' }">
        <span class="alpheios-alignment-option-item__label-info">?</span>
      </tooltip>
    </label>

    <multiselect
        class="alpheios-alignment-option-item__control"
        v-if="optionType === 'multiValue'"
        :hide-selected="true"
        :multiple="true"
        :options="values"
        label = "text"
        v-model = "state.selectedM"
        track-by = "value"
        :preserve-search="true"
        :searchable="false"
        :internalSearch = "false"
        placeholder="Pick some"
        @input = "changeOption"
        :disabled="props.disabled"
        :allow-empty="false"
    >
    </multiselect>

    <select
        class="alpheios-alignment-select alpheios-alignment-option-item__control"
        v-if="optionType === 'select'"
        v-model="state.selected" :id="itemId"
        @change = "changeOption" :disabled="props.disabled"
        >
      <option v-for="item in values" :key="item.value" :value = "item.value">{{item.text}}</option>
    </select>

    <input
        class="alpheios-alignment-input alpheios-alignment-option-item__control"
        type="text"
        v-if="optionType === 'text'"
        v-model="state.selected"
        :id="itemId" :disabled="props.disabled"
        @change = "changeOption"
    >

    <input
        class="alpheios-alignment-input alpheios-alignment-option-item__control"
        type="number"
        v-if="optionType === 'number'"
        :min="props.optionItem.minValue"
        :max="props.optionItem.maxValue"
        v-model="state.selected"
        :id="itemId" :disabled="props.disabled"
        @change = "changeOption"
    >

    <div class="alpheios-alignment-checkbox-block alpheios-alignment-option-item__control" 
         v-if="optionType === 'boolean'"
         :class = "checkboxClasses">
      <input type="checkbox" v-model="state.selected" :id="itemId" @change = "changeOption" :disabled="props.disabled">
      <label :for="itemId" >{{ checkboxLabel }}
        <span v-html="labelText" v-if="props.showCheckboxTitle"></span>
      </label>
    </div>

    <p class = "alpheios-alignment-radio-block alpheios-alignment-option-item__control" v-if="optionType === 'radio'" 
        :class = "radioClasses">
        <span v-for="item in values" :key="item.value">
            <input type="radio" :id="itemIdWithValue(item.value)" :value="item.value" v-model="state.selected"
                   @change="changeOption" :disabled="props.disabled" >
            <label :for="itemIdWithValue(item.value)">{{ item.text }}</label>
        </span>
    </p>


    <div class="alpheios-alignment-select-input alpheios-alignment-option-item__control" v-if="optionType === 'selectInput'">
      <p class="alpheios-alignment-select-input__select-container" >
          <span>{{ selectInputLabelsSelect }}</span>
          <select class="alpheios-alignment-select-input__select alpheios-alignment-select" 
            v-model="state.selectedS" @change="updateSelectSI" :disabled="props.disabled" :id="itemId+'-select'">
            <option v-for="item in values" :key="item.value" :value="item.value">{{ item.text }}</option>
          </select>
      </p>
      <div class="alpheios-alignment-select-input__input-container">
        <span>{{ selectInputLabelsInput }}</span>
        <div class="alpheios-alignment-select-input__input">
          <input type="text" class="alpheios-alignment-input" 
            v-model="state.selectedI" @change="changeOption" :disabled="props.disabled" :id="itemId+'-input'" >
          <p class="alpheios-alignment-select-input__input-description">
            {{ selectInputDescription }}
          </p>
        </div>        
      </div>
    </div>
  </div>
</template>
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import SettingsController from '@/lib/controllers/settings-controller'
import Multiselect from 'vue-multiselect'
import Tooltip from '@/vue/common/tooltip.vue'

import { reactive, ref, inject, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

const $store = useStore()

const l10n = computed(() => { return L10nSingleton })
const emit = defineEmits([ 'updateData' ])

const props = defineProps({
  optionItem: {
    type: Object,
    required: true
  },
  showLabelText: {
    type: Boolean,
    required: false,
    default: true
  },
  showCheckboxTitle: {
    type: Boolean,
    required: false,
    default: false
  },
  emitUpdateData: {
    type: Boolean,
    required: false,
    default: false
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  labelsListType: {
    type: String,
    required: false,
    default: ''
  },
  inline: {
    type: Boolean,
    required: false,
    default: true
  },
  optionInfo: {
    type: String,
    required: false,
    default: ''
  },
  showLabelTextAsCheckboxLabel: {
    type: Boolean,
    required: false,
    default: false
  }
})

const state = reactive({ 
  selected: null,
  selectedI: null,
  selectedS: null,
  selectedM: null
})

onMounted(() => {
  updateSelectedFromExternal()
})
watch( 
  () => $store.state.optionsUpdated, 
  () => {
    updateSelectedFromExternal()
  }
)

const checkboxClasses = computed(() => {
  return {
    'alpheios-alignment-checkbox-block__disabled': props.disabled, 
    'alpheios-alignment-checkbox-block__has_checkbox_label': !props.showCheckboxTitle 
  }
})

const itemId = computed(() => {
  return `${props.optionItem.name.replace(/\./g, '_')}-id`
})

const hasValues = computed(() => {
  return props.optionItem.select || props.optionItem.radio || props.optionItem.selectInput || props.optionItem.multiValue
})

const values = computed(() => {
  return ($store.state.optionsUpdated && hasValues.value) ? props.optionItem.values : null
})

const labelText = computed(() => {
  if (props.optionItem.labelL10n) {
    return l10n.getText(props.optionItem.labelL10n)
  }
  return props.optionItem.labelText
})

const checkboxLabel = computed(() => {
  return props.showLabelTextAsCheckboxLabel ? 
          labelText.value : 
          (
              props.showCheckboxTitle && $store.state.optionsUpdated && 
              (props.optionItem && props.optionItem.boolean && Boolean(props.optionItem.values))) ?
                  props.optionItem.textValues()[0] : null
})

const optionType = computed(() => {
  if (props.optionItem.multiValue) { return 'multiValue' }
  if (props.optionItem.boolean) { return 'boolean' }
  if (props.optionItem.radio) { return 'radio' }
  if (props.optionItem.select) { return 'select' }
  if (props.optionItem.selectInput) { return 'selectInput' }
  if (props.optionItem.number) { return 'number' }
  
  return 'text'
})

const selectInputLabelsSelect = computed(() => {
  if (props.optionItem.selectInput && props.optionItem.labelsList) {
    if (props.labelsListType) {
      return props.optionItem.labelsList[props.labelsListType].selectLabel
    }
      return props.optionItem.labelsList.selectLabel
  }
  return null
})

const selectInputLabelsInput = computed(() => {
  if (props.optionItem.selectInput && props.optionItem.labelsList) {
    if (props.labelsListType) {
      return props.optionItem.labelsList[props.labelsListType].inputLabel
    }
      return props.optionItem.labelsList.inputLabel
  }
  return null
})

const selectInputDescription = computed(() => {
  if (props.optionItem.selectInput && props.optionItem.description) {
    return props.optionItem.description
  }
  return null
})

const selectedSI = computed(() => {
  return state.selectedI ? state.selectedI : state.selectedS
})

const radioClasses = computed(() => {
  return {
    'alpheios-each-line-radio': !props.inline
  }
})

const updateSelectedFromExternal = () => {
  if (!props.optionItem || (state.selected === props.optionItem.currentValue)) { return }

  state.selected = props.optionItem.currentValue

  if (props.optionItem.multiValue) {
    state.selectedM = props.optionItem.currentItem()
  }

  if (props.optionItem.selectInput && values.value) {
    const valueFromSelect = values.value.find(valueObj => valueObj.value === props.optionItem.currentValue)

    if (valueFromSelect) {
      state.selectedS = props.optionItem.currentValue
      state.selectedI = null
    } else {
      state.selectedI = props.optionItem.currentValue
      state.selectedS = props.optionItem.values.value[0].value
    }
  }
}

const changeOption = () => {
  if (props.optionItem.multiValue) {
    state.selected = state.selectedM.map(valItem => valItem.value)
  }
  if (props.optionItem.selectInput) {
    state.selected = selectedSI.value
  }
  if (props.optionItem.minValue && (props.optionItem.minValue > state.selected)) {
    state.selected = props.optionItem.minValue
  } else if (props.optionItem.maxValue && (props.optionItem.maxValue < state.selected)) {
    state.selected = props.optionItem.maxValue
  }

  props.optionItem.setValue(state.selected)
  
  SettingsController.changeOption(props.optionItem)
  if (props.emitUpdateData) {
    emit('updateData')
  }
}

const updateSelectSI = () => {
  state.selectedI = null
  changeOption()
}

const itemIdWithValue = (value) => {
  return `${itemId.value}_${value}`
}

</script>

<style lang="scss">
.alpheios-alignment-option-item {
  display: inline-block;
  width: 100%;
  vertical-align: top;
  padding-right: 20px;
  margin-bottom: 20px;

  & > label {
    width: 48%;
    display: inline-block;
    vertical-align: top;
    padding-right: 10px;

    &.alpheios-alignment-option-item__label-invisible {
      visibility: hidden;
    }
  }
  input.alpheios-alignment-input, 
  .alpheios-alignment-select, 
  .alpheios-alignment-radio-block,
  .multiselect.alpheios-alignment-option-item__control {
    display: inline-block;
    width: 50%;
    vertical-align: middle;
  } 

  p.alpheios-alignment-radio-block {
    margin-top: 0;
    margin-bottom: 0;

    & > span {
      display: inline-block;
    }
    &.alpheios-each-line-radio {
      & > span  {
        display: block;
      }
    }
  }

  .alpheios-alignment-select-input__select-container,
  .alpheios-alignment-select-input__input-container {
    span {
      min-width: 160px;
      display: inline-block;
      vertical-align: top;
    }
  }
  .alpheios-alignment-select-input__select,
  .alpheios-alignment-select-input__input {
      width: 80%;
      max-width: 300px;
      display: inline-block;
      vertical-align: top;
  }

  .alpheios-alignment-select-input__input-description {
    font-size: 90%;
    color: #888;
  }


  .alpheios-alignment-option-item__label-text,
  .alpheios-alignment-option-item__label-info {
    display: inline-block;
    vertical-align: middle;
  }

  .alpheios-alignment-option-item__label-text.alpheios-alignment-option-item__label-hasinfo {
    max-width: 80%;
  }


}
  .alpheios-alignment-option-item__label-info {
    width: 25px;
    height: 25px;
    display: inline-block;
    text-align: center;
    line-height: 25px;
    font-weight: bold;
    border-radius: 20px;
    vertical-align: middle;
    margin-left: 10px;
  }

.alpheios-alignment-option-item__label-info { 
  color: #fff;
  background: #000;
}


.alpheios-alignment-option-item {
  .alpheios-alignment-option-item__label-container,
  .alpheios-alignment-checkbox-block.alpheios-alignment-option-item__control {
    vertical-align: middle;
  }

  
  .alpheios-alignment-checkbox-block {
    width: 48%;
  }

  .alpheios-alignment-checkbox-block__has_checkbox_label {
    &.alpheios-alignment-checkbox-block {
      width: 28px;
    }
  }
}

</style>
