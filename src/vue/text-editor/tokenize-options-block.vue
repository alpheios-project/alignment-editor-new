<template>
    <div class="alpheios-alignment-tokenize-options" v-show="showOptions" v-if="renderOptions">
        <fieldset class="alpheios-alignment-options-fieldset alpheios-alignment-options-fieldset__source-type">
            <legend>{{ l10n.getMsgS('TEXT_EDITOR_BLOCK_TOKENIZE_OPTIONS') }}</legend>
            <option-item-block
              :optionItem = "localOptions.sourceText.items.sourceType"
              :emitUpdateData = "true"
              @updateData = "updateData" :disabled="disabled"
            />
        </fieldset>

        <fieldset class="alpheios-alignment-options-fieldset alpheios-alignment-options-fieldset__text" v-show="sourceType === 'text'">
            <legend>{{ l10n.getMsgS('TEXT_EDITOR_BLOCK_TOKENIZE_OPTIONS_TEXT') }}</legend>
            <option-item-block
                v-for="textOptItem in localOptions.text.items" :key="textOptItem.domain"
                :optionItem = "textOptItem" :emitUpdateData = "true"
                @updateData = "updateData" :disabled="disabled"
            />
        </fieldset>

        <fieldset class="alpheios-alignment-options-fieldset alpheios-alignment-options-fieldset__tei" v-show="sourceType === 'tei'">
            <legend>{{ l10n.getMsgS('TEXT_EDITOR_BLOCK_TOKENIZE_OPTIONS_TEI') }}</legend>
            <option-item-block
                v-for="textOptItem in localOptions.tei.items" :key="textOptItem.domain"
                :optionItem = "textOptItem" :emitUpdateData = "true"
                @updateData = "updateData" :disabled="disabled"

            />
        </fieldset>
    </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import OptionItemBlock from '@/vue/options/option-item-block.vue'

export default {
  name: 'TokenizeOptionsBlock',
  components: {
    optionItemBlock: OptionItemBlock
  },
  props: {
    localOptions: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
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