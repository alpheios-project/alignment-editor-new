<template>
  <div class="alpheios-editor-option-item" v-if="renderable">
    <label class="alpheios-editor-setting__label" v-show="showLabelText" v-html="labelText"></label>

    <select
        class="alpheios-editor-select alpheios-editor-setting__control"
        v-if="itemType === 'select'"
        v-model="selected" :id="itemId"
        @change = "changeOption"
        >
      <option v-for="item in values" :key="item.value" :value = "item.value">{{item.text}}</option>
    </select>
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
    itemType () {
      if (this.optionItem.multiValue) { return 'multiValue' }
      if (this.optionItem.number) { return 'number' }
      if (this.optionItem.text) { return 'text' }
      if (this.optionItem.boolean) { return 'boolean' }
      return 'select'
    },
    renderable () {
      return Object.keys(this.optionItem).length > 0  && !this.optionItem.hidden
    },
    values () {
      return this.itemType === 'select' ? this.optionItem.values : []
    },
    labelText () {
      if (this.optionItem.labelL10n) {
        return this.l10n.getText(this.optionItem.labelL10n)
      }
      return this.optionItem.labelText
    }
  },
  methods: {
    changeOption () {
      this.optionItem.setValue(this.selected)
      this.$settingsC.changeOption(this.optionItem)
    }
  }
}
</script>
<style lang="scss">
.alpheios-editor-option-item {
  display: inline-block;
  width: 32%;
  min-width: 350px;
  vertical-align: top;

  label, select, input {
    display: inline-block;
    width: 49%;
  } 
}
</style>