<template>
  <modal v-if="showModal" @close="$emit('closeModal')" class="alpheios-alignment-editor-modal-options">
    <template v-slot:header >
        <h2 class="alpheios-alignment-editor-modal-header">{{ l10n.getMsgS('OPTIONS_TITLE_TEXT_ALIGN') }}</h2>
    </template>
    <template v-slot:body >
        <div class="alpheios-alignment-editor-modal-options-block">
        </div>
    </template>
    <template v-slot:footer>
      <p class="alpheios-alignment-options__buttons">
        <button class="alpheios-editor-button-tertiary alpheios-options-button alpheios-options-reset-all" 
            @click="resetOptions" >
            {{ l10n.getMsgS('OPTIONS_BLOCK_RESET_ALL') }}
        </button>
      </p>
      <div class="alpheios-alignment-options__aboutcont">
        <h3>{{ l10n.getMsgS('OPTIONS_BLOCK_INFO_ABOUT') }}</h3>
        <div class="alpheios-alignment-options__versiontext">
          {{ versionData }}
        </div>
      </div>
    </template>
  </modal>
</template>
<script>
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import Modal from '@/vue/common/modal.vue'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'OptionsTextAlign',
  components: {
    optionItemBlock: OptionItemBlock,
    modal: Modal
  },
  props: {
    showModal: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    versionData () {
      return `${this.$store.state.libName} ${this.$store.state.libVersion} (${this.$store.state.libBuildNameForDisplay})`
    }
  },
  methods: {
    async resetOptions () {
      await this.$settingsC.resetAllOptions()
    }
  }
}
</script>
<style lang="scss">
.alpheios-alignment-editor-modal-options {
  .alpheios-modal-container {
    width: 700px;
  }
  .alpheios-modal-body {
    // max-height: 700px;
    // border: 0;
    margin: 0 0 20px;
  }

  .alpheios-alignment-editor-modal-options-block {
      padding: 10px;
  }
  .alpheios-alignment-editor-modal-header {
    margin-bottom: 10px;
  }
}
</style>