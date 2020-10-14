<template>
  <div class="alpheios-alignment-app-menu" id="alpheios-main-menu">
      <div class="alpheios-alignment-app-menu__buttons">
        <button class="alpheios-button-tertiary alpheios-menu-button" id ="alpheios-main-menu-add-target" 
                @click="$emit('add-target')" :disabled="!docSourceEditAvailable" >
                {{ l10n.getMsgS('MAIN_MENU_ADD_TARGET_TITLE') }}
        </button>

        <button class="alpheios-button-tertiary alpheios-menu-button" id ="alpheios-main-menu-download" 
                @click="$emit('download-data')"  :disabled="!docSourceEditAvailable" >
                {{ l10n.getMsgS('MAIN_MENU_DOWNLOAD_TITLE') }}
        </button>

        <button class="alpheios-button-tertiary alpheios-menu-button" id ="alpheios-main-menu-upload" 
                @click="uploadTexts"  :disabled="!docSourceEditAvailable" >
                {{ l10n.getMsgS('MAIN_MENU_UPLOAD_TITLE') }}
        </button>

        <button class="alpheios-button-tertiary alpheios-menu-button" id ="alpheios-main-menu-align" 
                @click="$emit('align-texts')" :disabled="!alignAvailable">
                {{ l10n.getMsgS('MAIN_MENU_ALIGN_TITLE') }}
        </button>
        
        <button class="alpheios-button-tertiary alpheios-menu-button" id ="alpheios-main-menu-undo" 
                @click="$emit('undo-action')" :disabled="!undoAvailable">
                {{ l10n.getMsgS('MAIN_MENU_UNDO_TITLE') }}
        </button>

        <button class="alpheios-button-tertiary alpheios-menu-button" id ="alpheios-main-menu-redo" 
                @click="$emit('redo-action')" :disabled="!redoAvailable">
                {{ l10n.getMsgS('MAIN_MENU_REDO_TITLE') }}
        </button>
      </div>
      <div class="alpheios-alignment-app-menu__upload-block" id="alpheios-main-menu-upload-block" v-show="showUploadBlock &&  docSourceEditAvailable" >
        <input type="file" @change="loadTextFromFile">
      </div>
  </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'MainMenu',
  props: {
  },
  data () {
    return {
      showUploadBlock: false,
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    alignAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && this.$textC.couldStartAlign && !this.$alignedC.alignmentGroupsWorkflowStarted
    },
    undoAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && this.$historyC.undoAvailable
    },
    redoAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && this.$historyC.redoAvailable
    },
    docSourceEditAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && !this.$alignedC.alignmentGroupsWorkflowStarted
    }
  },
  methods: {
    /**
     * Shows block with choose file input
     */
    uploadTexts () {
      this.showUploadBlock = true
    },

    /**
     * Creates FileReader and passes data from file to App component for parsing
     */
    loadTextFromFile(ev) {
      const file = ev.target.files[0]
      if (!file) { return }
      const reader = new FileReader()

      reader.onload = e => {
        this.$emit("upload-data", e.target.result)
        this.showUploadBlock = false
      }
      reader.readAsText(file)
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-app-menu__buttons,
  .alpheios-alignment-app-menu__upload-block {
    padding: 15px 15px 0;
    text-align: left;
  }
</style>