<template>
  <div id="alpheios-alignment-app-container" class="alpheios-alignment-app-container">
      <main-menu 
        @download-data = "downloadData"
        @upload-data = "uploadData"
        @align-texts = "alignTexts"
        @redo-action = "redoAction"
        @undo-action = "undoAction"
        @add-target = "addTarget"
        :css-update = "cssUpdate"
      />
      <text-editor 
        :origin-updated = "originTextUpdated"
        :target-updated = "targetTextUpdated"
        :hide-editor = "hideTextEditor"
        @css-update-menu = "cssUpdateM"
      />
      <align-editor 
        :show-editor = "showAlignEditor"
        :css-update = "cssUpdate"
        @css-update-menu = "cssUpdateM"
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
      originTextUpdated: 0,
      targetTextUpdated: 0,
      originAlignedUpdated: 0,
      targetAlignedUpdated: 0,
      hideTextEditor: 0,
      showAlignEditor: 0,
      cssUpdate: 1
    }
  },
  computed: {
  },
  methods: {
    /**
     * Updates property to reupload origin text in textEditor component
     */
    updateOriginTextEditor () {
      this.originTextUpdated = this.originTextUpdated + 1
    },

    /**
     * Updates property to reupload target text in textEditor component
     */
    updateTargetTextEditor () {
      this.targetTextUpdated = this.targetTextUpdated + 1
    },

    /**
     *  Updates property to hide TextEditor
     */
    hideTextEditorM () {
      this.hideTextEditor = this.hideTextEditor + 1
    },

    /**
     *  Updates property to show AlignEditor
     */
    showAlignEditorM () {
      this.showAlignEditor = this.showAlignEditor + 1
    },

    /**
     *  Updates property to show AlignEditor
     */
    cssUpdateM () {
      this.cssUpdate = this.cssUpdate + 1
    },

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
      this.updateOriginTextEditor()
      this.updateTargetTextEditor()
      this.cssUpdateM()
    },
    /**
     * Starts redo action
     */
    redoAction () {
      this.$historyC.redo()
      this.cssUpdateM()
    },
    /**
     * Starts undo action
     */
    undoAction () {
      this.$historyC.undo()
      this.cssUpdateM()
    },
    /**
     * Starts align workflow
     */
    alignTexts () {
      if (this.$alignedC.createAlignedTexts(this.$textC.alignment)) {
        this.hideTextEditorM()
        this.showAlignEditorM()    
      }
    },
    /**
     * Add aditional block for defining another target text
     */
    addTarget () {
      console.info('addTarget')
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