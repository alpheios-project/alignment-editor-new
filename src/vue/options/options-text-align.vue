<template>
  <modal-base modalName="options-align" :draggable="true" height="auto" :shiftY="0.3" > 
    <div class="alpheios-alignment-editor-modal-options alpheios-alignment-editor-modal-options-align" data-alpheios-ignore="all">
      <div class="alpheios-modal-header" >
          <span class="alpheios-alignment-modal-close-icon" @click="closeModal">
              <x-close-icon />
          </span>
          <h2 class="alpheios-alignment-editor-modal-header">{{ l10n.getMsgS('OPTIONS_TITLE_TEXT_ALIGN') }}</h2>
      </div>
      <div class="alpheios-modal-body" >

        <div class="alpheios-alignment-editor-modal-options-block">
          <option-item-block :optionItem = "enableAnnotationsOptionItem" :optionInfo="getOptionInfo('enableAnnotations')" />
          
          <fieldset v-show = "enableAnnotationsValue" class="alpheios-alignment-editor-modal-options-block-fieldset">
            <option-item-block :optionItem = "availableAnnotationTypesOptionItem"  :disabled = "disableAnnotationsTypes" />
            <option-item-block :optionItem = "maxCharactersAnnotationTextOptionItem" />
          </fieldset>

          <option-item-block :optionItem = "enableTokensEditorOptionItem" :optionInfo="getOptionInfo('enableTokensEditor')"/>
          <select-edit-icons v-show="enableTokensEditorValue" :showLabelTextAsCheckboxLabel = "true" screenType="align" />

          <option-item-block :optionItem = "enableAlpheiosReadingToolsOptionItem" :optionInfo="getOptionInfo('enableAlpheiosReadingTools')" />

        </div>

      </div>
      <div class="alpheios-modal-footer" >
        <div class="alpheios-alignment-options__aboutcont">
          <h3>{{ l10n.getMsgS('OPTIONS_BLOCK_INFO_ABOUT') }}</h3>
          <div class="alpheios-alignment-options__versiontext">
            {{ versionData }}
          </div>
        </div>
      </div>
    </div>
  </modal-base>
</template>
<script setup>
import XCloseIcon from '@/inline-icons/xclose.svg'
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import SelectEditIcons from '@/vue/options/select-edit-icons.vue'

import SettingsController from '@/lib/controllers/settings-controller'

import { reactive, ref, inject, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const $store = useStore()

const l10n = computed(() => { return L10nSingleton })
const $modal = inject('$modal')
const $textC = inject('$textC')

const state = reactive({
  optionsInfo: {
    enableAlpheiosReadingTools: 'OPTIONS_READING_TOOLS_INFO',
    enableAnnotations: 'OPTIONS_ANNOTATIONS_INFO',
    enableTokensEditor: 'OPTIONS_TOKENS_EDITOR_INFO',
  }
})

const closeModal = () => {
  $modal.hide('options-align')
}

const versionData = computed(() => {
  return `${$store.state.libName} ${$store.state.libVersion} (${$store.state.libBuildNameForDisplay})`
})

const enableAlpheiosReadingToolsOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.enableAlpheiosReadingTools
})

const enableAnnotationsValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.enableAnnotations
})

const availableAnnotationTypesOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.availableAnnotationTypes
})

const disableAnnotationsTypes = computed(() => {
  return $store.state.updateAnnotations && $store.state.docSourceUpdated && $textC.hasAnnotations
})

const maxCharactersAnnotationTextOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.maxCharactersAnnotationText
})

const enableTokensEditorOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.enableTokensEditor
})

const enableAnnotationsOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.enableAnnotations
})

const enableTokensEditorValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.enableTokensEditor
})

const resetOptions = () => {
  SettingsController.resetAllOptions()
}

const getOptionInfo = (itemName) => {
  return state.optionsInfo[itemName]
}
</script>

<style lang="scss">
.alpheios-alignment-editor-modal-options.alpheios-alignment-editor-modal-options-align {
  .alpheios-modal-container {
    width: 700px;
  }
  .alpheios-modal-body {
    // max-height: 700px;
    // border: 0;
    margin: 0 0 20px;
    padding-top: 20px;
  }

  .alpheios-alignment-editor-modal-options-block {
      padding: 10px;
  }
  .alpheios-alignment-editor-modal-header {
    margin-bottom: 10px;
  }


}
</style>