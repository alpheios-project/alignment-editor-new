<template>
    <modal v-if="showModal" @close="$emit('closeModal')">
        <template v-slot:header>
            <p class="alpheios-editor-summary-header" v-html="l10n.getMsgS('SUMMARY_POPUP_HEADER')"></p>
        </template>

        <template v-slot:body v-if="contentAvailable">
          <waiting v-show="showWaiting"/>
          <div class="alpheios-editor-summary-content" v-show="!showWaiting">
            <table class="alpheios-editor-langs-table">
              <tr>
                <th colspan="2">{{ l10n.getMsgS('SUMMARY_POPUP_TABEL_TH_ORIGINAL') }}</th>
                <th colspan="2">{{ l10n.getMsgS('SUMMARY_POPUP_TABEL_TH_TRANSLATION') }}</th>
              </tr>
              <tr v-for="(langData, langIndex) in targetsLangData" :key="langIndex">
                <td colspan="2" v-if="langIndex > 0"></td>
                <td v-if="langIndex === 0">
                  {{ originalLangData.textPart }}
                </td>
                <td v-if="langIndex === 0" class="alpheios-editor-langs-table_lang">
                  {{ originalLangData.langName }}
                </td>

                <td>
                  {{ langData.textPart }}
                </td>
                <td class="alpheios-editor-langs-table_lang">
                  {{ langData.langName }}
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
          <div class="alpheios-editor-summary-footer">
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

export default {
  name: 'SummaryPopup',
  components: {
    modal: Modal,
    waiting: Waiting,
    optionItemBlock: OptionItemBlock
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
      return this.$store.state.alignmentUpdated && this.$textC.originalLangData
    },
    targetsLangData () {
      return this.$store.state.alignmentUpdated && this.$textC.targetsLangData
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
</style>