<template>
  <div class="alpheios-alignment-align-editor-block alpheios-alignment-editor-container  alpheios-tools-enabled">
      <h2 class="alpheios-alignment-text-editor-block__header">
        <span class="alpheios-alignment-text-editor-block__part alpheios-alignment-text-editor-block__part-1">
          <span class="alpheios-alignment-text-editor-block__header-link" @click="$emit('showSourceTextEditor')">{{ l10n.getMsgS('TEXT_EDITOR_LINK') }}</span>
          <span class="alpheios-alignment-text-editor-block__header-label">{{ l10n.getMsgS('ALIGN_EDITOR_HEADING') }}</span>
          <span class="alpheios-alignment-text-editor-block__header-link" @click="$emit('showTokensEditor')">{{ l10n.getMsgS('TOKENS_EDITOR_LINK') }}</span>
          <div class="alpheios-alignment-checkbox-block alpheios-alignment-annotation-mode-check-container">
            <input type="checkbox" v-model="annotationMode" id="alpheios-alignment-annotation-mode-check">
            <label for="alpheios-alignment-annotation-mode-check" >
              {{ l10n.getMsgS("ALIGN_EDITOR_ANNOTATION_MODE") }}
            </label>
          </div>
        </span>
        <span class="alpheios-alignment-text-editor-block__part alpheios-alignment-text-editor-block__part-2">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__enter-help"
              @click="showModalHelp = true">
              {{ l10n.getMsgS("ALIGN_EDITOR_HELP") }}
          </button>
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__enter-options"
              @click="showModalOptions = true">
              {{ l10n.getMsgS("ALIGN_EDITOR_OPTIONS") }}
          </button>
        </span>
        <span class="alpheios-alignment-text-editor-block__part alpheios-alignment-text-editor-block__part-3">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__enter-save"
              @click="showModalSave = true">
              {{ l10n.getMsgS("ALIGN_EDITOR_SAVE") }}
          </button>
        </span>
      </h2>

      <help-popup :showModal="showModalHelp" @closeModal = "showModalHelp = false">
        <template v-slot:content > <help-block-align /> </template>
      </help-popup>

    <align-editor-view-mode v-if="renderAlignEditor" @update-annotation = "updateAnnotation" :annotationMode="annotationMode"/>   
    <save-popup :showModal="showModalSave" @closeModal = "showModalSave = false" />
    <options-text-align-popup :showModal="showModalOptions" @closeModal = "showModalOptions = false" />
    <annotation-block-popup :showModal="showModalAnnotations" @closeModal = "closeAnnotationModal" 
                            :token = "annotationToken" v-if="annotationToken" 
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

import HelpBlockAlign from '@/vue/help-blocks/eng/help-block-align.vue'

export default {
  name: 'AlignEditor',
  components: {
    alignEditorViewMode: AlignEditorViewMode,
    helpPopup: HelpPopup,
    savePopup: SavePopup,
    helpBlockAlign: HelpBlockAlign,
    optionsTextAlignPopup: OptionsTextAlign,
    annotationBlockPopup: AnnotationBlockPopup
  },
  props: {
  },
  data () {
    return {
      showModalHelp: false,
      showModalOptions: false,
      showModalSave: false,
      showModalAnnotations: false,
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
      return this.$store.state.alignmentUpdated && this.$store.state.uploadCheck &&this.$alignedGC.alignmentGroupsWorkflowStarted
    }
  },
  methods: {
    updateAnnotation (token) {
      this.annotationToken = token
      this.showModalAnnotations = true
    },
    closeAnnotationModal () {
      this.annotationToken = null
      this.showModalAnnotations = false
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

    label {
      display: block;
      padding-top: 0;
      width: auto;
      line-height: initial;
      text-align: left;
      font-weight: normal;
      font-size: 80%;
      padding-left: 25px;
      line-height: 22px;
      cursor: pointer;
    }
  }

</style>