<template>
  <div id="alpheios-alignment-app-container" class="alpheios-alignment-app-container">
      <main-menu 
        @download-data = "downloadData"
        @upload-data = "uploadData"
        @align-texts = "alignTexts"
      />
      <text-editor 
        @update-origin-text = "updateOriginText" 
        @update-target-text = "updateTargetText"
        :origin-text = "originText"
        :origin-text-updated = "originTextUpdated"
        :target-text = "targetText"
        :target-text-updated = "targetTextUpdated"
        :hide-editor = "hideTextEditor"
      />
      <align-editor 
        :origin-text = "originAlignedText" 
        :target-text = "targetAlignedText" 
        :show-editor = "showAlignEditor"
        @start-new-alignment-group = "startNewAlignmentGroup"
        @add-to-alignment-group = "addToAlignmentGroup"
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
      showAlignEditor: 0
    }
  },
  computed: {
    originText () {
      return this.originTextUpdated ? this.$textC.originDocSource : {}
    },
    targetText () {
      return this.targetTextUpdated ? this.$textC.targetDocSource : {}
    },
    originAlignedText () {
      return this.originAlignedUpdated ? this.$textC.originAlignedText : {}
    },
    targetAlignedText () {
      return this.targetAlignedUpdated ? this.$textC.targetAlignedText : {}
    }
  },
  methods: {
    updateOriginTextEditor () {
      this.originTextUpdated = this.originTextUpdated + 1
    },

    updateTargetTextEditor () {
      this.targetTextUpdated = this.targetTextUpdated + 1
    },

    updateOriginAlignedEditor () {
      this.originAlignedUpdated = this.originAlignedUpdated + 1
    },

    updateTargetAlignedEditor () {
      this.targetAlignedUpdated = this.targetAlignedUpdated + 1
    },

    hideTextEditorM () {
      this.hideTextEditor = this.hideTextEditor + 1
    },

    showAlignEditorM () {
      this.showAlignEditor = this.showAlignEditor + 1
    },

    updateOriginText (text) {
      this.$textC.updateOriginSourceText(text)
      this.updateOriginTextEditor()
    },

    updateTargetText (text) {
      this.$textC.updateTargetDocSource(text)
      this.updateTargetTextEditor()
    },

    downloadData () {
      this.$textC.downloadData()
    },

    uploadData (fileData) {
      this.$textC.uploadDocSourceFromFile(fileData)
      this.updateOriginTextEditor()
      this.updateTargetTextEditor()
    },

    alignTexts () {
      this.$textC.createAlignedTexts()
      this.updateOriginAlignedEditor()
      this.updateTargetAlignedEditor()
      this.hideTextEditorM()
      this.showAlignEditorM()    
    },

    startNewAlignmentGroup (token) {
      this.$textC.startNewAlignmentGroup(token)
    },

    addToAlignmentGroup (token) {
      this.$textC.addToAlignmentGroup(token)
    },

    finishCurrentAlignmentGroup () {
      this.$textC.finishCurrentAlignmentGroup()
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