<template>
  <modal-base modalName="upload-warn" height="auto">
    <div class="alpheios-alignment-editor-modal-upload-warn">
        <div class="alpheios-modal-body">
            <p>{{ props.updatedDTInDB }}</p>
            <p>{{ l10n.getMsgS('UPLOAD_WARN_MESSAGE1') }}</p>
            <p>{{ l10n.getMsgS('UPLOAD_WARN_MESSAGE3') }}</p>
        </div>
        <div class="alpheios-modal-footer" >
          <div class="alpheios-editor-summary-footer" >
            <button class="alpheios-editor-button-tertiary alpheios-modal-button" @click = "continueUploadFromFile" >{{ l10n.getMsgS('UPLOAD_WARN_POPUP_FILE_OK_BUTTON') }}</button>
            <button class="alpheios-editor-button-tertiary alpheios-modal-button" @click = "continueUploadFromIndexedDB" >{{ l10n.getMsgS('UPLOAD_WARN_POPUP_INDEXEDDB_OK_BUTTON') }}</button>
            <button class="alpheios-editor-button-tertiary alpheios-modal-button" @click = "closeModal" >{{ l10n.getMsgS('UPLOAD_WARN_CANCEL_BUTTON') }}</button>
          </div>
        </div>
    </div>
  </modal-base>
</template>
<script setup>
import { computed, inject } from 'vue'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
const l10n = computed(() => { return L10nSingleton })
const emit = defineEmits([ 'continue-upload-from-file', 'continue-upload-from-indexeddb' ])

const $modal = inject('$modal')
const props = defineProps({
  updatedDTInDB: {
    type: String,
    required: false,
    default: ''
  }
})

const closeModal = () => {
  $modal.hide('upload-warn')
}
const continueUploadFromFile = () => {
  emit('continue-upload-from-file')
  closeModal()
}

const continueUploadFromIndexedDB = () => {
  emit('continue-upload-from-indexeddb')
  closeModal()
}

</script>
<style lang="scss">
  .alpheios-alignment-editor-modal-upload-warn {
    .alpheios-modal-body {
      // border: 0;
      padding: 10px 0;

      p {
        text-align: center;
      }
    }
  }
</style>

