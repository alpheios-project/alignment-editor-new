<template>
  <div id="alpheios-main-menu">
    <div class="alpheios-alignment-app-menu" :class="{ 'alpheios-shown': menuShown }">
      <span class="alpheios-alignment-app-menu-close-icon" @click = "closeMenu">
        <x-close-icon />
      </span>
      <div class="alpheios-alignment-app-menu__buttons">
        <div class="alpheios-alignment-app-menu__buttons-actions">
          <button class="alpheios-app-menu-link" id ="alpheios-main-menu-clear-all" 
                  @click="reloadPage">
                  {{ l10n.getMsgS('TO_HOME') }}
          </button>
          <button class="alpheios-app-menu-link" id ="alpheios-main-menu-clear-all" 
                  @click="newInitialAlignment">
                  {{ l10n.getMsgS('INITIAL_NEW_ALIGNMENT') }}
          </button>

          <button class="alpheios-app-menu-link" id ="alpheios-main-menu-upload" 
                  @click="uploadTexts"  >
                  {{ l10n.getMsgS('MAIN_MENU_UPLOAD_TITLE') }}
          </button>

          <div class="alpheios-alignment-app-menu__upload-block" id="alpheios-main-menu-upload-block" v-show="showUploadBlock" >
            <span class="alpheios-main-menu-upload-block_item">
              <input type="file" id = "alpheiosfileupload" ref="alpheiosfileupload" class="alpheios-fileupload" @change="loadTextFromFile">
              <label for="alpheiosfileupload" class="alpheios-fileupload-label alpheios-editor-button-tertiary alpheios-actions-menu-button">
                {{ l10n.getMsgS('MAIN_MENU_CHOOSE_FILE') }}                
              </label>
            </span>
            <span> OR upload autosaved</span>
          </div>
        
          <div class="alpheios-alignment-editor-initial-screen__alignments-container" v-show="showUploadBlock" v-if="indexedDBAvailable">
              <alignments-list 
                  :menuVersion = "true"
                  @upload-data-from-db="uploadDataFromDB"
              />
          </div>
        </div>
      </div>
    </div> <!--alpheios-alignment-app-menu-->
      <div class="alpheios-app-black-screen" v-show="menuShown"></div>
  </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import DownloadController from '@/lib/controllers/download-controller.js'
import SettingsController from '@/lib/controllers/settings-controller.js'

import DownloadIcon from '@/inline-icons/download.svg'
import UploadIcon from '@/inline-icons/upload.svg'
import XCloseIcon from '@/inline-icons/x-close.svg'
import Tooltip from '@/vue/common/tooltip.vue'

import AlignmentsList from '@/vue/alignments-list.vue'

export default {
  name: 'MainMenu',
  components: {
    downloadIcon: DownloadIcon,
    uploadIcon: UploadIcon,
    xCloseIcon: XCloseIcon,
    tooltip: Tooltip, 
    alignmentsList: AlignmentsList
  },
  props: {
    menuShow: {
      type: Number,
      required: true
    },
    updateCurrentPage: {
      type: String,
      required: false,
      default: ''
    }
  },
  data () {
    return {
      menuShown: false,
      showUploadBlock: false,
      showDownloadBlock: false,
      currentDownloadType: null,
      uploadFileName: null,
      currentPage: 'initial-page'
    }
  },
  mounted () {  
    this.currentDownloadType = this.downloadTypes.length > 0 ? this.downloadTypes[0].name : null
  },
  watch: {
    menuShow () {
      this.menuShown = true
    },
    updateCurrentPage (value) {
      this.currentPage = value
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    alignAvailable () {
      return this.$store.state.docSourceUpdated && this.$store.state.optionsUpdated && this.$textC.couldStartAlign && this.$textC.checkSize()
    },
    undoAvailable () {
      return this.alignEditAvailable && this.$historyAGC.undoAvailable
    },
    redoAvailable () {
      return this.alignEditAvailable && this.$historyAGC.redoAvailable
    },
    downloadAvailable () {
      return Boolean(this.$store.state.docSourceUpdated) && this.$textC.originDocSourceHasText
    },
    docSourceEditAvailable () {
      return this.$store.state.docSourceUpdated && this.$store.state.alignmentUpdated && !this.$alignedGC.alignmentGroupsWorkflowStarted
    },
    alignEditAvailable () {
      return this.$store.state.docSourceUpdated && this.$store.state.alignmentUpdated && this.$alignedGC.alignmentGroupsWorkflowStarted
    },
    addTargetAvailable () {
      return Boolean(this.$store.state.docSourceUpdated) && this.$textC.allTargetTextsIds && (this.$textC.allTargetTextsIds.length > 0)
    },
    downloadTypes () {
      return Boolean(this.$store.state.alignmentUpdated) && 
             Object.values(DownloadController.downloadMethods).filter(method => method.allTexts && (!method.alignmentStarted || this.$alignedGC.alignmentGroupsWorkflowAvailable))
    },
    enableTokensEditorOptionItemValue () {
      return this.$store.state.optionsUpdated && SettingsController.enableTokensEditor
    },
    tokensEditAvailable () {
      return this.alignEditAvailable && this.enableTokensEditorOptionItemValue
    },
    indexedDBAvailable () {
      return this.$textC.indexedDBAvailable
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
      const file = this.$refs.alpheiosfileupload.files[0]

      if (!file) { return }
      const extension = file.name.indexOf('.') > -1 ? file.name.split('.').pop() : ''

      if (!this.$textC.checkUploadedFileByExtension(extension)) { 
        this.closeMenu()
        return 
      }

      const reader = new FileReader()

      reader.onload = e => {
        this.$emit("upload-data", e.target.result, extension)
        this.showUploadBlock = false
        this.$refs.alpheiosfileupload.value = ''
        this.closeMenu()
      }
      reader.readAsText(file)
    },

    downloadTypeId (dTypeName) {
      return `alpheios-main-menu-download-block__radio_${dTypeName}`
    },

    newInitialAlignment () {
      this.clearAll()
      this.$emit("new-initial-alignment")
    },

    clearAll () {
      this.$refs.alpheiosfileupload.value = ''
      this.showUploadBlock = false
      this.showDownloadBlock = false
      this.$emit('clear-all')

      this.currentPage = 'initial-page'
      this.closeMenu()
      
    },
    
    reloadPage () {
      location.reload(true)
    },
    closeMenu () {
      this.menuShown = false
    },

    addTarget () {
      this.$emit('add-target')
      this.closeMenu()
    },
    
    alignTexts () {
      this.$emit('align-texts')
      this.closeMenu()
    },

    undoAction () {
      this.$emit('undo-action')
      this.closeMenu()
    },

    redoAction () {
      this.$emit('redo-action')
      this.closeMenu()
    },

    downloadData () {
      this.$emit('download-data', this.currentDownloadType)
      this.showDownloadBlock = false
      this.closeMenu()
    },

    changeFileUpload () {
      const file = this.$refs.alpheiosfileupload.files[0]

      if (!file) { return }
      this.uploadFileName = file.name
    },

    showOptions () {
      this.$emit('showOptions')
      this.currentPage = 'options-page'
      this.closeMenu()
    },

    showSourceTextEditor () {
      this.$emit('showSourceTextEditor')
      this.currentPage = 'text-editor-page'
      this.closeMenu()
    },

    showAlignmentGroupsEditor () {
      this.$emit('showAlignmentGroupsEditor')
      this.currentPage = 'align-editor-page'
      this.closeMenu()
    },

    showTokensEditor () {
      this.$emit('showTokensEditor')
      this.currentPage = 'tokens-editor-page'
      this.closeMenu()
    },

    uploadDataFromDB (alData) {
      this.$emit('upload-data-from-db', alData)
      this.showUploadBlock = false
      this.closeMenu()
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-app-menu {
      height: 100%; 
      width: 400px; 
      position: fixed; 
      z-index: 10000;
      top: 0; 
      left: -400px;
      background-color: #e0e0e0; 
      overflow-x: hidden; 
       
      transition: left 0.5s; 

      &.alpheios-shown {
        left: 0;
      }

      .alpheios-alignment-app-menu__buttons {
        padding: 70px 20px 10px;
      }
      .alpheios-alignment-app-menu-close-icon {
        display: block;
        position: absolute;
        top: 25px;
        right: 25px;
        width: 25px;
        height: 25px;
        cursor: pointer;

        svg {
          width: 100%;
          height: 100%;
          display: block;
        }
      }
  }

  .alpheios-app-menu-link {
    display: block;
    padding: 7px 0;
    cursor: pointer;
    white-space: nowrap;
  }

  .alpheios-alignment-app-menu__upload-block {
    text-align: left;

    padding: 10px 0;
    border-top: 2px solid #ddd;
    // border-bottom: 2px solid #ddd;
  }

  .alpheios-main-menu-upload-block-radio-block_item,
  .alpheios-main-menu-upload-block_item {
    padding-right: 20px; 
  }

  .alpheios-main-menu-upload-block_item {
    text-align: center;

    &.alpheios-token-edit-actions-button {
      width: 30px;
      height: 30px;
      border-radius: 30px;
      line-height: 30px;
      padding: 5px;
    }
  }

  button.alpheios-app-menu-link {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    margin: 0;
    overflow: visible;
    text-transform: none;
    -webkit-appearance: button;
    background: transparent;
    border: 0;
    outline: 0;

    &.alpheios-app-menu-link-current {
      font-weight: bold;
      text-shadow: 1px 1px #eee;
    }
  }

  button.alpheios-app-menu-link::-moz-focus-inner {
    border-style: none;
    padding: 0;
  }

  button.alpheios-app-menu-link:-moz-focusring {
    outline: 1px dotted ButtonText;
  }

  .alpheios-fileupload {
    opacity: 0;
    width: 0.1px;
    height: 0.1px;
    position: absolute;
  }

  .alpheios-fileupload-label {
    display: inline-block;
  }

  .alpheios-alignment-app-menu__buttons-blocks {
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }

  .alpheios-app-black-screen {
    height: 100%; 
    width: 100%; 
    position: fixed; 
    z-index: 90;
    top: 0;
    left: 0;

    opacity: 0.6;
    background: #000;
    transition: 0.6s;
  }
</style>
