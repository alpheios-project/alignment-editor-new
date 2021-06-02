<template>
  <div id="alpheios-alignment-editor-app-container" class="alpheios-alignment-editor-app-container">
      <span class="alpheios-alignment-app-menu-open-icon" @click = "menuShow++">
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

        @showOptions = "showOptions"
        @showSourceTextEditor = "showSourceTextEditor"
        @showAlignmentGroupsEditor = "showAlignmentGroupsEditor"
        @showTokensEditor = "showTokensEditor"

        :menuShow = "menuShow"
        :updateCurrentPage = "updateCurrentPage"
      />
      <notification-bar />
      <initial-screen v-show="showInitialScreenBlock"
        @upload-data-from-file = "uploadDataFromFile" @upload-data-from-db = "uploadDataFromDB"
        @new-initial-alignment="startNewInitialAlignment"/>
      <text-editor v-show="showSourceTextEditorBlock" @add-translation="addTarget" @align-text="showSummaryPopup" @showAlignmentGroupsEditor = "showAlignmentGroupsEditor" @showTokensEditor = "showTokensEditor"
      />
      <align-editor v-show="showAlignmentGroupsEditorBlock" @showSourceTextEditor = "showSourceTextEditor" @showTokensEditor = "showTokensEditor"
      />
      <tokens-editor v-show="showTokensEditorBlock" :renderEditor = "renderTokensEditor" @showSourceTextEditor = "showSourceTextEditor"  @showAlignmentGroupsEditor = "showAlignmentGroupsEditor"
      />

      <summary-popup :showModal="showSummaryModal" :showOnlyWaiting = "showOnlyWaitingSummary" @closeModal = "showSummaryModal = false" @start-align = "alignTexts"
      />
  </div>
</template>
<script>
import NotificationSingleton from '@/lib/notifications/notification-singleton'

import Alignment from '@/lib/data/alignment'

import InitialScreen from '@/vue/initial-screen.vue'
import MainMenu from '@/vue/main-menu.vue'
import SummaryPopup from '@/vue/summary-popup.vue'

import NotificationBar from '@/vue/notification-bar.vue'
import TextEditor from '@/vue/text-editor/text-editor.vue'
import AlignEditor from '@/vue/align-editor/align-editor.vue'
import TokensEditor from '@/vue/tokens-editor/tokens-editor.vue'

import OptionsBlock from '@/vue/options/options-block.vue'

import NavbarIcon from '@/inline-icons/navbar.svg'

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
    summaryPopup: SummaryPopup
  },
  data () {
    return {     
      showInitialScreenBlock: true,
      shownOptionsBlock: false,
      showSourceTextEditorBlock: false,
      showAlignmentGroupsEditorBlock: false,
      showTokensEditorBlock: false,

      pageClasses: [ 'initial-page', 'options-page', 'text-editor-page', 'align-editor-page', 'tokens-editor-page' ],
      menuShow: 1,
      renderTokensEditor: 1,
      updateCurrentPage: 'initial-screen',

      showSummaryModal: false,
      showOnlyWaitingSummary: false
    }
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
    downloadData (downloadType) {
      let additional = {}
      if (downloadType === 'htmlDownloadAll') {
        additional = {
          theme: this.$settingsC.themeOptionValue
        }
      }
      this.$textC.downloadData(downloadType, additional)
    },

    /**
    * Starts upload workflow
    */
    uploadDataFromFile (fileData, extension) {
      if (fileData) {
        const alignment = this.$textC.uploadDataFromFile(fileData, this.$settingsC.tokenizerOptionValue, extension)

        if (alignment instanceof Alignment) {
          return this.startOver(alignment)
        }
      } 
      
      this.showSourceTextEditor()
    },

    async uploadDataFromDB (alData) {
      if (alData) {
        const alignment = await this.$textC.uploadDataFromDB(alData)
        if (alignment instanceof Alignment) {
          return this.startOver(alignment)
        }
      }
      this.showSourceTextEditor()
    },
    /**
     * Starts redo action
     */
    redoAction () {
      this.$historyC.redo()
    },
    /**
     * Starts undo action
     */
    undoAction () {
      this.$historyC.undo()
    },

    showSummaryPopup () {
      this.showOnlyWaitingSummary = !this.$settingsC.showSummaryPopup
      this.showSummaryModal = true
    },
    /**
     * Starts align workflow
     */
    async alignTexts () {
      const result = await this.$alignedGC.createAlignedTexts(this.$textC.alignment, this.$settingsC.useSpecificEnglishTokenizer)
      this.showSummaryModal = false
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
      this.$textC.createAlignment()
      this.$historyC.startTracking(this.$textC.alignment)
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

      this.setPageClassToBody('options-page')
      this.updateCurrentPage = 'options-page'
    },

    showSourceTextEditor () {
      this.shownOptionsBlock = false
      this.showSourceTextEditorBlock = true
      this.showAlignmentGroupsEditorBlock = false
      this.showTokensEditorBlock = false
      this.showInitialScreenBlock = false

      this.setPageClassToBody('text-editor-page')
      this.updateCurrentPage = 'text-editor-page'
    },

    showAlignmentGroupsEditor () {
      this.shownOptionsBlock = false
      this.showSourceTextEditorBlock = false
      this.showAlignmentGroupsEditorBlock = true
      this.showTokensEditorBlock = false
      this.showInitialScreenBlock = false

      this.setPageClassToBody('align-editor-page')
      this.updateCurrentPage = 'align-editor-page'
    },

    showTokensEditor () {
      this.shownOptionsBlock = false
      this.showSourceTextEditorBlock = false
      this.showAlignmentGroupsEditorBlock = false
      this.showTokensEditorBlock = true
      this.showInitialScreenBlock = false

      this.setPageClassToBody('tokens-editor-page')
      this.updateCurrentPage = 'tokens-editor-page'

      this.renderTokensEditor++
    },

    showInitialScreen () {
      this.shownOptionsBlock = false
      this.showSourceTextEditorBlock = false
      this.showAlignmentGroupsEditorBlock = false
      this.showTokensEditorBlock = false
      this.showInitialScreenBlock = true

      this.setPageClassToBody('initial-page')
      this.updateCurrentPage = 'initial-page'
    },

    setPageClassToBody (currentPageClass) {
      this.pageClasses.forEach(pageClass => {
        document.body.classList.remove(`alpheios-${pageClass}`)
      })

      document.body.classList.add(`alpheios-${currentPageClass}`)
    },
    /**
     * Clear and start alignment over
     */

    startOver (alignment) {
      /*
      this.$alignedGC.alignment = null
      this.$textC.alignment = null
      this.$historyC.alignment = null
      this.$tokensEC.alignment = null
      */

      if (alignment instanceof Alignment) {
        this.$textC.alignment = alignment
        this.$alignedGC.alignment = alignment
      } else {
        this.$textC.startOver()
        this.$alignedGC.startOver()
      }
      this.$historyC.startOver(this.$textC.alignment)
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