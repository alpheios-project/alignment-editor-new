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
      <p class="alpheios-alignment-options__buttons">
        <button class="alpheios-editor-button-tertiary alpheios-options-button alpheios-options-reset-all" 
            @click="resetOptions" >
            {{ l10n.getMsgS('OPTIONS_BLOCK_RESET_ALL') }}
        </button>
      </p>
        <div class="alpheios-alignment-editor-modal-options-block">
            <option-item-block :optionItem = "enableAnnotationsOptionItem" :optionInfo="getOptionInfo('enableAnnotations')" />

            <fieldset v-show = "enableAnnotationsValue" class="alpheios-alignment-editor-modal-options-block-fieldset">
              <option-item-block :optionItem = "availableAnnotationTypesOptionItem"  :disabled = "disableAnnotationsTypes" />
              <option-item-block :optionItem = "maxCharactersAnnotationTextOptionItem" />
            </fieldset>

            <option-item-block :optionItem = "enableTokensEditorOptionItem" :optionInfo="getOptionInfo('enableTokensEditor')"/>
            <select-edit-icons v-show="enableTokensEditorValue" />           

            <option-item-block :optionItem = "isAcademicModeOptionItem" :optionInfo="getOptionInfo('isAcademicMode')"/>
            
            <fieldset v-show = "isAcademicModeValue" class="alpheios-alignment-editor-modal-options-block-fieldset">
              <option-item-block :optionItem = "enableDTSAPIUploadOptionItem" />
              <option-item-block :optionItem = "enableXMLTokenizationOptionsChoiceOptionItem" />
              <option-item-block :optionItem = "enableTextTokenizationOptionsChoiceOptionItem" />
            </fieldset>

            <fieldset v-show = "isAdvancedModeValue" class="alpheios-alignment-editor-modal-options-block-fieldset">
              <option-item-block :optionItem = "tokenizerOptionItem" />
              <option-item-block :optionItem = "useSpecificEnglishTokenizerOptionItem" />
            </fieldset>

            <fieldset v-show = "isAdvancedModeValue" class="alpheios-alignment-editor-modal-options-block-fieldset">
              <option-item-block :optionItem = "showSummaryPopupOptionItem" />
            </fieldset>

            <fieldset  v-show = "isAdvancedModeValue" class="alpheios-alignment-editor-modal-options-block-fieldset">
              <option-item-block :optionItem = "addIndexedDBSupportOptionItem" />
              <option-item-block :optionItem = "maxCharactersOptionItem" v-show="!addIndexedDBSupportValue"/>
              <option-item-block :optionItem = "maxCharactersPerPartOptionItem" v-show = "addIndexedDBSupportValue"/>
            </fieldset>
        </div>
        <p class="alpheios-alignment-options__buttons">
          <button class="alpheios-editor-button-tertiary alpheios-options-button alpheios-options-reset-all" 
              @click="setOptionsToAdvanced" >
              {{ l10n.getMsgS('OPTIONS_BLOCK_SET_ADVANCED') }}
          </button>
        </p>
    </div>
    <div class="alpheios-modal-footer" >
      <div class="alpheios-alignment-options__aboutcont">
        <h3>{{ l10n.getMsgS('OPTIONS_BLOCK_INFO_ABOUT') }}</h3>
        <div class="alpheios-alignment-options__versiontext">
          {{ $store.getters.libVersionData }}
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

import SelectEditIcons from '@/vue/options/select-edit-icons.vue'

export default {
  name: 'OptionsTextEnter',
  components: {
    optionItemBlock: OptionItemBlock,
    xCloseIcon: XCloseIcon,
    selectEditIcons: SelectEditIcons
  },
  props: {
    
  },
  data () {
    return {
      isAdvanced: false,
      optionsInfo: {
        enableAnnotations: 'OPTIONS_ANNOTATIONS_INFO',
        enableTokensEditor: 'OPTIONS_TOKENS_EDITOR_INFO',
        isAcademicMode: 'OPTIONS_IS_ACADEMIC_MODE_INFO'
      }
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
    enableTokensEditorOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableTokensEditor
    },
    enableDTSAPIUploadOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableDTSAPIUpload
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

    maxCharactersPerPartOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.maxCharactersPerPart
    }, 

    enableAnnotationsOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableAnnotations
    },

    disableAnnotationsTypes () {
      return this.$store.state.updateAnnotations && this.$store.state.docSourceUpdated && this.$textC.hasAnnotations
    },
    addIndexedDBSupportValue () {
      return this.$store.state.optionsUpdated && SettingsController.addIndexedDBSupport
    },
    
    isAcademicModeOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.isAcademicMode
    },

    enableAnnotationsValue () {
      return this.$store.state.optionsUpdated && SettingsController.enableAnnotations
    },

    enableTokensEditorValue () {
      return this.$store.state.optionsUpdated && SettingsController.enableTokensEditor
    },

    isAdvancedModeValue () {
      return this.$store.state.optionsUpdated && SettingsController.isAdvancedMode
    },

    isAdvancedModeOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.isAdvancedMode
    },

    isAcademicModeValue () {
      return this.$store.state.optionsUpdated && SettingsController.isAcademicMode
    },

    enableXMLTokenizationOptionsChoiceOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableXMLTokenizationOptionsChoice
    },

    enableTextTokenizationOptionsChoiceOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableTextTokenizationOptionsChoice
    }
  },
  methods: {
    async resetOptions () {
      await SettingsController.resetAllOptions()
    },

    setOptionsToAdvanced () {
      SettingsController.updateToAdvanced()
    },

    getOptionInfo (itemName) {
      return this.optionsInfo[itemName]
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

  .alpheios-alignment-editor-modal-options-block-fieldset {
    margin: 0 0 20px;
    border-color: #eeee;
    border-width: 1px;
    border-image: none;
    padding: 10px 10px 0;
  }
}
</style>