<template>
  <modal classes="alpheios-alignment-editor-modal-options alpheios-alignment-editor-modal-options-edit" 
         name="options-edit" :draggable="true" height="auto">
    <div class="alpheios-modal-header" >
        <span class="alpheios-alignment-modal-close-icon" @click="$emit('closeModal')">
            <x-close-icon />
        </span>
        <h2 class="alpheios-alignment-editor-modal-header">{{ l10n.getMsgS('OPTIONS_TITLE_TEXT_EDIT') }}</h2>
    </div>
    <div class="alpheios-modal-body" >
      <div class="alpheios-alignment-editor-modal-options-block">
        <select-edit-icons  :showLabelTextAsCheckboxLabel = "false" :hiddenBorder = "true" screenType="edit" /> 
      </div>
    </div>
    <div class="alpheios-modal-footer" >
      <div class="alpheios-alignment-options__aboutcont">
        <h3>{{ l10n.getMsgS('OPTIONS_BLOCK_INFO_ABOUT') }}</h3>
        <div class="alpheios-alignment-options__versiontext">
          {{ versionData }}
        </div>
      </div>
    </div>
  </modal>
</template>
<script>
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import XCloseIcon from '@/inline-icons/x-close.svg'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import SelectEditIcons from '@/vue/options/select-edit-icons.vue'

import SettingsController from '@/lib/controllers/settings-controller'

export default {
  name: 'OptionsTextEdit',
  components: {
    optionItemBlock: OptionItemBlock,
    xCloseIcon: XCloseIcon,
    selectEditIcons: SelectEditIcons
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
      await SettingsController.resetAllOptions()
    }
  }
}
</script>
<style lang="scss">
.alpheios-alignment-editor-modal-options.alpheios-alignment-editor-modal-options-edit {
  .alpheios-modal-container {
    width: 700px;
  }
  .alpheios-modal-body {
    // max-height: 700px;
    // border: 0;
    margin: 0 0 20px;
    padding-top: 20px;
  }

  .alpheios-alignment-editor-modal-options-block {
      padding: 10px;
  }
  .alpheios-alignment-editor-modal-header {
    margin-bottom: 10px;
  }
}
</style>