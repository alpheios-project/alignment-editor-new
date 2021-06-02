<template>
  <div class="alpheios-alignment-option-item" v-if="!optionItem.hidden">
    <label class="alpheios-alignment-option-item__label" v-show="showLabelText" v-html="labelText"></label>

    <select
        class="alpheios-alignment-select alpheios-alignment-option-item__control"
        v-if="optionType === 'select'"
        v-model="selected" :id="itemId"
        @change = "changeOption" :disabled="disabled"
        >
      <option v-for="item in values" :key="item.value" :value = "item.value">{{item.text}}</option>
    </select>

    <input
        class="alpheios-alignment-input alpheios-alignment-option-item__control"
        type="text"
        v-if="optionType === 'text'"
        v-model="selected"
        :id="itemId" :disabled="disabled"
        @change = "changeOption"
    >

    <input
        class="alpheios-alignment-input alpheios-alignment-option-item__control"
        type="number"
        v-if="optionType === 'number'"
        :min="optionItem.minValue"
        :max="optionItem.maxValue"
        v-model="selected"
        :id="itemId" :disabled="disabled"
        @change = "changeOption"
    >

    <div class="alpheios-alignment-checkbox-block alpheios-alignment-option-item__control" v-if="optionType === 'boolean'">
      <input type="checkbox" v-model="selected" :id="itemId" @change = "changeOption">
      <label :for="itemId">{{ checkboxLabel }}
        <span v-html="labelText" v-if="showCheckboxTitle"></span>
      </label>
    </div>

    <p class = "alpheios-alignment-radio-block alpheios-alignment-option-item__control" v-if="optionType === 'radio'">
        <span v-for="item in values" :key="item.value">
            <input type="radio" :id="itemIdWithValue(item.value)" :value="item.value" v-model="selected"
                   @change="changeOption" :disabled="disabled" >
            <label :for="itemIdWithValue(item.value)">{{ item.text }}</label>
        </span>
    </p>


    <div class="alpheios-alignment-select-input alpheios-alignment-option-item__control" v-if="optionType === 'selectInput'">
      <p class="alpheios-alignment-select-input__select-container" >
          <span>{{ selectInputLabelsSelect }}</span>
          <select class="alpheios-alignment-select-input__select alpheios-alignment-select" 
            v-model="selectedS" @change="updateSelectSI" :disabled="disabled" :id="itemId+'-select'">
            <option v-for="item in values" :key="item.value" :value="item.value">{{ item.text }}</option>
          </select>
      </p>
      <div class="alpheios-alignment-select-input__input-container">
        <span>{{ selectInputLabelsInput }}</span>
        <div class="alpheios-alignment-select-input__input">
          <input type="text" class="alpheios-alignment-input" 
            v-model="selectedI" @change="changeOption" :disabled="disabled" :id="itemId+'-input'" >
          <p class="alpheios-alignment-select-input__input-description">
            {{ selectInputDescription }}
          </p>
        </div>        
      </div>
    </div>
  </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'OptionItemBlock',
  props: {
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
    }
  },
  data () {
    return {
      selected: null,
      selectedI: null,
      selectedS: null
    }
  },
  mounted () {
    this.updateSelectedFromExternal()
  },
  watch: {
    '$store.state.optionsUpdated' () {
      this.updateSelectedFromExternal()
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    itemId () {
      return `${this.optionItem.name.replace(/\./g, '_')}-id`
    },
    values () {
      return (this.$store.state.optionsUpdated && (this.optionItem.select || this.optionItem.radio || this.optionItem.selectInput)) ? this.optionItem.values : null
    },
    labelText () {
      if (this.optionItem.labelL10n) {
        return this.l10n.getText(this.optionItem.labelL10n)
      }
      return this.optionItem.labelText
    },
    checkboxLabel () {
      return (this.$store.state.optionsUpdated && (this.optionItem && this.optionItem.boolean && this.optionItem.values)) ? this.optionItem.textValues()[0].text : null
    },
    optionType () {
      if (this.optionItem.boolean) { return 'boolean' }
      if (this.optionItem.radio) { return 'radio' }
      if (this.optionItem.select) { return 'select' }
      if (this.optionItem.selectInput) { return 'selectInput' }
      if (this.optionItem.number) { return 'number' }
      
      return 'text'
    },
    selectInputLabelsSelect () {
      if (this.optionItem.selectInput && this.optionItem.labelsList) {
        if (this.labelsListType) {
          return this.optionItem.labelsList[this.labelsListType].selectLabel
        }
         return this.optionItem.labelsList.selectLabel
      }
      return null
    },
    selectInputLabelsInput () {
      if (this.optionItem.selectInput && this.optionItem.labelsList) {
        if (this.labelsListType) {
          return this.optionItem.labelsList[this.labelsListType].inputLabel
        }
         return this.optionItem.labelsList.inputLabel
      }
      return null
    },
    selectInputDescription () {
      if (this.optionItem.selectInput && this.optionItem.description) {
        return this.optionItem.description
      }
      return null
    },
    selectedSI () {
      return this.selectedI ? this.selectedI : this.selectedS
    }
  },
  methods: {
    updateSelectedFromExternal () {
      this.selected = this.optionItem.currentValue
      
      if (this.optionItem.selectInput && this.values) {
        const valueFromSelect = this.values.find(valueObj => valueObj.value === this.optionItem.currentValue)

        if (valueFromSelect) {
          this.selectedS = this.optionItem.currentValue
          this.selectedI = null
        } else {
          this.selectedI = this.optionItem.currentValue
          this.selectedS = this.optionItem.values[0].value
        }
      }
    },
    changeOption () {
      if (this.optionItem.selectInput) {
        this.selected = this.selectedSI
      }

      this.optionItem.setValue(this.selected)
      this.$settingsC.changeOption(this.optionItem)
      if (this.emitUpdateData) {
        this.$emit('updateData')
      }
    },
    updateSelectSI () {
      this.selectedI = null
      this.changeOption()
    },
    itemIdWithValue (value) {
      return `${this.itemId}_${value}`
    }
  }
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
  }
  input.alpheios-alignment-input, 
  .alpheios-alignment-select, 
  .alpheios-alignment-radio-block {
    display: inline-block;
    width: 50%;
    vertical-align: top;
  } 

  p.alpheios-alignment-radio-block {
    margin-top: 0;
    margin-bottom: 0;
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
}
</style>
