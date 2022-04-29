<template>
    <modal classes="alpheios-alignment-editor-modal-create-al-title" name="create-al-title" :draggable="true" height="auto" :shiftY="0.3" >
        <div class="alpheios-modal-header">
          <span class="alpheios-alignment-modal-close-icon" @click="$emit('closeModal')">
              <x-close-icon />
          </span>
          <h3 class="alpheios-alignment-editor-modal-header">{{ l10n.getMsgS('INITIAL_NEW_ALIGNMENT_TITLE') }}</h3>
        </div>
        <div class="alpheios-modal-body">
            <p class="alpheios-alignment-editor-file-name-value">
              <input
                  class="alpheios-alignment-input alpheios-file-name-value"
                  type="text"
                  v-model="alTitle"
                  id="alTitleId"
                  @keyup.enter = "createAlignment"
              >
            </p>
        </div>
        <div class="alpheios-modal-footer" >
          <div class="alpheios-editor-summary-footer" >
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click = "createAlignment" :disabled="!alTitle">{{ l10n.getMsgS('INITIAL_NEW_ALIGNMENT') }}</button>
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click = "$emit('closeModal')" >{{ l10n.getMsgS('UPLOAD_WARN_CANCEL_BUTTON') }}</button>
          </div>
        </div>
    </modal>
</template>
<script>
import XCloseIcon from '@/inline-icons/x-close.svg'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'CreateAlTitlePopup',
  components: {
    xCloseIcon: XCloseIcon
  },
  props: {
  },
  data () {
    return {
      alTitle: null
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    }
  },
  methods: {
    createAlignment () {
      if (this.alTitle && (this.alTitle.length > 0)) {
        this.$emit('create-alignment', this.alTitle)
        this.$emit('closeModal')
      }
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-modal-create-al-title {
    .alpheios-modal-header {
      border: 0;
      h3 {
        text-align: center;
        padding: 0 15%;
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