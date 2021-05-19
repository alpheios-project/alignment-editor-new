<template>
    <modal v-if="showModal" @close="$emit('closeModal')">
        <template v-slot:header>
            <p class="alpheios-editor-summary-header" v-html="l10n.getMsgS('SUMMARY_POPUP_HEADER')" v-show="!showWaiting"></p>
        </template>

        <template v-slot:body v-if="contentAvailable">
          <waiting v-show="showWaiting"/>
          <div class="alpheios-editor-summary-content" v-show="!showWaiting">
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
                <td v-if="langIndex === 0" class="alpheios-editor-langs-table_teicheck" :class="{'alpheios-editor-langs-table-tokenized': originalLangData.tokenized }">
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
                <td class="alpheios-editor-langs-table_teicheck" :class="{'alpheios-editor-langs-table-tokenized': targetData.tokenized }">
                  <span class="alpheios-alignment-editor-text-blocks-single__icons" v-show="targetData.isTei">
                    <check-icon />
                  </span>
                </td>
              </tr>
            </table>

            <div class="alpheios-editor-summary-show-option">
              <span class="alpheios-editor-summary-show-option-item">
                <option-item-block :optionItem = "showSummaryPopupOpt" :showLabelText = "showLabelTextOpt" />
              </span>
              <span class="alpheios-editor-summary-show-option-label">{{ l10n.getMsgS('SUMMARY_POPUP_SHOW_OPTION_LABEL') }}</span>
            </div>
          </div>
        </template>

        <template v-slot:footer>
          <div class="alpheios-editor-summary-footer" v-show="!showWaiting">
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click = "startAlign" :disabled = "showWaiting">{{ l10n.getMsgS('SUMMARY_POPUP_OK_BUTTON') }}</button>
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click="$emit('closeModal')" :disabled = "showWaiting">{{ l10n.getMsgS('SUMMARY_POPUP_CANCEL_BUTTON') }}</button>
          </div>
        </template>
    </modal>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import Modal from '@/vue/common/modal.vue'
import Waiting from '@/vue/common/waiting.vue'
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import CheckIcon from '@/inline-icons/check.svg'

export default {
  name: 'SummaryPopup',
  components: {
    modal: Modal,
    waiting: Waiting,
    optionItemBlock: OptionItemBlock,
    checkIcon: CheckIcon
  },
  props: {
    showModal: {
      type: Boolean,
      required: false,
      default: false
    },
    showOnlyWaiting: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      contentAvailable: true,
      showWaiting: false,
      showLabelTextOpt: false
    }
  },
  watch: {
    showModal () {
      if (!this.showModal) {
        this.showWaiting = false
      } else if (this.showOnlyWaiting) {
        this.startAlign()
      }
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    originalLangData () {
      return this.$store.state.docSourceUpdated && this.$store.state.optionsUpdated && this.$textC.originalLangData
    },
    targetsLangData () {
      return this.$store.state.docSourceUpdated && this.$store.state.optionsUpdated && this.$textC.targetsLangData
    },
    showSummaryPopupOpt () {
      return this.$store.state.optionsUpdated && this.$settingsC.options.app.items.showSummaryPopup
    }
  },
  methods: {
    startAlign () {
      this.showWaiting = true
      this.$emit('start-align')
    }
  }
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
    width: 30px;
    display: inline-block;
    vertical-align: middle;

    .alpheios-alignment-option-item {
      margin-bottom: 0;
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
</style>