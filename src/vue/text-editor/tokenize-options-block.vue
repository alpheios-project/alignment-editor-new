<template>
    <div class="alpheios-alignment-editor-text-blocks-single-tokenize-options">
        <fieldset class="alpheios-alignment-editor-options-fieldset alpheios-alignment-editor-options-fieldset-slim alpheios-alignment-editor-options-fieldset-label-auto">
            <legend>{{ l10n.getMsgS('TEXT_EDITOR_BLOCK_TOKENIZE_OPTIONS') }}</legend>
            <option-item-block
              :optionItem = "localOptions.sourceText.items.sourceType"
              :emitUpdateData = "true"
              @updateData = "$emit('updateText')" :disabled="disabled"
            />
        </fieldset>

      <div class="alpheios-alignment-editor-tokenize-options__details-container">
        <fieldset class="alpheios-alignment-editor-options-fieldset alpheios-alignment-editor-options-fieldset__text" v-show="sourceType === 'text'">
            <legend>{{ l10n.getMsgS('TEXT_EDITOR_BLOCK_TOKENIZE_OPTIONS_TEXT') }}</legend>
            <option-item-block
                v-for="textOptItem in localOptions.text.items" :key="textOptItem.domain"
                :optionItem = "textOptItem" :emitUpdateData = "true"
                @updateData = "$emit('updateText')" :disabled="disabled"
            />
        </fieldset>

        <fieldset class="alpheios-alignment-editor-options-fieldset alpheios-alignment-editor-options-fieldset__tei" v-show="sourceType === 'tei'">
            <legend>{{ l10n.getMsgS('TEXT_EDITOR_BLOCK_TOKENIZE_OPTIONS_TEI') }}</legend>
            <option-item-block
                v-for="textOptItem in localOptions.tei.items" :key="textOptItem.domain"
                :optionItem = "textOptItem" :emitUpdateData = "true"
                @updateData = "$emit('updateText')" :disabled="disabled"

            />
        </fieldset>
      </div>

    </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import SettingsController from '@/lib/controllers/settings-controller.js'

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
  computed: {
    l10n () {
      return L10nSingleton
    },
    showOptions () {
      return this.$store.state.optionsUpdated && this.localOptions.ready && SettingsController.tokenizerOptionsLoaded
    },
    sourceType () {
      return this.$store.state.optionsUpdated && this.localOptions.sourceText.items.sourceType.currentValue
    }

  },
  methods: {
    toggleShowTokenizeDetails () {
      this.showTokenizeDetails = !this.showTokenizeDetails
    }
  }
}

</script>
<style lang="scss">
p.alpheios-alignment-editor-tokenize-options__details-toggle {
  display: inline-block;
  cursor: pointer;
  font-size: 90%;
  text-decoration: underline;
  color: #185F6D;
  margin: 0;
}
.alpheios-alignment-editor-text-blocks-single-tokenize-options  {
  .alpheios-alignment-option-item {
    margin-bottom: 5px;
  }
  p.alpheios-alignment-editor-tokenize-options__details-toggle {
    display: inline-block;
    cursor: pointer;
    font-size: 90%;
    text-decoration: underline;
    margin: 0;
  }
}
</style>

