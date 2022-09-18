<template>
  <modal-base modalName="options-edit" :draggable="true" height="auto" :shiftY="0.3" > 
    <div class="alpheios-alignment-editor-modal-options alpheios-alignment-editor-modal-options-edit" data-alpheios-ignore="all">
      <div class="alpheios-modal-header" >
          <span class="alpheios-alignment-modal-close-icon" @click="closeModal">
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
    </div>
  </modal-base>
</template>
<script setup>
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import XCloseIcon from '@/inline-icons/xclose.svg'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import SelectEditIcons from '@/vue/options/select-edit-icons.vue'

import SettingsController from '@/lib/controllers/settings-controller'
import { reactive, ref, inject, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const $store = useStore()

const l10n = computed(() => { return L10nSingleton })
const $modal = inject('$modal')

const closeModal = () => {
  $modal.hide('options-edit')
}

const versionData = computed(() => {
  return `${$store.state.libName} ${$store.state.libVersion} (${$store.state.libBuildNameForDisplay})`
})

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