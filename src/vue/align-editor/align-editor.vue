<template>
  <div class="alpheios-alignment-text-editor-block__align alpheios-alignment-align-editor-block alpheios-alignment-editor-container  alpheios-tools-enabled">
      <h2 class="alpheios-alignment-text-editor-block__header">
        <span class="alpheios-alignment-text-editor-block__part alpheios-alignment-text-editor-block__part-1">
          <span class="alpheios-alignment-text-editor-block__header-link" @click="emit('showSourceTextEditor')">
                {{ l10n.getMsgS('TEXT_EDITOR_LINK') }}</span>
          <span class="alpheios-alignment-text-editor-block__header-label">{{ l10n.getMsgS('ALIGN_EDITOR_HEADING') }}</span>
          <span class="alpheios-alignment-text-editor-block__header-link" v-if="tokensEditAvailable" 
                 @click="emit('showTokensEditor')">{{ l10n.getMsgS('TOKENS_EDITOR_LINK') }}</span>
          
          <div class="alpheios-alignment-toggle-block alpheios-alignment-annotation-mode-check-container" 
                v-if="enableAnnotationsValue">
            <label class="alpheios-switch">
              <input type="checkbox" v-model="state.annotationMode" id="alpheios-alignment-annotation-mode-check">
              <span class="alpheios-slider alpheios-round"></span>
            </label>
            <span class="alpheios-switch-label">{{ l10n.getMsgS("ALIGN_EDITOR_ANNOTATION_MODE") }}</span>
          </div>


        </span>
        
        <span class="alpheios-alignment-text-editor-block-buttons__part alpheios-alignment-text-editor-block__part-2">
          <tooltip :tooltipText = "l10n.getMsgS('TEXT_EDITOR_HEADER_HELP')" tooltipDirection = "top">
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-button-with-icon" id="alpheios-actions-menu-button__enter-help"
                @click="$modal.show('help-align')">
                <span class="alpheios-alignment-button-icon">
                  <question-icon />
                </span>
            </button>
          </tooltip>
          <tooltip :tooltipText = "l10n.getMsgS('TEXT_EDITOR_HEADER_OPTIONS')" tooltipDirection = "top">
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-button-with-icon" id="alpheios-actions-menu-button__enter-options"
                @click="$modal.show('options-align')" >
                <span class="alpheios-alignment-button-icon">
                  <gear-icon />
                </span>
            </button>
          </tooltip>
        </span>

        <span class="alpheios-alignment-text-editor-block__part alpheios-alignment-text-editor-block__part-3">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__enter-save"
              @click="$modal.show('save')">
              {{ l10n.getMsgS("ALIGN_EDITOR_SAVE") }}
          </button>
        </span>
      </h2>

    <align-editor-view-mode v-if="renderAlignEditor" @update-annotation = "updateAnnotation" 
            :annotationMode="state.annotationMode"/>   
   
    <help-popup modalName = "help-align">
      <template v-slot:content > <help-block-align /> </template>
    </help-popup>
  
    <options-text-align />

    <annotation :token = "state.annotationToken" />
  </div>
</template>
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import SettingsController from '@/lib/controllers/settings-controller.js'
import Tooltip from '@/vue/common/tooltip.vue'

import SavePopup from '@/vue/modal-slots/save-popup.vue'
import OptionsTextAlign from '@/vue/options/options-text-align.vue'

import AlignEditorViewMode from '@/vue/align-editor/align-editor-view-mode.vue'

import HelpPopup from '@/vue/modal-slots/help-popup.vue'
import HelpBlockAlign from '@/vue/help-blocks/eng/help-block-align.vue'
import Annotation from '@/vue/align-editor/modal_slots/annotation-block.vue'

import QuestionIcon from '@/inline-icons/question.svg'
import GearIcon from '@/inline-icons/gear.svg'

import { computed, inject, reactive } from 'vue'

import { useStore } from 'vuex'

const emit = defineEmits([ 'showSourceTextEditor', 'showTokensEditor' ])

const $modal = inject('$modal')
const l10n = computed(() => { return L10nSingleton })
const $store = useStore()
const $alignedGC = inject('$alignedGC')

const state = reactive({
  annotationToken: null,
  annotationMode: false
})

const renderAlignEditor = computed(() => {
  state.annotationMode = false
  return $store.state.alignmentUpdated && $store.state.uploadCheck && $alignedGC.alignmentGroupsWorkflowStarted
})

const enableTokensEditorOptionItemValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.enableTokensEditor
})

const useModeStructureValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.useModeStructure
})

const tokensEditAvailable = computed(() => {
  return enableTokensEditorOptionItemValue.value
})

const enableAnnotationsValue = computed(() => {
  if (!useModeStructureValue.value || !SettingsController.enableAnnotations) { 
    state.annotationMode = false 
  }
  return $store.state.optionsUpdated && SettingsController.enableAnnotations && state.useModeStructureValue
})

const updateAnnotation = (token) => {
  state.annotationToken = token
  $modal.show('annotation')
}

const closeAnnotationModal = () => {
  state.annotationToken = null
  $modal.hide('annotation')
}

</script>
<style lang="scss">
  .alpheios-alignment-align-editor-block.alpheios-alignment-editor-container {
    padding: 20px 30px 20px 40px;  
  }

  .alpheios-alignment-text-editor-block__part {
    min-width: 255px;

    &.alpheios-alignment-text-editor-block__part-2 {
      text-align: center;
    }

    &.alpheios-alignment-text-editor-block__part-3 {
      text-align: right;
    }
  }

  div.alpheios-alignment-annotation-mode-check-container {
    display: block;
    line-height: initial;
    max-width: initial;
    min-height: initial;
    padding-top: 5px;


    .alpheios-switch-label {
      font-weight: normal;
      font-size: 80%;
      padding-left: 5px;
      line-height: 22px;
    }
  }

</style>