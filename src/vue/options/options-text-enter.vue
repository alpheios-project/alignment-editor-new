<template>
  <modal classes="alpheios-alignment-editor-modal-options alpheios-alignment-editor-modal-options-enter" 
         name="options-enter" :draggable="true" height="auto">
    <div class="alpheios-modal-header" >
        <span class="alpheios-alignment-modal-close-icon" @click="$emit('closeModal')">
            <x-close-icon />
        </span>
        <h2 class="alpheios-alignment-editor-modal-header">{{ l10n.getMsgS('OPTIONS_TITLE_TEXT_ENTER') }}</h2>
    </div>
    <div class="alpheios-modal-body" ref="modalBody">
      <p class="alpheios-alignment-options__buttons">
        <button class="alpheios-editor-button-tertiary alpheios-options-button alpheios-options-reset-all" 
            @click="resetOptions" >
            {{ l10n.getMsgS('OPTIONS_BLOCK_RESET_ALL') }}
        </button>
      </p>
        <div class="alpheios-alignment-editor-modal-options-block">
           
            <p class="alpheios-alignment-options__expander-container" @click="setOptionsToAcademic">
                <span class="alpheios-options-expander-label" >{{ l10n.getMsgS('OPTIONS_BLOCK_SET_ACADEMIC') }}
                  <tooltip :tooltipText="l10n.getMsgS('OPTIONS_IS_ACADEMIC_MODE_INFO')" tooltipDirection="top">
                    <span class="alpheios-alignment-option-item__label-info">?</span>
                  </tooltip>  
                  <i class="alpheios-arrow" :class="{ 'alpheios-up': !isAcademic, 'alpheios-down': isAcademic }"></i>
                </span>
            </p>

            <div class="alpheios-alignment-options__fieldset-group alpheios-alignment-options__fieldset-group_academic" 
                 :class = "{ 'alpheios-collapsed': !isAcademic, 'alpheios-expanded': isAcademic, 'alpheios-academic-short': !enableTEXTXMLIconValue }">
              <fieldset class="alpheios-alignment-editor-modal-options-block-fieldset">
                <option-item-block :optionItem = "enableDTSAPIUploadOptionItem" />
                <option-item-block :optionItem = "showSummaryPopupOptionItem" :optionInfo="getOptionInfo('showSummaryPopupOption')" />
                <option-item-block :optionItem = "enableTEXTXMLIconOptionItem" :optionInfo="getOptionInfo('enableTEXTXMLIconOption')" />
                <option-item-block :optionItem = "enableTokenizationOptionsChoiceOptionItem" :optionInfo="getOptionInfo('enableTokenizationOptionsChoiceOption')"
                v-show = "enableTEXTXMLIconValue" />
              </fieldset>
            </div>

            <p class="alpheios-alignment-options__expander-container" @click="setOptionsToAdvanced">
                <span class="alpheios-options-expander-label" >{{ l10n.getMsgS('OPTIONS_BLOCK_SET_ADVANCED') }}
                  <tooltip :tooltipText="l10n.getMsgS('OPTIONS_IS_ADVANCED_MODE_INFO')" tooltipDirection="top">
                    <span class="alpheios-alignment-option-item__label-info">?</span>
                  </tooltip>  
                  <i class="alpheios-arrow" :class="{ 'alpheios-up': !isAdvanced, 'alpheios-down': isAdvanced }"></i>
                </span>
            </p>

            <div class="alpheios-alignment-options__fieldset-group alpheios-alignment-options__fieldset-group_advanced" 
                 :class = "{ 'alpheios-collapsed': !isAdvanced, 'alpheios-expanded': isAdvanced }">
             
              <fieldset class="alpheios-alignment-editor-modal-options-block-fieldset">
                <option-item-block :optionItem = "enableChangeLanguageIconOptionItem" />
              </fieldset>


              <fieldset class="alpheios-alignment-editor-modal-options-block-fieldset">
                <option-item-block :optionItem = "tokenizerOptionItem" :optionInfo="getOptionInfo('tokenizerOptionItem')" />
                <option-item-block :optionItem = "useSpecificEnglishTokenizerOptionItem" :optionInfo="getOptionInfo('useSpecificEnglishTokenizer')" />
              </fieldset>

              <fieldset  class="alpheios-alignment-editor-modal-options-block-fieldset">
                <option-item-block :optionItem = "addIndexedDBSupportOptionItem" :optionInfo="getOptionInfo('addIndexedDBSupport')" />
                <option-item-block :optionItem = "maxCharactersOptionItem" v-show="!addIndexedDBSupportValue"/>
                <option-item-block :optionItem = "maxCharactersPerPartOptionItem" v-show = "addIndexedDBSupportValue"/>
              </fieldset>
            </div>
        </div>
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
import Vue from '@vue-runtime'

import OptionItemBlock from '@/vue/options/option-item-block.vue'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import XCloseIcon from '@/inline-icons/x-close.svg'
import SettingsController from '@/lib/controllers/settings-controller.js'

import Tooltip from '@/vue/common/tooltip.vue'

export default {
  name: 'OptionsTextEnter',
  components: {
    optionItemBlock: OptionItemBlock,
    xCloseIcon: XCloseIcon,
    tooltip: Tooltip
  },
  props: {
    
  },
  data () {
    return {
      isAdvanced: false,
      isAcademic: false,
      optionsInfo: {
        enableAnnotations: 'OPTIONS_ANNOTATIONS_INFO',
        enableTokensEditor: 'OPTIONS_TOKENS_EDITOR_INFO',
        tokenizerOptionItem: 'OPTIONS_TOKENIZER_SERVICE_INFO',
        useSpecificEnglishTokenizer: 'OPTIONS_SPECIFIC_ENGLISH_INFO',
        addIndexedDBSupport: 'OPTIONS_INDEXEDDB_SUPPORT_INFO',
        
        enableTEXTXMLIconOption: "OPTIONS_TEXT_XML_INFO",
        enableTokenizationOptionsChoiceOption: "OPTIONS_TEXT_XML_MODIFICATION_INFO",
        showSummaryPopupOption: "OPTIONS_FINAL_CHECK_INFO"
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
    enableDTSAPIUploadOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableDTSAPIUpload
    },
    addIndexedDBSupportOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.addIndexedDBSupport
    },

    maxCharactersPerPartOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.maxCharactersPerPart
    }, 

    addIndexedDBSupportValue () {
      return this.$store.state.optionsUpdated && SettingsController.addIndexedDBSupport
    },

    enableTokenizationOptionsChoiceOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableTokenizationOptionsChoice
    },

    enableChangeLanguageIconOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableChangeLanguageIcon
    },

    enableTEXTXMLIconOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableTEXTXMLIcon
    },

    enableTEXTXMLIconValue () {
      return this.$store.state.optionsUpdated && SettingsController.enableTEXTXMLIcon
    }
  },
  methods: {
    async resetOptions () {
      await SettingsController.resetAllOptions()
    },

    setOptionsToAdvanced () {
      this.isAdvanced = !this.isAdvanced

      if (this.isAcademic) {
        this.scrollModalBody(200)
      }
    
    },

    setOptionsToAcademic () {
      this.isAcademic = !this.isAcademic
    },

    getOptionInfo (itemName) {
      return this.optionsInfo[itemName]
    },

    scrollModalBody (height) {
      const container = this.$refs.modalBody
      const finalHeight = container.scrollTop + height
      setTimeout(() => {
        container.scroll({
          top: finalHeight,
          behavior: 'smooth'
        })
      }, 300)
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

  .alpheios-options-expander-label {
    display: inline-block;
    cursor: pointer;
    width: 100%;
    background: #eee;
    padding: 10px;
    border-radius: 2px;

    i {
      display: block;
      float: right;
      margin: 10px;
      border-color: #555;
      border-width: 0 4px 4px 0;
      padding: 4px;
    }

    &:before,
    &:after {
      clear: both;
      display: table;
      content: '';
    }
  }

  .alpheios-alignment-options__fieldset-group {
    transition: all 1s;
    overflow: hidden;
    &.alpheios-collapsed {
      height: 0;
    }
    &.alpheios-alignment-options__fieldset-group_academic.alpheios-expanded {
      height: 200px;

      &.alpheios-academic-short {
        height: 155px;
      }
    }

    &.alpheios-alignment-options__fieldset-group_advanced.alpheios-expanded {
      height: 395px;
    }
  }

}
</style>