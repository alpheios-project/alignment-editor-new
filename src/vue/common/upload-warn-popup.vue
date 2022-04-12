<template>
    <modal classes="alpheios-alignment-editor-modal-upload-warn" name="upload-warn" :draggable="true" height="auto" :shiftY="0.3">
        <div class="alpheios-modal-body">
            <p>{{ l10n.getMsgS('UPLOAD_WARN_MESSAGE1') }}</p>
            <p>{{ l10n.getMsgS('UPLOAD_WARN_MESSAGE2', { updatedDTInDB }) }}</p>
            <p>{{ l10n.getMsgS('UPLOAD_WARN_MESSAGE3') }}</p>
        </div>
        <div class="alpheios-modal-footer" >
          <div class="alpheios-editor-summary-footer" >
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click = "continueUploadFromFile" >{{ l10n.getMsgS('UPLOAD_WARN_POPUP_OK_BUTTON') }}</button>
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click = "$emit('closeModal')" >{{ l10n.getMsgS('UPLOAD_WARN_CANCEL_BUTTON') }}</button>
          </div>
        </div>
    </modal>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'UploadWarnPopup',
  components: {
  },
  props: {
    updatedDTInDB: {
      type: String,
      required: false,
      default: ''
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    }
  },
  methods: {
    continueUploadFromFile () {
      this.$emit('continue-upload')
      this.$emit('closeModal')
    }
  }
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