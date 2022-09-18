<template>
  <div class="alpheios-alignment-text-editor-block__enter alpheios-alignment-text-editor-block alpheios-alignment-editor-container">
      <h2 class="alpheios-alignment-text-editor-block__header">
        <span class="alpheios-alignment-text-editor-block__part">
          <span class="alpheios-alignment-text-editor-block__header-label">{{ l10n.getMsgS('TEXT_EDITOR_HEADING') }}</span>
          <span class="alpheios-alignment-text-editor-block__header-link" v-if="alignEditAvailable" @click="$emit('showAlignmentGroupsEditor')">{{ l10n.getMsgS('ALIGN_EDITOR_LINK') }}</span>
          <span class="alpheios-alignment-text-editor-block__header-link" v-if="tokensEditAvailable" @click="$emit('showTokensEditor')">{{ l10n.getMsgS('TOKENS_EDITOR_LINK') }}</span>
        </span>

      <span class="alpheios-alignment-text-editor-block-buttons__part">
        <tooltip :tooltipText = "l10n.getMsgS('TEXT_EDITOR_HEADER_HELP')" tooltipDirection = "top">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-button-with-icon" 
                  id="alpheios-actions-menu-button__enter-help" @click="$modal.show('help-enter')"
              >
              <span class="alpheios-alignment-button-icon">
                <question-icon />
              </span>
          </button>
        </tooltip>
        <tooltip :tooltipText = "l10n.getMsgS('TEXT_EDITOR_HEADER_OPTIONS')" tooltipDirection = "top">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button alpheios-actions-menu-button-with-icon" id="alpheios-actions-menu-button__enter-options"
              @click="$modal.show('options-enter')"
              >
              <span class="alpheios-alignment-button-icon">
                <gear-icon />
              </span>
          </button>
        </tooltip>
      </span>

      <span class="alpheios-alignment-text-editor-block__part alpheios-alignment-text-editor-block__part-right">
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__enter-save"
            :disabled="!downloadAvailable" @click="$modal.show('save')">
            {{ l10n.getMsgS('TEXT_EDITOR_HEADER_SAVE') }}
        </button>
      </span>

    </h2>

    <div class="alpheios-alignment-editor-text-blocks-container" id="alpheios-text-editor-blocks-container" >
      <div class="alpheios-alignment-editor-text-blocks-container-inner">

        <div class="alpheios-alignment-editor-text-blocks-single-container alpheios-alignment-editor-text-blocks-origin-container">

        </div>

        <div class="alpheios-alignment-editor-text-blocks-single-container alpheios-alignment-editor-text-blocks-target-container" 
             v-if="allTargetTextsIdsNumbered">

        </div>

      </div>
    </div>

    <div class="alpheios-alignment-editor-text-blocks-container" id="alpheios-text-editor-blocks-container" >
      <div class="alpheios-alignment-editor-text-blocks-container-inner">

        <div class="alpheios-alignment-editor-text-blocks-single-container alpheios-alignment-editor-text-blocks-origin-container">
          <text-editor-single-block 
              text-type="origin" 
              :text-id = "originId"
          />
        </div>

        <div class="alpheios-alignment-editor-text-blocks-single-container alpheios-alignment-editor-text-blocks-target-container" 
              v-if="allTargetTextsIdsNumbered">
          <text-editor-single-block 
              v-for="(targetTextId, indexT) in allTargetTextsIdsNumbered" :key="targetTextId ? targetTextId.targetId : indexT"
              text-type = "target" 
              :text-id = "targetTextId && targetTextId.targetId"
              :index = "targetTextId && targetTextId.targetIndex"
              @add-translation="$emit('add-translation')"
              @align-text = "$emit('align-text')"
          />
        </div>

      </div>
    </div>

    <help-popup modalName = "help-enter">
      <template v-slot:content > <help-block-enter /> </template>
    </help-popup>
  
    <options-text-enter />
  </div>
</template>
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import QuestionIcon from '@/inline-icons/question.svg'
import GearIcon from '@/inline-icons/gear.svg'

import Tooltip from '@/vue/common/tooltip.vue'
import SettingsController from '@/lib/controllers/settings-controller.js'
import HelpPopup from '@/vue/modal-slots/help-popup.vue'

import HelpBlockEnter from '@/vue/help-blocks/eng/help-block-enter.vue'
import OptionsTextEnter from '@/vue/options/options-text-enter.vue'

import TextEditorSingleBlock from '@/vue/text-editor/text-editor-single-block.vue'

import { computed, inject, reactive } from 'vue'
import { useStore } from 'vuex'

const emit = defineEmits([ 'showAlignmentGroupsEditor', 'showTokensEditor', 'add-translation', 'align-text', 'toggle-save' ])

const l10n = computed(() => { return L10nSingleton })
const $store = useStore()

const $modal = inject('$modal')

const $textC = inject('$textC')
const $alignedGC = inject('$alignedGC')

const state = reactive({ 
  saveEnterState: 0
})

const originId = computed(() => {
  return $store.state.docSourceUpdated && $textC.originDocSource ? $textC.originDocSource.id : null
})

const enableTokensEditorOptionItemValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.enableTokensEditor
})

const alignEditAvailable = computed(() => {
  return $store.state.docSourceUpdated && $store.state.alignmentUpdated && $alignedGC.alignmentGroupsWorkflowStarted
})

const tokensEditAvailable = computed(() => {
  return alignEditAvailable.value && enableTokensEditorOptionItemValue.value
})

const downloadAvailable = computed(() => {
  return Boolean($store.state.docSourceUpdated) && $textC.originDocSourceHasText
})

const allTargetTextsIdsNumbered = computed(() => {
  return $store.state.docSourceUpdated && $store.state.uploadCheck && $textC.allTargetTextsIdsNumbered.length > 0 ? 
         $textC.allTargetTextsIdsNumbered : [ null ]
})
</script>
<style lang="scss">
  .alpheios-alignment-text-editor-block__header {
    font-size: 20px;
    display: flex;
    justify-content: space-between;

    .alpheios-alignment-text-editor-block__part{
      button {
        text-transform: uppercase;
      }
    }

    .alpheios-alignment-text-editor-block__part-right {
      text-align: right;
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
    
    button.alpheios-actions-menu-button.alpheios-actions-menu-button-with-icon {
      padding: 5px;
      margin: 0 5px;
      .alpheios-alignment-button-icon {
          display: inline-block;
          width: 20px;
          height: 20px;

          svg {
            width: 100%;
            height: 100%;
            display: block;
            fill: #fff;
          }
      }
    }
</style>
