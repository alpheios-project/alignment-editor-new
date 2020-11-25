<template>
  <div class="alpheios-editor-option-item" v-if="!optionItem.hidden">
    <label class="alpheios-editor-setting__label" v-show="showLabelText" v-html="labelText"></label>

    <select
        class="alpheios-editor-select alpheios-editor-setting__control"
        v-if="optionType === 'select'"
        v-model="selected" :id="itemId"
        @change = "changeOption" :disabled="disabled"
        >
      <option v-for="item in values" :key="item.value" :value = "item.value">{{item.text}}</option>
    </select>

    <input
        class="alpheios-editor-input alpheios-editor-setting__control"
        type="text"
        v-if="optionType === 'text'"
        v-model="selected"
        :id="itemId" :disabled="disabled"
        @change = "changeOption"
    >

    <div class="alpheios-editor-checkbox-block alpheios-editor-setting__control" v-if="optionType === 'boolean'">
      <input type="checkbox" v-model="selected" :id="itemId" @change = "changeOption">
      <label :for="itemId">{{ checkboxLabel }}
        <span v-html="labelText" v-if="showCheckboxTitle"></span>
      </label>
    </div>

    <p class = "alpheios-alignment-radio-block" v-if="optionType === 'radio'">
        <span v-for="item in values" :key="item.value">
            <input type="radio" :id="itemId" :value="item.value" v-model="selected"
                   @change="changeOption" :disabled="disabled" >
            <label :for="itemId">{{ item.text }}</label>
        </span>
    </p>

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
    }
  },
  data () {
    return {
      selected: null
    }
  },
  mounted () {
    this.selected = this.optionItem.currentValue
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    itemId () {
      return `${this.optionItem.name}-id`
    },
    values () {
      return this.optionItem.select || this.optionItem.radio ? this.optionItem.values : []
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
      return 'text'
    }
  },
  methods: {
    changeOption () {
      this.optionItem.setValue(this.selected)
      this.$settingsC.changeOption(this.optionItem)
      if (this.emitUpdateData) {
        this.$emit('updateData')
      }
    }
  }
}
</script>
<style lang="scss">
.alpheios-editor-option-item {
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
  input.alpheios-editor-input, .alpheios-editor-select, .alpheios-alignment-radio-block {
    display: inline-block;
    width: 50%;
    vertical-align: top;
  } 

  p.alpheios-alignment-radio-block {
    margin-top: 0;
    margin-bottom: 0;
  }
}
</style>