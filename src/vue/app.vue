<template>
  <div id="alpheios-alignment-editor-app-container" class="alpheios-alignment-editor-app-container">
      <span class="alpheios-alignment-app-menu-open-icon" @click = "menuShow++" v-show="!showInitialScreenBlock">
        <navbar-icon />
      </span>
      <main-menu 
        @download-data = "downloadData"
        @upload-data = "uploadDataFromFile"
        @align-texts = "showSummaryPopup"
        @redo-action = "redoAction"
        @undo-action = "undoAction"
        @add-target = "addTarget"
        @clear-all = "startOver"
        @new-initial-alignment = "startNewInitialAlignment"
        @upload-data-from-db = "uploadDataFromDB"

        @showOptions = "showOptions"
        @showSourceTextEditor = "showSourceTextEditor"
        @showAlignmentGroupsEditor = "showAlignmentGroupsEditor"
        @showTokensEditor = "showTokensEditor"

        :menuShow = "menuShow"
        :updateCurrentPage = "updateCurrentPage"
      />
      <notification-bar />
      <initial-screen v-show="showInitialScreenBlock"
        @upload-data-from-file = "uploadDataFromFile" @upload-data-from-db = "uploadDataFromDB" @delete-data-from-db = "deleteDataFromDB"
        @new-initial-alignment="startNewInitialAlignment" @clear-all-alignments="clearAllAlignmentsFromDB"/>
      <text-editor v-show="showSourceTextEditorBlock" @add-translation="addTarget" @align-text="showSummaryPopup" @showAlignmentGroupsEditor = "showAlignmentGroupsEditor" @showTokensEditor = "showTokensEditor"
      />
      <align-editor v-show="showAlignmentGroupsEditorBlock" @showSourceTextEditor = "showSourceTextEditor" @showTokensEditor = "showTokensEditor"
      />
      <tokens-editor v-show="showTokensEditorBlock" :renderEditor = "renderTokensEditor" @showSourceTextEditor = "showSourceTextEditor"  @showAlignmentGroupsEditor = "showAlignmentGroupsEditor"
      />

      <summary-popup @closeModal = "$modal.hide('summary')" @start-align = "alignTexts"
      />
      <waiting-popup @closeModal = "$modal.hide('waiting')" />

      <upload-warn-popup @closeModal = "$modal.hide('upload-warn')" :updatedDTInDB = "updatedDTInDB" 
        @continue-upload-from-file = "continueUploadFromFile"   @continue-upload-from-indexeddb ="continueUploadFromIndexedDB" />

      <create-al-title-popup @create-alignment = "createANewAlignment" @closeModal = "$modal.hide('create-al-title')" />
  </div>
</template>
<script>
import NotificationSingleton from '@/lib/notifications/notification-singleton'

import Alignment from '@/lib/data/alignment'

import InitialScreen from '@/vue/initial-screen.vue'
import MainMenu from '@/vue/main-menu.vue'
import SummaryPopup from '@/vue/summary-popup.vue'

import WaitingPopup from '@/vue/common/waiting-popup.vue'
import UploadWarnPopup from '@/vue/common/upload-warn-popup.vue'
import CreateAlTitlePopup from '@/vue/common/create-al-title-popup.vue'

import NotificationBar from '@/vue/notification-bar.vue'
import TextEditor from '@/vue/text-editor/text-editor.vue'
import AlignEditor from '@/vue/align-editor/align-editor.vue'
import TokensEditor from '@/vue/tokens-editor/tokens-editor.vue'

import OptionsBlock from '@/vue/options/options-block.vue'

import NavbarIcon from '@/inline-icons/navbar.svg'

import SettingsController from '@/lib/controllers/settings-controller.js'
import DocumentUtility from '@/lib/utility/document-utility.js'

export default {
  name: 'App',
  components: {
    mainMenu: MainMenu,
    textEditor: TextEditor,
    alignEditor: AlignEditor,
    tokensEditor: TokensEditor,
    notificationBar: NotificationBar,
    optionsBlock: OptionsBlock,
    navbarIcon: NavbarIcon,
    initialScreen: InitialScreen,
    summaryPopup: SummaryPopup,
    waitingPopup: WaitingPopup,
    uploadWarnPopup: UploadWarnPopup,
    createAlTitlePopup: CreateAlTitlePopup
  },
  data () {
    return {     
      showInitialScreenBlock: true,
      shownOptionsBlock: false,
      showSourceTextEditorBlock: false,
      showAlignmentGroupsEditorBlock: false,
      showTokensEditorBlock: false,
      menuShow: 1,
      renderTokensEditor: 1,
      updateCurrentPage: 'initial-screen',

      fileData: null,
      extension: null,
      updatedDTInDB: null,
      checkAlInDB: null
    }
  },
  watch: {
  },
  computed: {
  },
  mounted () {
    this.showInitialScreen()
  },
  methods: {
    /**
     * Starts download workflow
     */
    async downloadData (downloadType) {
      let additional = {}
      if (downloadType === 'htmlDownloadAll') {
        additional = {
          theme: SettingsController.themeOptionValue
        }
      }
      await this.$textC.downloadData(downloadType, additional)
    },

    /**
    * Starts upload workflow
    */
    async uploadDataFromFile (fileData, extension) {
      if (fileData) {
        const shortAlData = this.$textC.extractIDandDateFromFile(fileData, extension)
        const checkAlInDB = await this.$textC.checkShortAlInDB(shortAlData)

        if (shortAlData && checkAlInDB) {
          this.fileData = fileData
          this.extension = extension
          this.updatedDTInDB = checkAlInDB.updatedDT
          this.checkAlInDB = checkAlInDB

          this.$modal.show('upload-warn')
        } else {
          this.uploadDataFromFileFinal(fileData, extension)
        }    
      }
    },


    continueUploadFromFile () {
      this.uploadDataFromFileFinal(this.fileData, this.extension)
      this.clearUploadData()
    },

    continueUploadFromIndexedDB () {
      this.uploadDataFromDB(this.checkAlInDB)
      this.clearUploadData()
    },

    clearUploadData () {
      this.fileData = null
      this.extension = null
      this.updatedDTInDB = null
      this.checkAlInDB = null
    },

    uploadDataFromFileFinal (fileData, extension) {
      const alignment = this.$textC.uploadDataFromFile(fileData, SettingsController.tokenizerOptionValue, extension)

      if (alignment instanceof Alignment) {
        return this.startOver(alignment)
      }
      this.showSourceTextEditor()
    },

    async uploadDataFromDB (alData) {
      if (alData) {
        const alignment = await this.$textC.uploadDataFromDB(alData)
        if (alignment instanceof Alignment) {
          return this.startOver(alignment)
        } else {
          console.error('Something went wrong with uploading data - ', alignment)
        }
      }
      // this.showSourceTextEditor()
    },

    async deleteDataFromDB (alData) {
      if (alData) {
        this.$modal.show('waiting')
        const result = await this.$textC.deleteDataFromDB(alData)
        this.$modal.hide('waiting')
        return result
      }
    },

    async clearAllAlignmentsFromDB () {
      this.$modal.show('waiting')
      const result = await this.$textC.clearAllAlignmentsFromDB()
      this.$modal.hide('waiting')
      return result
    },
    /**
     * Starts redo action
     */
    redoAction () {
      this.$historyAGC.redo()
    },
    /**
     * Starts undo action
     */
    undoAction () {
      this.$historyAGC.undo()
    },

    async showSummaryPopup () {
      if (!SettingsController.showSummaryPopup) {
        await this.alignTexts()
      } else {
        this.$modal.show('summary')
      }
    },
    /**
     * Starts align workflow
     */
    async alignTexts () {
      this.$modal.show('waiting')
      const result = await this.$alignedGC.createAlignedTexts(this.$textC.alignment)
      this.$modal.hide('waiting')
      if (result) {
        this.$tokensEC.loadAlignment(this.$textC.alignment)
        this.showAlignmentGroupsEditor()
      }
    },
    /**
     * Add aditional block for defining another target text
     */
    addTarget () {
      this.$textC.addNewTarget()
      this.showSourceTextEditor()
    },

    startNewInitialAlignment () {
      this.$modal.show('create-al-title')
    },

    createANewAlignment (alTitle) {
      this.$textC.createAlignment(alTitle)
      this.$historyAGC.startTracking(this.$textC.alignment)
      this.showSourceTextEditor()
    },

    /**
     * Show options block
     */
    showOptions () {
      this.shownOptionsBlock = true
      this.showSourceTextEditorBlock = false
      this.showAlignmentGroupsEditorBlock = false
      this.showTokensEditorBlock = false
      this.showInitialScreenBlock = false

      DocumentUtility.setPageClassToBody('options')
      this.updateCurrentPage = 'options'
    },

    showSourceTextEditor () {
      this.shownOptionsBlock = false
      this.showSourceTextEditorBlock = true
      this.showAlignmentGroupsEditorBlock = false
      this.showTokensEditorBlock = false
      this.showInitialScreenBlock = false

      DocumentUtility.setPageClassToBody('text-editor')
      this.updateCurrentPage = 'text-editor'
    },

    showAlignmentGroupsEditor () {
      this.shownOptionsBlock = false
      this.showSourceTextEditorBlock = false
      this.showAlignmentGroupsEditorBlock = true
      this.showTokensEditorBlock = false
      this.showInitialScreenBlock = false

      DocumentUtility.setPageClassToBody('align-editor')
      this.updateCurrentPage = 'align-editor'
    },

    showTokensEditor () {
      this.shownOptionsBlock = false
      this.showSourceTextEditorBlock = false
      this.showAlignmentGroupsEditorBlock = false
      this.showTokensEditorBlock = true
      this.showInitialScreenBlock = false

      DocumentUtility.setPageClassToBody('tokens-editor')
      this.updateCurrentPage = 'tokens-editor'

      this.renderTokensEditor++
    },

    showInitialScreen () {
      this.shownOptionsBlock = false
      this.showSourceTextEditorBlock = false
      this.showAlignmentGroupsEditorBlock = false
      this.showTokensEditorBlock = false
      this.showInitialScreenBlock = true

      DocumentUtility.setPageClassToBody('initial')
      this.updateCurrentPage = 'initial'
    },

    /**
     * Clear and start alignment over
     */

    startOver (alignment) {
      if (alignment instanceof Alignment) {
        this.$textC.alignment = alignment
        this.$alignedGC.alignment = alignment
      } else {
        this.$textC.startOver()
        this.$alignedGC.startOver()
      }
      this.$historyAGC.startOver(this.$textC.alignment)
      this.$tokensEC.startOver(this.$textC.alignment)
      
      NotificationSingleton.clearNotifications()
      if (alignment instanceof Alignment) {
        this.$textC.store.commit('incrementUploadCheck')
      } else {
        this.$textC.store.commit('incrementAlignmentRestarted')
      }
      this.$textC.store.commit('incrementDocSourceUpdated')

      if ((alignment instanceof Alignment) && alignment.hasOriginAlignedTexts) {
        this.showAlignmentGroupsEditor()
      } else {
        this.showSourceTextEditor()
      }
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-container {
      padding: 15px 15px 0;

      h2 {
        margin: 0;
        padding: 0;
      }
    }

    .alpheios-alignment-app-menu-open-icon {
        display: block;
        position: fixed;
        top: 25px;
        left: 10px;
        width: 25px;
        height: 25px;
        cursor: pointer;


        svg {
          width: 100%;
          height: 100%;
          display: block;
        }
    }
</style> 