<template>
  <modal-base modalName="summary" :toggleState="state.summaryState" height="auto">
    <div class="alpheios-alignment-editor-modal-summary">
        <div class="alpheios-modal-header" >
            <span class="alpheios-alignment-modal-close-icon" @click = "closeModal">
                <x-close-icon />
            </span>
            <p class="alpheios-editor-summary-header" v-html="l10n.getMsgS('SUMMARY_POPUP_HEADER')"></p>
        </div>

        <div class="alpheios-modal-body" v-if="contentAvailable">
          <div class="alpheios-editor-summary-content" >
            <table class="alpheios-editor-langs-table">
              <tr>
                <th colspan="2">{{ l10n.getMsgS('SUMMARY_POPUP_TABEL_TH_ORIGINAL') }}</th>
                <th>{{ l10n.getMsgS('SUMMARY_POPUP_TABEL_TH_ISTEI') }}</th>
                <th colspan="2">{{ l10n.getMsgS('SUMMARY_POPUP_TABEL_TH_TRANSLATION') }}</th>
                <th>{{ l10n.getMsgS('SUMMARY_POPUP_TABEL_TH_ISTEI') }}</th>
              </tr>
              <tr v-for="(targetData, langIndex) in targetsLangData" :key="langIndex">
                <td colspan="3" v-if="langIndex > 0"></td>
                <td v-if="langIndex === 0" :class="{'alpheios-editor-langs-table-tokenized': originalLangData.tokenized }">
                  {{ originalLangData.langData.textPart }}
                </td>
                <td v-if="langIndex === 0" class="alpheios-editor-langs-table_lang" :class="{'alpheios-editor-langs-table-tokenized': originalLangData.tokenized }">
                  {{ originalLangData.langData.langName }}
                </td>
                <td v-if="langIndex === 0" class="alpheios-editor-langs-table_teicheck" 
                    :class="{'alpheios-editor-langs-table-tokenized': originalLangData.tokenized }">
                  <span class="alpheios-alignment-editor-text-blocks-single__icons" v-show="originalLangData.isTei">
                    <check-icon />
                  </span>
                </td>

                <td :class="{'alpheios-editor-langs-table-tokenized': targetData.tokenized }">
                  {{ targetData.langData.textPart }}
                </td>
                <td class="alpheios-editor-langs-table_lang" :class="{'alpheios-editor-langs-table-tokenized': targetData.tokenized }">
                  {{ targetData.langData.langName }}
                </td>
                <td class="alpheios-editor-langs-table_teicheck" 
                    :class="{'alpheios-editor-langs-table-tokenized': targetData.tokenized }">
                  <span class="alpheios-alignment-editor-text-blocks-single__icons" v-show="targetData.isTei">
                    <check-icon />
                  </span>
                </td>
              </tr>
            </table>

            <div class="alpheios-editor-summary-show-option">
              <span class="alpheios-editor-summary-show-option-item">
                <option-item-block :optionItem = "showSummaryPopupOpt" :showLabelText = "state.showLabelTextOpt" 
                     :showCheckboxTitle = "state.showLabelTextOpt"/>
              </span>
              <span class="alpheios-editor-summary-show-option-label">
                {{ l10n.getMsgS('SUMMARY_POPUP_SHOW_OPTION_LABEL') }}</span>
            </div>
          </div>
        </div>

        <div class="alpheios-modal-footer" >
          <div class="alpheios-editor-summary-footer" >
            <button class="alpheios-editor-button-tertiary alpheios-modal-button" @click = "startAlign" >
                  {{ l10n.getMsgS('SUMMARY_POPUP_OK_BUTTON') }}</button>
            <button class="alpheios-editor-button-tertiary alpheios-modal-button" @click="closeModal" >
                  {{ l10n.getMsgS('SUMMARY_POPUP_CANCEL_BUTTON') }}</button>
          </div>
        </div>
    </div>
  </modal-base>
</template>
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import XCloseIcon from '@/inline-icons/xclose.svg'
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import CheckIcon from '@/inline-icons/check.svg'

import SettingsController from '@/lib/controllers/settings-controller.js'

import { computed, inject, reactive, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'

const emit = defineEmits([ 'start-align' ])

const l10n = computed(() => { return L10nSingleton })
const $store = useStore()

const $modal = inject('$modal')

const $textC = inject('$textC')

const state = reactive({
  showLabelTextOpt: false
})

const closeModal = () => {
  $modal.hide('summary')
}

const originalLangData = computed(() => {
  return $store.state.docSourceUpdated && $store.state.optionsUpdated && $textC.originalLangData
})

const targetsLangData = computed(() => {
  return $store.state.docSourceUpdated && $store.state.optionsUpdated && $textC.targetsLangData
})

const showSummaryPopupOpt = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allOptions.app.items.showSummaryPopup
})

const contentAvailable = computed(() => {
  return $store.state.docSourceUpdated && originalLangData.value && targetsLangData.value
})

const startAlign = () => {
  emit('start-align')
  closeModal()
}

</script>

<style lang="scss">
  .alpheios-editor-summary-header {
    font-weight: bold;
  }

  .alpheios-editor-langs-table {
    border-collapse: collapse;
    width: 100%;

    th, td {
      border: 1px solid #ddd;
      padding: 8px;
    }

    tr:nth-child(even) {
      background-color: #f2f2f2;
    }

    th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #90a959;
      color: white;
    }

    .alpheios-editor-langs-table_lang {
      font-weight: bold;
    }
  }

  .alpheios-editor-summary-footer {
    text-align: center;
  }

  .alpheios-editor-summary-show-option {
    padding-top: 10px;
  }

  .alpheios-editor-summary-show-option-item {
    // width: 30px;
    display: inline-block;
    vertical-align: middle;

    .alpheios-alignment-option-item {
      margin-bottom: 0;
      padding-right: 5px;
      .alpheios-alignment-checkbox-block {
        width: 30px;
      }
    }
  }
  .alpheios-editor-summary-show-option-label {
    display: inline-block;
    vertical-align: middle;
  }

  .alpheios-editor-langs-table-tokenized {
    color: #b0b0b0;

    svg {
      fill: #b0b0b0;
    }
  }

  .alpheios-editor-langs-table_teicheck {
    span.alpheios-alignment-editor-text-blocks-single__icons svg {
      display: inline-block;
      width: 15px;
      height: 15px;
      fill: #000;
    }
  }

  .alpheios-alignment-editor-modal-summary {
    .alpheios-modal-body {
      border: 0;
      padding: 10px 0;
    }
  }
</style>
