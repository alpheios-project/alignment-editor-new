<template>
  <div class="alpheios-alignment-align-editor-block alpheios-alignment-editor-container  alpheios-tools-enabled">
      <h2 class="alpheios-alignment-text-editor-block__header">
        <span class="alpheios-alignment-text-editor-block__part">
          <span class="alpheios-alignment-text-editor-block__header-link" @click="$emit('showSourceTextEditor')">{{ l10n.getMsgS('TEXT_EDITOR_LINK') }}</span>
          <span class="alpheios-alignment-text-editor-block__header-label">{{ l10n.getMsgS('ALIGN_EDITOR_HEADING') }}</span>
          <span class="alpheios-alignment-text-editor-block__header-link" @click="$emit('showTokensEditor')">{{ l10n.getMsgS('TOKENS_EDITOR_LINK') }}</span>
        </span>
        <span class="alpheios-alignment-text-editor-block__part">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__enter-help"
              @click="showModalHelp = true">
              HELP
          </button>
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__enter-options"
              @click="showModalOptions = true">
              Options
          </button>
        </span>
        <span class="alpheios-alignment-text-editor-block__part">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__enter-save"
              @click="showModalSave = true">
              Save locally
          </button>
        </span>
      </h2>

      <help-popup :showModal="showModalHelp" @closeModal = "showModalHelp = false">
        <template v-slot:content > <help-block-align /> </template>
      </help-popup>

    <align-editor-view-mode v-if="renderAlignEditor"/>   
    <save-popup :showModal="showModalSave" @closeModal = "showModalSave = false" />
    <options-text-align-popup :showModal="showModalOptions" @closeModal = "showModalOptions = false" />
  </div>
</template>
<script>
import Vue from '@vue-runtime'

import AlignEditorViewMode from '@/vue/align-editor/align-editor-view-mode.vue'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import HelpPopup from '@/vue/common/help-popup.vue'
import SavePopup from '@/vue/common/save-popup.vue'
import OptionsTextAlign from '@/vue/options/options-text-align.vue'

import HelpBlockAlign from '@/vue/help-blocks/eng/help-block-align.vue'

export default {
  name: 'AlignEditor',
  components: {
    alignEditorViewMode: AlignEditorViewMode,
    helpPopup: HelpPopup,
    savePopup: SavePopup,
    helpBlockAlign: HelpBlockAlign,
    optionsTextAlignPopup: OptionsTextAlign
  },
  props: {
  },
  data () {
    return {
      showModalHelp: false,
      showModalOptions: false,
      showModalSave: false
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
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-align-editor-block.alpheios-alignment-editor-container {
    padding: 20px 30px 20px 40px;  
  }

</style>