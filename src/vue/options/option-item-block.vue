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

    <div class="alpheios-alignment-checkbox-block alpheios-alignment-option-item__control" v-if="optionType === 'boolean'">
      <input type="checkbox" v-model="selected" :id="itemId" @change = "changeOption">
      <label :for="itemId">{{ checkboxLabel }}
        <span v-html="labelText" v-if="showCheckboxTitle"></span>
      </label>
    </div>

    <p class = "alpheios-alignment-radio-block alpheios-alignment-option-item__control" v-if="optionType === 'radio'">
        <span v-for="item in values" :key="item.value">
            <input type="radio" :id="itemId" :value="item.value" v-model="selected"
                   @change="changeOption" :disabled="disabled" >
            <label :for="itemId">{{ item.text }}</label>
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
    this.selected = this.optionItem.currentValue

    if (this.optionItem.selectInput) {
      const valueFromSelect = this.values.find(valueObj => valueObj.value === this.optionItem.currentValue)

      if (valueFromSelect) {
        this.selectedS = this.optionItem.currentValue
        this.selectedI = null
      } else {
        this.selectedI = this.optionItem.currentValue
        this.selectedS = this.langsList[0].value
      }
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    itemId () {
      return `${this.optionItem.name.replace('.', '_')}-id`
    },
    values () {
      return (this.optionItem.select || this.optionItem.radio || this.optionItem.selectInput) ? this.optionItem.values : []
    },
    labelText () {
      if (this.optionItem.labelL10n) {
        return this.l10n.getText(this.optionItem.labelL10n)
      }
      return this.optionItem.labelText
    },
    checkboxLabel () {
      return (this.optionItem && this.optionItem.values) ? this.optionItem.textValues()[0].text : ''
    },
    optionType () {
      if (this.optionItem.boolean) { return 'boolean' }
      if (this.optionItem.radio) { return 'radio' }
      if (this.optionItem.select) { return 'select' }
      if (this.optionItem.selectInput) { return 'selectInput' }
      
      return 'text'
    },
    selectInputLabelsSelect () {
      if (this.optionItem.selectInput && this.optionItem.labelsList && this.labelsListType) {
        return this.optionItem.labelsList[this.labelsListType].selectLabel
      }
      return ''
    },
    selectInputLabelsInput () {
      if (this.optionItem.selectInput && this.optionItem.labelsList && this.labelsListType) {
        return this.optionItem.labelsList[this.labelsListType].inputLabel
      }
      return ''
    },
    selectInputDescription () {
      if (this.optionItem.selectInput && this.optionItem.description) {
        return this.optionItem.description
      }
      return ''
    },
    selectedSI () {
      return this.selectedI ? this.selectedI : this.selectedS
    }
  },
  methods: {
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
    width: 49%;
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