<template>
  <div class="alpheios-alignment-app-menu" id="alpheios-main-menu">
      <div class="alpheios-alignment-app-menu__buttons">
        <button class="alpheios-editor-button-tertiary alpheios-menu-button" id ="alpheios-main-menu-options" 
                @click="$emit('toggle-options')" >
                {{ toggleOptionsTitle }}
        </button>
        <button class="alpheios-editor-button-tertiary alpheios-menu-button" id ="alpheios-main-menu-add-target" 
                @click="$emit('add-target')" :disabled="!addTargetAvailable" >
                {{ l10n.getMsgS('MAIN_MENU_ADD_TARGET_TITLE') }}
        </button>

        <button class="alpheios-editor-button-tertiary alpheios-menu-button" id ="alpheios-main-menu-download" 
                @click="downloadTexts" :disabled="!downloadAvailable" >
                {{ l10n.getMsgS('MAIN_MENU_DOWNLOAD_TITLE') }}
        </button>

        <button class="alpheios-editor-button-tertiary alpheios-menu-button" id ="alpheios-main-menu-upload" 
                @click="uploadTexts"  :disabled="!docSourceEditAvailable" >
                {{ l10n.getMsgS('MAIN_MENU_UPLOAD_TITLE') }}
        </button>

        <button class="alpheios-editor-button-tertiary alpheios-menu-button" id ="alpheios-main-menu-align" 
                @click="$emit('align-texts')" :disabled="!alignAvailable">
                {{ l10n.getMsgS('MAIN_MENU_ALIGN_TITLE') }}
        </button>
        
        <button class="alpheios-editor-button-tertiary alpheios-menu-button" id ="alpheios-main-menu-undo" 
                @click="$emit('undo-action')" :disabled="!undoAvailable">
                {{ l10n.getMsgS('MAIN_MENU_UNDO_TITLE') }}
        </button>

        <button class="alpheios-editor-button-tertiary alpheios-menu-button" id ="alpheios-main-menu-redo" 
                @click="$emit('redo-action')" :disabled="!redoAvailable">
                {{ l10n.getMsgS('MAIN_MENU_REDO_TITLE') }}
        </button>
        <button class="alpheios-editor-button-tertiary alpheios-menu-button" id ="alpheios-main-menu-clear-all" 
                @click="$emit('clear-all')">
                {{ l10n.getMsgS('MAIN_MENU_CLEAR_TEXT') }}
        </button>
      </div>
      <div class="alpheios-alignment-app-menu__upload-block" id="alpheios-main-menu-upload-block" v-show="showUploadBlock &&  docSourceEditAvailable" >
          <span v-for="dType in uploadTypes" :key="dType.name" class="alpheios-main-menu-upload-block-radio-block_item">
              <input type="radio" :id="uploadTypeId(dType.name)" :value="dType.name" v-model="currentUploadType" >
              <label :for="uploadTypeId(dType.name)">{{ dType.label }}</label>
          </span>
        <span class="alpheios-main-menu-upload-block_item">
          <input type="file" ref="fileupload">
        </span>
        <span class="alpheios-main-menu-upload-block_item alpheios-token-edit-actions-button">
          <upload-icon @click="loadTextFromFile"/>
        </span>
      </div>
      <div class="alpheios-alignment-app-menu__download-block" id="alpheios-main-menu-download-block" v-show="showDownloadBlock &&  downloadAvailable" >
        <p class="alpheios-main-menu-download-block-radio-block">
          <span v-for="dType in downloadTypes" :key="dType.name" class="alpheios-main-menu-download-block-radio-block_item">
              <input type="radio" :id="downloadTypeId(dType.name)" :value="dType.name" v-model="currentDownloadType" >
              <label :for="downloadTypeId(dType.name)">{{ dType.label }}</label>
          </span>
          <span class="alpheios-main-menu-download-block_item alpheios-token-edit-actions-button">
            <download-icon @click="$emit('download-data', currentDownloadType)"/>
          </span>
        </p>
      </div>
  </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import DownloadController from '@/lib/controllers/download-controller.js'
import UploadController from '@/lib/controllers/upload-controller.js'

import DownloadIcon from '@/inline-icons/download.svg'
import UploadIcon from '@/inline-icons/upload.svg'

export default {
  name: 'MainMenu',
  components: {
    downloadIcon: DownloadIcon,
    uploadIcon: UploadIcon
  },
  props: {
    shownOptionsBlock: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      showUploadBlock: false,
      showDownloadBlock: false,
      currentDownloadType: null,
      currentUploadType: null
    }
  },
  mounted () {  
    this.currentDownloadType = this.downloadTypes[0].name
    this.currentUploadType = this.uploadTypes[0].name
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    alignAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && this.$textC.couldStartAlign
    },
    undoAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && this.$alignedGC.alignmentGroupsWorkflowAvailable && this.$historyC.undoAvailable
    },
    redoAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && this.$alignedGC.alignmentGroupsWorkflowAvailable  && this.$historyC.redoAvailable
    },
    downloadAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && Boolean(this.$textC.originDocSource)
    },
    docSourceEditAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && !this.$alignedGC.alignmentGroupsWorkflowStarted
    },
    toggleOptionsTitle () {
      return this.shownOptionsBlock ? this.l10n.getMsgS('MAIN_MENU_HIDE_OPTIONS_TITLE') : this.l10n.getMsgS('MAIN_MENU_SHOW_OPTIONS_TITLE')
    },
    addTargetAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && this.$textC.allTargetTextsIds && (this.$textC.allTargetTextsIds.length > 0)
    },
    downloadTypes () {
      return Object.values(DownloadController.downloadMethods).filter(method => method.allTexts)
    },
    uploadTypes () {
      return Object.values(UploadController.uploadMethods).filter(method => method.allTexts)
    }
  },
  methods: {
    /**
     * Shows/Hides block with choose file input
     */
    uploadTexts () {
      this.showDownloadBlock = false
      this.showUploadBlock = !this.showUploadBlock
    },

    downloadTexts () {
      this.showUploadBlock = false
      this.showDownloadBlock = !this.showDownloadBlock
    },

    /**
     * Creates FileReader and passes data from file to App component for parsing
     */
    loadTextFromFile() {
      const file = this.$refs.fileupload.files[0]

      if (!file) { return }
      const reader = new FileReader()

      reader.onload = e => {
        this.$emit("upload-data", e.target.result, this.currentUploadType)
        // this.showUploadBlock = false
      }
      reader.readAsText(file)
    },

    downloadTypeId (dTypeName) {
      return `alpheios-main-menu-download-block__radio_${dTypeName}`
    },

    uploadTypeId (dTypeName) {
      return `alpheios-main-menu-upload-block__radio_${dTypeName}`
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-app-menu__buttons,
  .alpheios-alignment-app-menu__upload-block,
  .alpheios-alignment-app-menu__download-block {
    padding: 15px 15px 0;
    text-align: left;
  }

  .alpheios-main-menu-download-block-radio-block_item,
  .alpheios-main-menu-upload-block-radio-block_item,
  .alpheios-main-menu-upload-block_item {
    padding-right: 20px; 
  }

  .alpheios-main-menu-upload-block_item,
  .alpheios-main-menu-download-block_item {
    &.alpheios-token-edit-actions-button {
      width: 30px;
      height: 30px;
      border-radius: 30px;
      line-height: 30px;
      padding: 5px;
    }
  }
</style>
