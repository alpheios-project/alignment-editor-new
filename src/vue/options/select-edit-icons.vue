<template>
    <div class="alpheios-alignment-editor-options-block alpheios-alignment-editor-options-block__select-edit-icons">
        <p class="alpheios-alignment-editor-options-block__select-edit-description">{{ l10n.getMsgS(state.description[props.screenType]) }}</p>
        <fieldset  class="alpheios-alignment-editor-modal-options-block-fieldset" 
                   :class="{ 'alpheios-alignment-editor-modal-options-block-fieldset__hidden-border': props.hiddenBorder }">
            <option-item-block :optionItem = "enableAddDeleteNewLinesOptionItem" 
                 :showLabelTextAsCheckboxLabel = "props.showLabelTextAsCheckboxLabel" />
            <option-item-block :optionItem = "enableAddDeleteTokensOptionItem" 
                 :showLabelTextAsCheckboxLabel = "props.showLabelTextAsCheckboxLabel" />
            <option-item-block :optionItem = "enableMergeSplitTokensOptionItem" 
                 :showLabelTextAsCheckboxLabel = "props.showLabelTextAsCheckboxLabel" />
            <option-item-block :optionItem = "enableMoveTokensToSegmentOptionItem" 
                 :showLabelTextAsCheckboxLabel = "props.showLabelTextAsCheckboxLabel" />
            <option-item-block :optionItem = "enableEditTokensOptionItem" 
                 :showLabelTextAsCheckboxLabel = "props.showLabelTextAsCheckboxLabel" />
        </fieldset>
    </div>
</template>
<script setup>
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import SettingsController from '@/lib/controllers/settings-controller.js'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import { computed, reactive } from 'vue'
import { useStore } from 'vuex'

const $store = useStore()
const l10n = computed(() => { return L10nSingleton })

const props = defineProps({
  showLabelTextAsCheckboxLabel: {
    type: Boolean,
    required: false,
    default: false
  },
  hiddenBorder: {
    type: Boolean,
    required: false,
    default: false
  },
  screenType: {
    type: String,
    required: false,
    default: 'align'
  }
})

const state = reactive({
  description: {
    align: 'OPTIONS_EDIT_ICONS_DESC_ALIGN',
    edit: 'OPTIONS_EDIT_ICONS_DESC_EDIT'
  }
})

const enableAddDeleteNewLinesOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.enableAddDeleteNewLines
})

const enableAddDeleteTokensOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.enableAddDeleteTokens
})

const enableMergeSplitTokensOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.enableMergeSplitTokens
})

const enableMoveTokensToSegmentOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.enableMoveTokensToSegment
})

const enableEditTokensOptionItem = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.enableEditTokens
})

</script>

<style lang="scss">
  .alpheios-alignment-editor-options-block.alpheios-alignment-editor-options-block__select-edit-icons {
    .alpheios-alignment-editor-modal-options-block-fieldset.alpheios-alignment-editor-modal-options-block-fieldset__hidden-border {
      margin: 0;
      border-width: 0;
      padding: 0;
    }

    .alpheios-alignment-editor-options-block__select-edit-description {
      color: #999999;
      font-size: 90%;
      margin: 0 0 10px;
    }
  }
</style>