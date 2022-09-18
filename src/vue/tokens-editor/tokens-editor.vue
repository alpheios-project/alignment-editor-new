<template>
  <div class="alpheios-alignment-tokens-editor-block alpheios-alignment-editor-container">
      <h2 class="alpheios-alignment-text-editor-block__header">
        <span class="alpheios-alignment-text-editor-block__part">
          <span class="alpheios-alignment-text-editor-block__header-link" @click="goToTextEnterScreen">{{ l10n.getMsgS('TEXT_EDITOR_LINK') }}</span>
          <span class="alpheios-alignment-text-editor-block__header-link" @click="goToAlignTextScreen">{{ l10n.getMsgS('ALIGN_EDITOR_LINK') }}</span>
          <span class="alpheios-alignment-text-editor-block__header-label">{{ l10n.getMsgS('TOKENS_EDITOR_HEADING') }}</span>
        </span>
        <span class="alpheios-alignment-text-editor-block-buttons__part">
          <tooltip :tooltipText = "l10n.getMsgS('TEXT_EDITOR_HEADER_HELP')" tooltipDirection = "top">
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-button-with-icon" id="alpheios-actions-menu-button__enter-help"
                @click="$modal.show('help-edit')">
                <span class="alpheios-alignment-button-icon">
                  <question-icon />
                </span>
            </button>
          </tooltip>
          <tooltip :tooltipText = "l10n.getMsgS('TEXT_EDITOR_HEADER_OPTIONS')" tooltipDirection = "top">
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-button-with-icon" id="alpheios-actions-menu-button__enter-options"
                @click="$modal.show('options-edit')">
                <span class="alpheios-alignment-button-icon">
                  <gear-icon />
                </span>
            </button>
          </tooltip>
        </span>
        <span class="alpheios-alignment-text-editor-block__part alpheios-alignment-text-editor-block__part-right">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__enter-save"
              @click="$modal.show('save')">
              {{ l10n.getMsgS('TEXT_EDITOR_HEADER_SAVE') }}
          </button>
        </span>
      </h2>

    <tokens-editor-inner-block v-if="state.renderTokensEditor" @insertTokens="startInsertTokens" 
        :removeAllActivatedFlag = "state.removeAllActivatedFlag"/>

    <help-popup modalName = "help-edit">
      <template v-slot:content > <help-block-edit /> </template>
    </help-popup>
  
    <options-text-edit />

    <insert-tokens :token = "state.edittedToken"  />
  </div>
</template>
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import SettingsController from '@/lib/controllers/settings-controller.js'
import Tooltip from '@/vue/common/tooltip.vue'

import OptionsTextEdit from '@/vue/options/options-text-edit.vue'
import TokensEditorInnerBlock from '@/vue/tokens-editor/tokens-editor-inner-block.vue'

import HelpPopup from '@/vue/modal-slots/help-popup.vue'
import HelpBlockEdit from '@/vue/help-blocks/eng/help-block-edit.vue'
import InsertTokens from '@/vue/tokens-editor/insert-tokens-block.vue'

import QuestionIcon from '@/inline-icons/question.svg'
import GearIcon from '@/inline-icons/gear.svg'

import { computed, inject, reactive, watch } from 'vue'
import { useStore } from 'vuex'

const emit = defineEmits([ 'showSourceTextEditor', 'showAlignmentGroupsEditor' ])

const l10n = computed(() => { return L10nSingleton })
const $store = useStore()
const $modal =  inject('$modal')
const $alignedGC = inject('$alignedGC')

const props = defineProps({
  renderEditor: {
    type: Number,
    required: true
  }
})

const state = reactive({
  renderTokensEditor: false,
  showModalOptions: false,
  edittedToken: null,
  removeAllActivatedFlag: 1,

  saveEditState: 0,
  optionsTextEditState: 0,
  helpEditState: 0,
  insertTokensState: 0
})

watch( 
  () => $store.state.alignmentRestarted, 
  () => {
    state.renderTokensEditor = false
  }
)
watch( 
  () =>props.renderEditor, 
  () => {
    if (alignmentStared) { state.renderTokensEditor = true }
  }
)

const alignmentStared = computed(() => {
  return $store.state.alignmentUpdated && $alignedGC.alignmentGroupsWorkflowStarted
})

const startInsertTokens = (token) => {
  state.edittedToken = token
  $modal.show('insert-tokens')
}

const closeInsertTokens = () => {
  state.edittedToken = null
  $modal.show('insert-tokens')
}

const goToTextEnterScreen = () => {
  state.removeAllActivatedFlag = state.removeAllActivatedFlag + 1
  emit('showSourceTextEditor')
}

const goToAlignTextScreen = () => {
  state.removeAllActivatedFlag = state.removeAllActivatedFlag + 1
  emit('showAlignmentGroupsEditor')
}
</script>

<style lang="scss">
  .alpheios-alignment-tokens-editor-block.alpheios-alignment-editor-container {
    padding: 20px 30px 20px 40px;  
  }

</style>