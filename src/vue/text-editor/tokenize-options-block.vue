<template>
    <div class="alpheios-alignment-editor-text-block__tokenizer-block" v-show="showTokenizeOptions" v-if="renderTokenizeOptions">
        <fieldset class="alpheios-alignment-text__group">
            <legend>{{ l10n.getMsgS('TEXT_EDITOR_BLOCK_TOKENIZE_OPTIONS') }}</legend>
            <option-item-block
              :optionItem = "localTokenizeOptions.sourceText.items.sourceType"
              :emitUpdateData = "true"
              @updateData = "updateSourceType" :disabled="!docSourceEditAvailable"
            />
        </fieldset>

        <fieldset class="alpheios-alignment-text__group alpheios-alignment-editor-text-block__tokenizer-block__text" v-show="sourceType === 'text'">
            <legend>{{ l10n.getMsgS('TEXT_EDITOR_BLOCK_TOKENIZE_OPTIONS_TEXT') }}</legend>
            <option-item-block
                v-for="textOptItem in localTokenizeOptions.text.items" :key="textOptItem.domain"
                :optionItem = "textOptItem" :emitUpdateData = "true"
                @updateData = "updateData" :disabled="!docSourceEditAvailable"
            />
        </fieldset>

        <fieldset class="alpheios-alignment-text__group alpheios-alignment-editor-text-block__tokenizer-block__tei" v-show="sourceType === 'tei'">
            <legend>{{ l10n.getMsgS('TEXT_EDITOR_BLOCK_TOKENIZE_OPTIONS_TEI') }}</legend>
            <option-item-block
                v-for="textOptItem in localTokenizeOptions.tei.items" :key="textOptItem.domain"
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
    }
  },
  data () {
    return {
      sourceType: null,
      localTokenizeOptions: { ready: false }
    }
  },
  async mounted () {
    if (!this.localTokenizeOptions.ready && this.showTokenizeOptions) {
      await this.prepareDefaultTokenizeOptions()
    }
  },
  watch: {
    '$store.state.tokenizerUpdated' () {
      this.$emit('updateText')
    },
    async '$store.state.optionsUpdated' () {
      if (!this.localTokenizeOptions.ready && this.showTokenizeOptions) {
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
    },
    showTokenizeOptions () {
      console.info('showTokenizeOptions - ', this.$settingsC.tokenizerOptionsLoaded)
      return Boolean(this.$store.state.tokenizerUpdated) && Boolean(this.$store.state.optionsUpdated) && this.$settingsC.tokenizerOptionsLoaded
    }

  },
  methods: {
    async prepareDefaultTokenizeOptions () {
      const clonedOptions = await this.$settingsC.cloneSourceOptions(this.textType, this.index)

      this.localTokenizeOptions.text = clonedOptions.text
      this.localTokenizeOptions.tei = clonedOptions.tei
      this.localTokenizeOptions.sourceText = clonedOptions.sourceText

      this.localTokenizeOptions.ready = true

      this.sourceType = this.localTokenizeOptions.sourceText.items.sourceType.currentValue
      this.updateData()
    },

    updateSourceType () {
      this.sourceType = this.localTokenizeOptions.sourceText.items.sourceType.currentValue
      this.updateData()
    },

    updateData () {
      this.$emit('updateLocalTokenizeOptions', {
        sourceType: this.localTokenizeOptions.sourceText,
        localTokenizeOptions: this.localTokenizeOptions[this.sourceType]
      })
    }
  }
}

</script>