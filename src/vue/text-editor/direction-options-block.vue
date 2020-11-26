<template>
    <div class="alpheios-alignment-editor-text-block__tokenizer-block" v-show="showOptions" v-if="renderOptions">
        <fieldset class="alpheios-alignment-text__group alpheios-alignment-slim-fieldset alpheios-alignment-fieldset-label-auto">
            <legend>{{ l10n.getMsgS('RADIO_BLOCK_DIRECTION_LABEL') }}</legend>
            <option-item-block
              :optionItem = "localOptions.sourceText.items.direction"
              :emitUpdateData = "true"
              @updateData = "updateData" :disabled="!docSourceEditAvailable"
            />
        </fieldset>
    </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import RadioItems from '@/vue/form-items/radio-items.vue'

import OptionItemBlock from '@/vue/options/option-item-block.vue'

export default {
  name: 'TokenizeOptionsBlock',
  components: {
    radioItems: RadioItems,
    optionItemBlock: OptionItemBlock
  },
  props: {
    textType: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: false,
      default: 0
    },
    localOptions: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    docSourceEditAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && !this.$alignedC.alignmentGroupsWorkflowStarted
    },
    idRadioPrefix () {
      return `alpheios-alignment-editor-direction-options__${this.textType}__${this.index}`
    },
    renderOptions () {
      return this.$store.state.optionsUpdated && this.localOptions.ready
    },
    showOptions () {
      return this.$store.state.optionsUpdated && this.$settingsC.tokenizerOptionsLoaded
    }
  },
  methods: {
    updateData () {
      this.$emit('updateText')
    }
  }
}
</script>
<style lang="scss">
fieldset.alpheios-alignment-slim-fieldset {
  padding: 0;
  margin-bottom: 0;
  border: 0;

  legend {
    display: none;
  }
}

.alpheios-alignment-fieldset-label-auto {
  .alpheios-editor-setting__label {
    width: auto;
    margin-right: 20px;
  }
  input.alpheios-editor-input, 
  .alpheios-editor-select, 
  .alpheios-alignment-radio-block {
    width: auto;
  }
}
</style>