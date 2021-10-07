<template>
  <modal classes="alpheios-alignment-editor-modal-options alpheios-alignment-editor-modal-options-enter" 
         name="options-enter" :draggable="true" height="auto">
    <div class="alpheios-modal-header" >
        <span class="alpheios-alignment-modal-close-icon" @click="$emit('closeModal')">
            <x-close-icon />
        </span>
        <h2 class="alpheios-alignment-editor-modal-header">{{ l10n.getMsgS('OPTIONS_TITLE_TEXT_ENTER') }}</h2>
    </div>
    <div class="alpheios-modal-body" >
        <div class="alpheios-alignment-editor-modal-options-block">
            <option-item-block :optionItem = "themeOptionItem" />
            <option-item-block :optionItem = "tokenizerOptionItem" />
            <option-item-block :optionItem = "availableAnnotationTypesOptionItem"  :disabled = "disableAnnotationsTypes" />
            <option-item-block :optionItem = "maxCharactersAnnotationTextOptionItem" />
            <option-item-block :optionItem = "maxCharactersPerPart" />
            <option-item-block :optionItem = "useSpecificEnglishTokenizerOptionItem" />
            <option-item-block :optionItem = "showSummaryPopupOptionItem" />

            <option-item-block :optionItem = "addIndexedDBSupportOptionItem"/>
            <option-item-block :optionItem = "maxCharactersOptionItem" v-show="!addIndexedDBSupportValue"/>
        </div>
    </div>
    <div class="alpheios-modal-footer" >
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
    </div>
  </modal>
</template>
<script>
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import XCloseIcon from '@/inline-icons/x-close.svg'
import SettingsController from '@/lib/controllers/settings-controller.js'

export default {
  name: 'OptionsTextEnter',
  components: {
    optionItemBlock: OptionItemBlock,
    xCloseIcon: XCloseIcon
  },
  props: {
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

    addIndexedDBSupportOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.addIndexedDBSupport
    },
    availableAnnotationTypesOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.availableAnnotationTypes
    },

    maxCharactersAnnotationTextOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.maxCharactersAnnotationText
    },

    maxCharactersPerPart () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.maxCharactersPerPart
    }, 
    versionData () {
      return `${this.$store.state.libName} ${this.$store.state.libVersion} (${this.$store.state.libBuildNameForDisplay})`
    },
    disableAnnotationsTypes () {
      return this.$store.state.updateAnnotations && this.$store.state.docSourceUpdated && this.$textC.hasAnnotations
    },
    addIndexedDBSupportValue () {
      return this.$store.state.optionsUpdated && SettingsController.addIndexedDBSupport
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