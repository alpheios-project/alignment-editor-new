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
              @click="$modal.show('save-edit')">
              {{ l10n.getMsgS('TEXT_EDITOR_HEADER_SAVE') }}
          </button>
        </span>
      </h2>

    <tokens-editor-inner-block v-if="renderTokensEditor" @insertTokens="startInsertTokens" :removeAllActivatedFlag = "removeAllActivatedFlag"/>
    <help-popup @closeModal = "$modal.hide('help-edit')" mname = "help-edit">
      <template v-slot:content > <help-block-edit /> </template>
    </help-popup>
    <save-popup @closeModal = "$modal.hide('save-edit')" mname = "save-edit"/>
    <options-text-edit-popup @closeModal = "$modal.hide('options-edit')" />
    <insert-tokens-popup @closeModal = "closeInsertTokens"  :token = "edittedToken"  />
  </div>
</template>
<script>
import Vue from '@vue-runtime'

import TokensEditInnerBlock from '@/vue/tokens-editor/tokens-editor-inner-block.vue'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import HelpPopup from '@/vue/common/help-popup.vue'
import SavePopup from '@/vue/common/save-popup.vue'
import HelpBlockEdit from '@/vue/help-blocks/eng/help-block-edit.vue'
import OptionsTextEdit from '@/vue/options/options-text-edit.vue'
import Tooltip from '@/vue/common/tooltip.vue'
import InsertTokensBlock from '@/vue/tokens-editor/insert-tokens-block.vue'

import QuestionIcon from '@/inline-icons/question.svg'
import GearIcon from '@/inline-icons/gear.svg'

export default {
  name: 'TokensEditor',
  components: {
    TokensEditorInnerBlock: TokensEditInnerBlock,
    helpPopup: HelpPopup,
    savePopup: SavePopup,
    helpBlockEdit: HelpBlockEdit,
    optionsTextEditPopup: OptionsTextEdit,
    insertTokensPopup: InsertTokensBlock,

    tooltip: Tooltip,
    questionIcon: QuestionIcon,
    gearIcon: GearIcon
  },
  props: {
    renderEditor: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      renderTokensEditor: false,
      showModalOptions: false,
      edittedToken: null,
      removeAllActivatedFlag: 1
    }
  },
  watch: {
    '$store.state.alignmentRestarted' () {
      this.renderTokensEditor = false
    },
    'renderEditor' () {
      if (this.alignmentStared) { this.renderTokensEditor = true }
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    alignmentStared ()  {
      return this.$store.state.alignmentUpdated && this.$alignedGC.alignmentGroupsWorkflowStarted
    }
  },
  methods: {
    startInsertTokens (token) {
      this.edittedToken = token
      this.$modal.show('insert-tokens')
    },
    closeInsertTokens () {
      this.edittedToken = null
      this.$modal.hide('insert-tokens')
    },
    goToTextEnterScreen () {
      this.removeAllActivatedFlag = this.removeAllActivatedFlag + 1
      this.$emit('showSourceTextEditor')
    },
    goToAlignTextScreen () {
      this.removeAllActivatedFlag = this.removeAllActivatedFlag + 1
      this.$emit('showAlignmentGroupsEditor')
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-tokens-editor-block.alpheios-alignment-editor-container {
    padding: 20px 30px 20px 40px;  
  }

</style>