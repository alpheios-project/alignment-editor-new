<template>
  <div id="alpheios-alignment-editor-app-container" class="alpheios-alignment-editor-app-container">
      <main-menu 
        @download-data = "downloadData"
        @upload-data = "uploadData"
        @align-texts = "alignTexts"
        @redo-action = "redoAction"
        @undo-action = "undoAction"
        @add-target = "addTarget"
        @toggle-options = "toggleOptions"
        @clear-all = "startOver"
        :shownOptionsBlock = "shownOptionsBlock"
      />
      <notification-bar />
      <options-block v-show="shownOptionsBlock" />
      <text-editor 
        :hide-editor = "hideTextEditor"
        :show-editor = "showTextEditor"
      />
      <align-editor 
        :show-editor = "showAlignEditor"
      />
      <tokens-editor 
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

export default {
  name: 'App',
  components: {
    mainMenu: MainMenu,
    textEditor: TextEditor,
    alignEditor: AlignEditor,
    tokensEditor: TokensEditor,
    notificationBar: NotificationBar,
    optionsBlock: OptionsBlock
  },
  data () {
    return {
      hideTextEditor: 1,
      showTextEditor: 1,
      showAlignEditor: 1,
      shownOptionsBlock: false
    }
  },
  computed: {
    alignEditorAvailable () {
      return this.$store.state.alignmentUpdated && this.$alignedGC.alignmentGroupsWorkflowStarted
    }
  },
  methods: {
    /**
     * Starts download workflow
     */
    downloadData (downloadType) {
      this.$textC.downloadData(downloadType)
    },

    /**
    * Starts upload workflow
    */
    uploadData (fileData, uploadType) {
      const alignment = this.$textC.uploadData(fileData, this.$settingsC.tokenizerOptionValue, uploadType)

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
      const result = await this.$alignedGC.createAlignedTexts(this.$textC.alignment)
      if (result) {
        this.hideTextEditor++
        this.showAlignEditor++
      }
    },
    /**
     * Add aditional block for defining another target text
     */
    addTarget () {
      this.$textC.updateTargetDocSource()
      this.showTextEditor++
    },
    /**
     * Show options block
     */
    toggleOptions () {
      this.shownOptionsBlock = !this.shownOptionsBlock
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

      this.showTextEditor++

      if (alignment instanceof Alignment) {
        this.showAlignEditor++
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
</style> 