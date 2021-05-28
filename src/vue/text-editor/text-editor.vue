<template>
  <div class="alpheios-alignment-text-editor-block alpheios-alignment-editor-container">
      <h2 class="alpheios-alignment-text-editor-block__header">
        <span class="alpheios-alignment-text-editor-block__part">
          <span class="alpheios-alignment-text-editor-block__header-label">{{ l10n.getMsgS('TEXT_EDITOR_HEADING') }}</span>
          <span class="alpheios-alignment-text-editor-block__header-link" v-if="alignEditAvailable" @click="$emit('showAlignmentGroupsEditor')">{{ l10n.getMsgS('ALIGN_EDITOR_LINK') }}</span>
          <span class="alpheios-alignment-text-editor-block__header-link" v-if="alignEditAvailable" @click="$emit('showTokensEditor')">{{ l10n.getMsgS('TOKENS_EDITOR_LINK') }}</span>
        </span>
        <span class="alpheios-alignment-text-editor-block__part">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__enter-help"
              @click="showModalHelp = true">
              {{ l10n.getMsgS('TEXT_EDITOR_HEADER_HELP') }}
          </button>
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__enter-options"
              @click="showModalOptions = true">
              {{ l10n.getMsgS('TEXT_EDITOR_HEADER_OPTIONS') }}
          </button>
        </span>
        <span class="alpheios-alignment-text-editor-block__part">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__enter-save"
              @click="showModalSave = true" :disabled="!downloadAvailable">
              {{ l10n.getMsgS('TEXT_EDITOR_HEADER_SAVE') }}
          </button>
        </span>
      </h2>

      <div class="alpheios-alignment-editor-text-blocks-container" id="alpheios-text-editor-blocks-container" >
        <div class="alpheios-alignment-editor-text-blocks-container-inner">

          <div class="alpheios-alignment-editor-text-blocks-single-container alpheios-alignment-editor-text-blocks-origin-container">
            <text-editor-single-block 
                text-type="origin" 
                :text-id = "originId"
                @align-text = "$emit('align-text')"
            />
          </div>

          <div class="alpheios-alignment-editor-text-blocks-single-container alpheios-alignment-editor-text-blocks-target-container" v-if="allTargetTextsIdsNumbered">
            <text-editor-single-block 
                v-for="(targetTextId, indexT) in allTargetTextsIdsNumbered" :key="targetTextId ? targetTextId.targetId : indexT"
                text-type = "target" 
                :text-id = "targetTextId && targetTextId.targetId"
                :index = "targetTextId && targetTextId.targetIndex"
                @add-translation="$emit('add-translation')"
            />
          </div>

        </div>
      </div>

      <help-popup :showModal="showModalHelp" @closeModal = "showModalHelp = false">
        <template v-slot:content > <help-block-enter /> </template>
      </help-popup>
      <save-popup :showModal="showModalSave" @closeModal = "showModalSave = false" />
      <options-text-enter-popup :showModal="showModalOptions" @closeModal = "showModalOptions = false" />
  </div>
</template>
<script>
import TextEditorSingleBlock from '@/vue/text-editor/text-editor-single-block.vue'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import Tooltip from '@/vue/common/tooltip.vue'
import HelpPopup from '@/vue/common/help-popup.vue'
import SavePopup from '@/vue/common/save-popup.vue'

import OptionsTextEnter from '@/vue/options/options-text-enter.vue'

import HelpBlockEnter from '@/vue/help-blocks/eng/help-block-enter.vue'

export default {
  name: 'TextEditor',
  components: {
    textEditorSingleBlock: TextEditorSingleBlock,
    tooltip: Tooltip,
    helpPopup: HelpPopup,
    savePopup: SavePopup,
    helpBlockEnter: HelpBlockEnter,
    optionsTextEnterPopup: OptionsTextEnter
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
  /**
   * I placed an empty alignment here for now, because it is the first point where it should be existed.
   * Later when we define workflow for creation alignment depending on user authentication,
   * it could be moved out here
   */
  created () {

  },

  computed: {
    originId () {
      return this.$store.state.docSourceUpdated && this.$textC.originDocSource ? this.$textC.originDocSource.id : null
    },
    allTargetTextsIdsNumbered () {
      return this.$store.state.docSourceUpdated && this.$store.state.uploadCheck && this.$textC.allTargetTextsIdsNumbered.length > 0 ? this.$textC.allTargetTextsIdsNumbered : [ null ]
    },
    /**
     * Defines label show/hide texts block depending on showTextsBlocks
     */
    l10n () {
      return L10nSingleton
    },
    alignEditAvailable () {
      return this.$store.state.docSourceUpdated && this.$store.state.alignmentUpdated && this.$alignedGC.alignmentGroupsWorkflowStarted
    },
    downloadAvailable () {
      return Boolean(this.$store.state.docSourceUpdated) && this.$textC.originDocSourceHasText
    }
  },
  methods: {
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-text-editor-block__header {
    font-size: 20px;
    display: flex;
    justify-content: space-between;

    .alpheios-alignment-text-editor-block__part {
      button {
        text-transform: uppercase;
      }
    }

    .alpheios-alignment-text-editor-block__header-label {
      display: inline-block;
      padding-right: 15px;

      text-transform: uppercase;
    }

    .alpheios-alignment-text-editor-block__header-link {
      display: inline-block;
      padding-right: 15px;

      color: #185F6D;
      cursor: pointer;
      text-decoration: underline;
      text-transform: uppercase;
    }
  }

  .alpheios-alignment-text-editor-block.alpheios-alignment-editor-container {
    padding: 20px 30px 20px 40px;  
  }
    .alpheios-alignment-editor-text-blocks-container-inner {
      &:before,
      &:after {
        content: '';
        display: block;
        clear: both;
      }
    }

    .alpheios-alignment-editor-text-blocks-container {
        .alpheios-alignment-editor-text-blocks-single-container {
          width: 50%;
          float: left;
        }
    }

    .alpheios-alignment-editor-text-blocks-origin-container {
      padding-right: 10px;
    }

    .alpheios-alignment-editor-text-blocks-target-container {
      padding-left: 10px;
    }

    .alpheios-alignment-editor-container-footer {
      text-align: center;
      border-top: 2px solid #757575;
      padding-top: 15px;
    }

    .alpheios-alignment-editor-header__show-label {
      cursor: pointer;
      font-size: 90%;
      text-decoration: underline;
      color: #185F6D;
    }
</style>