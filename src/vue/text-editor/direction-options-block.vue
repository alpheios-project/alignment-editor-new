<template>
    <div class="alpheios-alignment-editor-text-block__tokenizer-block" v-show="showDirectionOption" v-if="renderTokenizeOptions">
        <fieldset class="alpheios-alignment-text__group">
            <legend>{{ l10n.getMsgS('TEXT_EDITOR_BLOCK_TOKENIZE_OPTIONS') }}</legend>
            <option-item-block
              :optionItem = "localTokenizeOptions.sourceText.items.sourceType"
              :emitUpdateData = "true"
              @updateData = "updateSourceType" :disabled="!docSourceEditAvailable"
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
    }
  },
  data () {
    return {
      sourceType: null,

      showDirectionOption: true,
      localDirectionOption: { ready: false }
    }
  },
  async mounted () {
    if (!this.localDirectionOption.ready && this.$settingsC.tokenizerOptionsLoaded) {
      await this.prepareDefaultTokenizeOptions()
    }
  },
  watch: {
    async '$store.state.optionsUpdated' () {
      if (!this.localTokenizeOptions.ready && this.$settingsC.tokenizerOptionsLoaded) {
        await this.prepareDefaultTokenizeOptions()
      }
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
      return `alpheios-alignment-editor-tokenize-options__${this.textType}__${this.index}`
    },
    renderTokenizeOptions () {
      return Boolean(this.$store.state.optionsUpdated) && this.localTokenizeOptions.ready
    }
  },
}
</script>