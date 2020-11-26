<template>
    <div class="alpheios-alignment-editor-text-block__tokenizer-block" v-show="showOptions" v-if="renderOptions">
        <fieldset class="alpheios-alignment-text__group">
            <legend>{{ l10n.getMsgS('TEXT_EDITOR_BLOCK_TOKENIZE_OPTIONS') }}</legend>
            <option-item-block
              :optionItem = "localOptions.sourceText.items.sourceType"
              :emitUpdateData = "true"
              @updateData = "updateData" :disabled="!docSourceEditAvailable"
            />
        </fieldset>

        <fieldset class="alpheios-alignment-text__group alpheios-alignment-editor-text-block__tokenizer-block__text" v-show="sourceType === 'text'">
            <legend>{{ l10n.getMsgS('TEXT_EDITOR_BLOCK_TOKENIZE_OPTIONS_TEXT') }}</legend>
            <option-item-block
                v-for="textOptItem in localOptions.text.items" :key="textOptItem.domain"
                :optionItem = "textOptItem" :emitUpdateData = "true"
                @updateData = "updateData" :disabled="!docSourceEditAvailable"
            />
        </fieldset>

        <fieldset class="alpheios-alignment-text__group alpheios-alignment-editor-text-block__tokenizer-block__tei" v-show="sourceType === 'tei'">
            <legend>{{ l10n.getMsgS('TEXT_EDITOR_BLOCK_TOKENIZE_OPTIONS_TEI') }}</legend>
            <option-item-block
                v-for="textOptItem in localOptions.tei.items" :key="textOptItem.domain"
                :optionItem = "textOptItem" :emitUpdateData = "true"
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
  watch: {
    '$store.state.tokenizerUpdated' () {
      this.$emit('updateText')
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    docSourceEditAvailable () {
      return this.$store.state.alignmentUpdated && !this.$alignedC.alignmentGroupsWorkflowStarted
    },
    idRadioPrefix () {
      return `alpheios-alignment-editor-tokenize-options__${this.textType}__${this.index}`
    },
    renderOptions () {
      return this.$store.state.optionsUpdated && this.localOptions.ready
    },
    showOptions () {
      return this.$store.state.optionsUpdated && this.$settingsC.tokenizerOptionsLoaded
    },
    sourceType () {
      return this.$store.state.optionsUpdated && this.localOptions.sourceText.items.sourceType.currentValue
    }

  },
  methods: {
    updateData () {
      this.$emit('updateText')
    }
  }
}

</script>