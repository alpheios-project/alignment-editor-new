<template>
  <div id="alpheios-alignment-editor-app-container" class="alpheios-alignment-editor-app-container">
      <span class="alpheios-alignment-app-menu-open-icon" @click = "menuShow++">
        <navbar-icon />
      </span>
      <main-menu 
        @download-data = "downloadData"
        @upload-data = "uploadData"
        @align-texts = "alignTexts"
        @redo-action = "redoAction"
        @undo-action = "undoAction"
        @add-target = "addTarget"
        @clear-all = "startOver"

        @showOptions = "showOptions"
        @showSourceTextEditor = "showSourceTextEditor"
        @showAlignmentGroupsEditor = "showAlignmentGroupsEditor"
        @showTokensEditor = "showTokensEditor"

        :menuShow = "menuShow"
      />
      <notification-bar />
      <options-block v-show="shownOptionsBlock" />
      <text-editor v-show="showSourceTextEditorBlock"
      />
      <align-editor v-show="showAlignmentGroupsEditorBlock"
      />
      <tokens-editor v-show="showTokensEditorBlock" :renderEditor = "renderTokensEditor"
      />
  </div>
</template>
<script>
import NotificationSingleton from '@/lib/notifications/notification-singleton'

import Alignment from '@/lib/data/alignment'

import MainMenu from '@/vue/main-menu.vue'
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
    navbarIcon: NavbarIcon
  },
  data () {
    return {     
      shownOptionsBlock: false,
      showSourceTextEditorBlock: true,
      showAlignmentGroupsEditorBlock: false,
      showTokensEditorBlock: false,

      menuShow: 1,
      renderTokensEditor: 1
    }
  },
  computed: {
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
    uploadData (fileData, extension) {
      const alignment = this.$textC.uploadData(fileData, this.$settingsC.tokenizerOptionValue, extension)

      if (alignment instanceof Alignment) {
        this.startOver(alignment)
      }
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
    /**
     * Starts align workflow
     */
    async alignTexts () {
      const result = await this.$alignedGC.createAlignedTexts(this.$textC.alignment, this.$settingsC.useSpecificEnglishTokenizer)
      if (result) {
        this.showAlignmentGroupsEditor()
      }
    },
    /**
     * Add aditional block for defining another target text
     */
    addTarget () {
      this.$textC.updateTargetDocSource()
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
    },

    showSourceTextEditor () {
      this.shownOptionsBlock = false
      this.showSourceTextEditorBlock = true
      this.showAlignmentGroupsEditorBlock = false
      this.showTokensEditorBlock = false
    },

    showAlignmentGroupsEditor () {
      this.shownOptionsBlock = false
      this.showSourceTextEditorBlock = false
      this.showAlignmentGroupsEditorBlock = true
      this.showTokensEditorBlock = false
    },

    showTokensEditor () {
      this.shownOptionsBlock = false
      this.showSourceTextEditorBlock = false
      this.showAlignmentGroupsEditorBlock = false
      this.showTokensEditorBlock = true

      this.renderTokensEditor++
    },

    /**
     * Clear and start alignment over
     */

    startOver (alignment) {
      this.$alignedGC.alignment = null
      this.$textC.alignment = null
      this.$historyC.alignment = null
      this.$tokensEC.alignment = null

      if (alignment instanceof Alignment) {
        this.$textC.alignment = alignment
        this.$alignedGC.alignment = alignment
      } else {
        this.$textC.createAlignment()
      }
      
      this.$historyC.startTracking(this.$textC.alignment)
      this.$tokensEC.loadAlignment(this.$textC.alignment)
      
      NotificationSingleton.clearNotifications()
      if (alignment instanceof Alignment) {
        this.$textC.store.commit('incrementUploadCheck')
      } else {
        this.$textC.store.commit('incrementAlignmentRestarted')
      }
      this.$textC.store.commit('incrementAlignmentUpdated')

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