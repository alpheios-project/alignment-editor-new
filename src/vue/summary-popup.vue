<template>
    <modal v-if="showModal" @close="$emit('closeModal')">
        <template v-slot:header>
            <p class="alpheios-editor-summary-header" v-html="l10n.getMsgS('SUMMARY_POPUP_HEADER')"></p>
        </template>

        <template v-slot:body v-if="contentAvailable">
          <waiting v-show="showWaiting"/>
          <table class="alpheios-editor-langs-table" v-show="!showWaiting">
            <tr>
              <th colspan="2">Original</th>
              <th colspan="2">Translation</th>
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
        </template>

        <template v-slot:footer>
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click = "startAlign">All OK</button>
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click="$emit('closeModal')">Cancel</button>
        </template>
    </modal>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import Modal from '@/vue/common/modal.vue'
import Waiting from '@/vue/common/waiting.vue'

export default {
  name: 'SummaryPopup',
  components: {
    modal: Modal,
    waiting: Waiting
  },
  props: {
    showModal: {
    type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      contentAvailable: true,
      showWaiting: false
    }
  },
  watch: {
    showModal () {
      if (!this.showModal) {
        this.showWaiting = false
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
</style>