<template>
  <modal-base modalName = "createAlTitle" height="auto" :shiftY="0.3" >
    <div id="alpheios-editor-modal-create-al-title" class="alpheios-alignment-editor-modal-create-al-title">
      <div class="alpheios-modal-header">
          <span class="alpheios-alignment-modal-close-icon" @click="closeModal">
              <x-close-icon />
          </span>
          <h3 class="alpheios-alignment-editor-modal-header">{{ l10n.getMsgS('INITIAL_NEW_ALIGNMENT_TITLE') }}</h3>
      </div>
      <div class="alpheios-modal-body">
          <p class="alpheios-alignment-editor-file-name-value">
              <input
                  class="alpheios-alignment-input alpheios-file-name-value"
                  type="text"
                  v-model="state.alTitle"
                  id="alpheios-file-name-al-title-id"
                  @keyup.enter = "createAlignment"
              >
          </p>
      </div>
      <div class="alpheios-modal-footer" >
          <div class="alpheios-editor-summary-footer" >
            <button class="alpheios-editor-button-tertiary alpheios-modal-button" id="alpheios-editor-create-al-title_ok"
                @click = "createAlignment" :disabled="!state.alTitle">{{ l10n.getMsgS('INITIAL_NEW_ALIGNMENT') }}</button>
            <button class="alpheios-editor-button-tertiary alpheios-modal-button" id="alpheios-editor-create-al-title_cancel"
                @click = "closeModal" >{{ l10n.getMsgS('UPLOAD_WARN_CANCEL_BUTTON') }}</button>
          </div>
      </div>
    </div>
  </modal-base>
</template>
<script setup>
import XCloseIcon from '@/inline-icons/xclose.svg'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import { reactive, computed, inject } from 'vue'

const $modal = inject('$modal')
const l10n = computed(() => { return L10nSingleton })

const state = reactive({ 
  alTitle: null
})

const emit = defineEmits([ 'create-alignment' ])

const createAlignment = () => {
  if (state.alTitle && (state.alTitle.length > 0)) {
    emit('create-alignment', state.alTitle)
    closeModal()
  }
}

const closeModal = () => { $modal.hide('createAlTitle') }

</script>
<style lang="scss">
  .alpheios-alignment-editor-modal-create-al-title {
    .alpheios-modal-header {
      border: 0;
      h3 {
        text-align: center;
        padding: 0 50px;
        margin: 10px 0;
        color: #000;
      }
    }
    .alpheios-modal-body {
      border: 0;
      padding: 10px 0;

      p {
        text-align: center;
        padding: 20px 50px 20px;
        margin: 0;
      }
    }
  }
</style>