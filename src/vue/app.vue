<template>
  <div id="alpheios-alignment-app-container" class="alpheios-alignment-app-container">
      <main-menu 
        @download-data = "downloadData"
        @upload-data = "uploadData"
        @align-texts = "alignTexts"
        @redo-action = "redoAction"
        @undo-action = "undoAction"
        @add-target = "addTarget"
        @toggle-options = "toggleOptions"
        :shownOptionsBlock = "shownOptionsBlock"
      />
      <notification-bar />
      <options-block v-show="shownOptionsBlock" />
      <text-editor 
        :hide-editor = "hideTextEditor"
      />
      <align-editor 
        :show-editor = "showAlignEditor"
      />
  </div>
</template>
<script>
import MainMenu from '@/vue/main-menu.vue'
import NotificationBar from '@/vue/notification-bar.vue'
import TextEditor from '@/vue/text-editor/text-editor.vue'
import AlignEditor from '@/vue/align-editor/align-editor.vue'

import OptionsBlock from '@/vue/options/options-block.vue'

export default {
  name: 'App',
  components: {
    mainMenu: MainMenu,
    textEditor: TextEditor,
    alignEditor: AlignEditor,
    notificationBar: NotificationBar,
    optionsBlock: OptionsBlock
  },
  data () {
    return {
      hideTextEditor: 1,
      showAlignEditor: 1,
      shownOptionsBlock: false
    }
  },
  computed: {
    alignEditorAvailable () {
      return this.$store.state.alignmentUpdated && this.$alignedC.alignmentGroupsWorkflowStarted
    }
  },
  methods: {
    /**
     * Starts download workflow
     */
    downloadData () {
      this.$textC.downloadData()
    },

    /**
    * Starts upload workflow
    */
    uploadData (fileData) {
      this.$textC.uploadDocSourceFromFile(fileData)
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
      const result = await this.$alignedC.createAlignedTexts(this.$textC.alignment)
      if (result) {
        this.hideTextEditor = this.hideTextEditor + 1
        this.showAlignEditor = this.showAlignEditor + 1  
      }
    },
    /**
     * Add aditional block for defining another target text
     */
    addTarget () {
      this.$textC.updateTargetDocSource()
    },
    /**
     * Show options block
     */
    toggleOptions () {
      this.shownOptionsBlock = !this.shownOptionsBlock
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