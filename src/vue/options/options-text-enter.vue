<template>
  <modal-base modalName="options-enter" :draggable="true" height="auto" :shiftY="0.3" > 
    <div class="alpheios-alignment-editor-modal-options" data-alpheios-ignore="all">
      <div class="alpheios-modal-header" >
          <span class="alpheios-alignment-modal-close-icon" @click="closeModal">
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
                    <i class="alpheios-arrow" :class="{ 'alpheios-up': !state.isAcademic, 'alpheios-down': state.isAcademic }"></i>
                  </span>
              </p>

              <div class="alpheios-alignment-options__fieldset-group alpheios-alignment-options__fieldset-group_academic" 
                  :class = "{ 'alpheios-collapsed': !state.isAcademic, 'alpheios-expanded': state.isAcademic, 'alpheios-academic-short': !enableTEXTXMLIconValue }">
                <fieldset class="alpheios-alignment-editor-modal-options-block-fieldset">
                  <option-item-block :optionItem = "enableDTSAPIUploadOptionItem" />
                  <option-item-block :optionItem = "showSummaryPopupOptionItem" 
                      :optionInfo="getOptionInfo('showSummaryPopupOption')" />
                  <option-item-block :optionItem = "enableTEXTXMLIconOptionItem" 
                      :optionInfo="getOptionInfo('enableTEXTXMLIconOption')" />
                  <option-item-block :optionItem = "enableTokenizationOptionsChoiceOptionItem" 
                      :optionInfo="getOptionInfo('enableTokenizationOptionsChoiceOption')"
                  v-show = "enableTEXTXMLIconValue" />
                </fieldset>
              </div>

              <p class="alpheios-alignment-options__expander-container" @click="setOptionsToAdvanced">
                  <span class="alpheios-options-expander-label" >{{ l10n.getMsgS('OPTIONS_BLOCK_SET_ADVANCED') }}
                    <tooltip :tooltipText="l10n.getMsgS('OPTIONS_IS_ADVANCED_MODE_INFO')" tooltipDirection="top">
                      <span class="alpheios-alignment-option-item__label-info">?</span>
                    </tooltip>  
                    <i class="alpheios-arrow" :class="{ 'alpheios-up': !state.isAdvanced, 'alpheios-down': state.isAdvanced }"></i>
                  </span>
              </p>

              <div class="alpheios-alignment-options__fieldset-group alpheios-alignment-options__fieldset-group_advanced" 
                  :class = "{ 'alpheios-collapsed': !state.isAdvanced, 'alpheios-expanded': state.isAdvanced }">
              
                <fieldset class="alpheios-alignment-editor-modal-options-block-fieldset">
                  <option-item-block :optionItem = "enableChangeLanguageIconOptionItem" />
                </fieldset>


                <fieldset class="alpheios-alignment-editor-modal-options-block-fieldset">
                  <option-item-block :optionItem = "tokenizerOptionItem" :optionInfo="getOptionInfo('tokenizerOptionItem')" />
                  <option-item-block :optionItem = "useSpecificEnglishTokenizerOptionItem" 
                        :optionInfo="getOptionInfo('useSpecificEnglishTokenizer')" />
                </fieldset>

                <fieldset  class="alpheios-alignment-editor-modal-options-block-fieldset">
                  <option-item-block :optionItem = "addIndexedDBSupportOptionItem" 
                        :optionInfo="getOptionInfo('addIndexedDBSupport')" />
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
    </div>
  </modal-base>
</template>
<script setup>
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import XCloseIcon from '@/inline-icons/xclose.svg'
import SettingsController from '@/lib/controllers/settings-controller.js'

import Tooltip from '@/vue/common/tooltip.vue'

import { reactive, ref, inject, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const $store = useStore()

const modalBody = ref(null)

const l10n = computed(() => { return L10nSingleton })
const $modal =  inject('$modal')

const state = reactive({
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
})

const closeModal = () => {
  $modal.hide('options-enter')
}

const themeOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.theme
})
    
const tokenizerOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.tokenizer
})
    
const maxCharactersOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.maxCharactersPerText
})

const useSpecificEnglishTokenizerOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.useSpecificEnglishTokenizer
})

const showSummaryPopupOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.showSummaryPopup
})

const enableDTSAPIUploadOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.enableDTSAPIUpload
})

const addIndexedDBSupportOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.addIndexedDBSupport
})

const maxCharactersPerPartOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.maxCharactersPerPart
})

const addIndexedDBSupportValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.addIndexedDBSupport
})

const enableTokenizationOptionsChoiceOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.enableTokenizationOptionsChoice
})

const enableChangeLanguageIconOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.enableChangeLanguageIcon
})

const enableTEXTXMLIconOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.enableTEXTXMLIcon
})

const enableTEXTXMLIconValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.enableTEXTXMLIcon
})

const resetOptions = () => {
  SettingsController.resetAllOptions()
}

const setOptionsToAdvanced = () => {
  state.isAdvanced = !state.isAdvanced

  if (state.isAcademic) {
    scrollModalBody(200)
  }
}

const setOptionsToAcademic = () => {
  state.isAcademic = !state.isAcademic
}

const getOptionInfo = (itemName) => {
  return state.optionsInfo[itemName]
}

const scrollModalBody = (height) => {
  const container = modalBody.value
  const finalHeight = container.scrollTop + height
  setTimeout(() => {
    container.scroll({
      top: finalHeight,
      behavior: 'smooth'
    })
  }, 300)
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