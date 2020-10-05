<template>
  <div id="alpheios-alignment-app-container" class="alpheios-alignment-app-container">
      <main-menu 
        @download-data = "downloadData"
        @upload-data = "uploadData"
        @align-texts = "alignTexts"
        @redo-action = "redoAction"
        @undo-action = "undoAction"
        @add-target = "addTarget"
      />
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
import TextEditor from '@/vue/text-editor/text-editor.vue'
import AlignEditor from '@/vue/align-editor/align-editor.vue'

export default {
  name: 'App',
  components: {
    mainMenu: MainMenu,
    textEditor: TextEditor,
    alignEditor: AlignEditor
  },
  data () {
    return {
      hideTextEditor: 0,
      showAlignEditor: 1
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
    alignTexts () {
      if (this.$alignedC.createAlignedTexts(this.$textC.alignment)) {
        this.hideTextEditor = this.hideTextEditor + 1
        this.showAlignEditor = this.showAlignEditor + 1  
      }
    },
    /**
     * Add aditional block for defining another target text
     */
    addTarget () {
      this.$textC.updateTargetDocSource()
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