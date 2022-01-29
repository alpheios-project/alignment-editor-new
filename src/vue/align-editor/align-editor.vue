<template>
  <div class="alpheios-alignment-align-editor-block alpheios-alignment-editor-container  alpheios-tools-enabled">
      <h2 class="alpheios-alignment-text-editor-block__header">
        <span class="alpheios-alignment-text-editor-block__part alpheios-alignment-text-editor-block__part-1">
          <span class="alpheios-alignment-text-editor-block__header-link" @click="$emit('showSourceTextEditor')">{{ l10n.getMsgS('TEXT_EDITOR_LINK') }}</span>
          <span class="alpheios-alignment-text-editor-block__header-label">{{ l10n.getMsgS('ALIGN_EDITOR_HEADING') }}</span>
          <span class="alpheios-alignment-text-editor-block__header-link" v-if="tokensEditAvailable" @click="$emit('showTokensEditor')">{{ l10n.getMsgS('TOKENS_EDITOR_LINK') }}</span>
          
          <div class="alpheios-alignment-toggle-block alpheios-alignment-annotation-mode-check-container" v-if="enableAnnotatiosValue">
            <label class="alpheios-switch">
              <input type="checkbox" v-model="annotationMode" id="alpheios-alignment-annotation-mode-check">
              <span class="alpheios-slider alpheios-round"></span>
            </label>
            <span class="alpheios-switch-label">{{ l10n.getMsgS("ALIGN_EDITOR_ANNOTATION_MODE") }}</span>
          </div>


        </span>
        
        <span class="alpheios-alignment-text-editor-block-buttons__part alpheios-alignment-text-editor-block__part-2">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-button-with-icon" id="alpheios-actions-menu-button__enter-help"
              @click="$modal.show('help-align')">
              <span class="alpheios-alignment-button-icon">
                <question-icon />
              </span>
          </button>
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-button-with-icon" id="alpheios-actions-menu-button__enter-options"
              @click="$modal.show('options-align')" :disabled="true">
              <span class="alpheios-alignment-button-icon">
                <gear-icon />
              </span>
          </button>
        </span>

        <span class="alpheios-alignment-text-editor-block__part alpheios-alignment-text-editor-block__part-3">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__enter-save"
              @click="$modal.show('save-align')">
              {{ l10n.getMsgS("ALIGN_EDITOR_SAVE") }}
          </button>
        </span>
      </h2>

      <help-popup @closeModal = "$modal.hide('help-align')" mname = "help-align">
        <template v-slot:content > <help-block-align /> </template>
      </help-popup>

    <align-editor-view-mode v-if="renderAlignEditor" @update-annotation = "updateAnnotation" :annotationMode="annotationMode"/>   
    <save-popup @closeModal = "$modal.hide('save-align')" mname = "save-align" />
    <options-text-align-popup @closeModal = "$modal.hide('options-align')" />
    <annotation-block-popup @closeModal = "closeAnnotationModal" 
                            :token = "annotationToken" 
    />
  </div>
</template>
<script>
import Vue from '@vue-runtime'

import AlignEditorViewMode from '@/vue/align-editor/align-editor-view-mode.vue'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import HelpPopup from '@/vue/common/help-popup.vue'
import SavePopup from '@/vue/common/save-popup.vue'
import OptionsTextAlign from '@/vue/options/options-text-align.vue'
import AnnotationBlockPopup from '@/vue/align-editor/annotation-block.vue'
import SettingsController from '@/lib/controllers/settings-controller.js'

import HelpBlockAlign from '@/vue/help-blocks/eng/help-block-align.vue'

import QuestionIcon from '@/inline-icons/question.svg'
import GearIcon from '@/inline-icons/gear.svg'

export default {
  name: 'AlignEditor',
  components: {
    alignEditorViewMode: AlignEditorViewMode,
    helpPopup: HelpPopup,
    savePopup: SavePopup,
    helpBlockAlign: HelpBlockAlign,
    optionsTextAlignPopup: OptionsTextAlign,
    annotationBlockPopup: AnnotationBlockPopup,

    questionIcon: QuestionIcon,
    gearIcon: GearIcon
  },
  props: {
  },
  data () {
    return {
      showModalOptions: false,
      annotationToken: null,
      annotationMode: false
    }
  },
  watch: {
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    renderAlignEditor ()  {
      this.annotationMode = false
      return this.$store.state.alignmentUpdated && this.$store.state.uploadCheck &&this.$alignedGC.alignmentGroupsWorkflowStarted
    },
    enableTokensEditorOptionItemValue () {
      return this.$store.state.optionsUpdated && SettingsController.enableTokensEditor
    },
    tokensEditAvailable () {
      return this.enableTokensEditorOptionItemValue
    },
    enableAnnotatiosValue () {
      if (!SettingsController.enableAnnotatios) { this.annotationMode = false }
      return this.$store.state.optionsUpdated && SettingsController.enableAnnotatios
    }
  },
  methods: {
    updateAnnotation (token) {
      this.annotationToken = token
      this.$modal.show('annotations')
    },
    closeAnnotationModal () {
      this.annotationToken = null
      this.$modal.hide('annotations')
    }
  }
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