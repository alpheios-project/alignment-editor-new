<template>
  <div class="alpheios-alignment-option-item" v-if="!optionItem.hidden">
    <label class="alpheios-alignment-option-item__label-container" v-show="showLabelText" :class="{ 'alpheios-alignment-option-item__label-invisible': showLabelTextAsCheckboxLabel }">
      <span class="alpheios-alignment-option-item__label-text" 
            :class = "{ 'alpheios-alignment-option-item__label-hasinfo': optionInfo }"
            v-html="labelText"></span>
      <tooltip :tooltipText="l10n.getMsgS(optionInfo)" tooltipDirection="right" v-if="optionInfo" :additionalStyles="{ width: '200px' }">
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
        v-model = "selectedM"
        track-by = "value"
        :preserve-search="true"
        :searchable="false"
        placeholder="Pick some"
        @input = "changeOption"
        :disabled="disabled"
        :allow-empty="false"
    >
    </multiselect>

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

    <div class="alpheios-alignment-checkbox-block alpheios-alignment-option-item__control" v-if="optionType === 'boolean'"
         :class = "{ 'alpheios-alignment-checkbox-block__disabled': disabled }">
      <input type="checkbox" v-model="selected" :id="itemId" @change = "changeOption" :disabled="disabled">
      <label :for="itemId" >{{ checkboxLabel }}
        <span v-html="labelText" v-if="showCheckboxTitle"></span>
      </label>
    </div>

    <p class = "alpheios-alignment-radio-block alpheios-alignment-option-item__control" v-if="optionType === 'radio'" :class = "radioClasses">
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
import SettingsController from '@/lib/controllers/settings-controller'
import Multiselect from 'vue-multiselect'
import Tooltip from '@/vue/common/tooltip.vue'

export default {
  name: 'OptionItemBlock',
  components: {
    Multiselect,
    Tooltip
  },
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
  },
  data () {
    return {
      selected: null,
      selectedI: null,
      selectedS: null,
      selectedM: null
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
    hasValues () {
      return this.optionItem.select || this.optionItem.radio || this.optionItem.selectInput || this.optionItem.multiValue
    },
    values () {
      return (this.$store.state.optionsUpdated && this.hasValues) ? this.optionItem.values : null
    },
    labelText () {
      if (this.optionItem.labelL10n) {
        return this.l10n.getText(this.optionItem.labelL10n)
      }
      return this.optionItem.labelText
    },
    checkboxLabel () {
      return this.showLabelTextAsCheckboxLabel ? this.labelText : (this.showCheckboxTitle && this.$store.state.optionsUpdated && (this.optionItem && this.optionItem.boolean && Boolean(this.optionItem.values))) ? this.optionItem.textValues()[0] : null
    },
    optionType () {
      if (this.optionItem.multiValue) { return 'multiValue' }
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
    },
    radioClasses () {
      return {
        'alpheios-each-line-radio': !this.inline
      }
    }
  },
  methods: {
    updateSelectedFromExternal () {
      if (this.selected === this.optionItem.currentValue) { return }

      this.selected = this.optionItem.currentValue

      if (this.optionItem.multiValue) {
        this.selectedM = this.optionItem.currentItem()
      }

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
      if (this.optionItem.multiValue) {
        this.selected = this.selectedM.map(valItem => valItem.value)
      }
      if (this.optionItem.selectInput) {
        this.selected = this.selectedSI
      }
      if (this.optionItem.minValue && (this.optionItem.minValue > this.selected)) {
        this.selected = this.optionItem.minValue
      } else if (this.optionItem.maxValue && (this.optionItem.maxValue < this.selected)) {
        this.selected = this.optionItem.maxValue
      }

      this.optionItem.setValue(this.selected)
      
      SettingsController.changeOption(this.optionItem)
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
}

</style>
