<template>
  <modal v-if="showModal" @close="$emit('closeModal')" class="alpheios-alignment-editor-modal-options">
    <template v-slot:header >
        <h2 class="alpheios-alignment-editor-modal-header">{{ l10n.getMsgS('OPTIONS_TITLE_TEXT_ENTER') }}</h2>
    </template>
    <template v-slot:body >
        <div class="alpheios-alignment-editor-modal-options-block">
            <option-item-block :optionItem = "themeOptionItem" />
            <option-item-block :optionItem = "tokenizerOptionItem" />
            <option-item-block :optionItem = "maxCharactersOptionItem" />
            <option-item-block :optionItem = "useSpecificEnglishTokenizerOptionItem" />
            <option-item-block :optionItem = "showSummaryPopupOptionItem" />
            <option-item-block :optionItem = "maxCharactersPerPart" />
            <option-item-block :optionItem = "addIndexedDBSupport" />
        </div>
    </template>
    <template v-slot:footer>
      <p class="alpheios-alignment-options__buttons">
        <button class="alpheios-editor-button-tertiary alpheios-options-button alpheios-options-reset-all" 
            @click="resetOptions" >
            {{ l10n.getMsgS('OPTIONS_BLOCK_RESET_ALL') }}
        </button>
      </p>
      <div class="alpheios-alignment-options__aboutcont">
        <h3>{{ l10n.getMsgS('OPTIONS_BLOCK_INFO_ABOUT') }}</h3>
        <div class="alpheios-alignment-options__versiontext">
          {{ versionData }}
        </div>
      </div>
    </template>
  </modal>
</template>
<script>
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import Modal from '@/vue/common/modal.vue'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import SettingsController from '@/lib/controllers/settings-controller.js'

export default {
  name: 'OptionsTextEnter',
  components: {
    optionItemBlock: OptionItemBlock,
    modal: Modal
  },
  props: {
    showModal: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    themeOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.theme
    },
    tokenizerOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.tokenizer
    },
    maxCharactersOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.maxCharactersPerText
    },
    useSpecificEnglishTokenizerOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.useSpecificEnglishTokenizer
    },
    showSummaryPopupOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.showSummaryPopup
    },
    maxCharactersPerPart () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.maxCharactersPerPart
    },
    addIndexedDBSupport () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.addIndexedDBSupport
    },
    versionData () {
      return `${this.$store.state.libName} ${this.$store.state.libVersion} (${this.$store.state.libBuildNameForDisplay})`
    }
  },
  methods: {
    async resetOptions () {
      await SettingsController.resetAllOptions()
    }
  }
}
</script>
<style lang="scss">
.alpheios-alignment-editor-modal-options {
  .alpheios-modal-container {
    width: 700px;
  }
  .alpheios-modal-body {
    // max-height: 700px;
    margin: 0 0 20px;

    border: 0;
    border-top: 2px solid #ddd;
    padding: 10px 0 0 0;
  }

  .alpheios-alignment-editor-modal-options-block {
      padding: 10px;
  }
  .alpheios-alignment-editor-modal-header {
    margin-bottom: 10px;
  }

  .alpheios-alignment-options__buttons {
    margin: 0;
  }
}
</style>