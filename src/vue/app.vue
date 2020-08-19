<template>
  <div id="alpheios-alignment-app-container" class="alpheios-alignment-app-container">
      <main-menu 
        @download-data = "downloadData"
        @upload-data = "uploadData"
        @align-texts = "alignTexts"
      />
      <text-editor 
        :origin-updated = "originTextUpdated"
        :target-updated = "targetTextUpdated"
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
      originTextUpdated: 0,
      targetTextUpdated: 0,
      originAlignedUpdated: 0,
      targetAlignedUpdated: 0,
      hideTextEditor: 0,
      showAlignEditor: 0
    }
  },
  computed: {
  },
  methods: {
    updateOriginTextEditor () {
      this.originTextUpdated = this.originTextUpdated + 1
    },

    updateTargetTextEditor () {
      this.targetTextUpdated = this.targetTextUpdated + 1
    },

    hideTextEditorM () {
      this.hideTextEditor = this.hideTextEditor + 1
    },

    showAlignEditorM () {
      this.showAlignEditor = this.showAlignEditor + 1
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
      this.$alignedC.createAlignedTexts(this.$textC.alignment)
      this.hideTextEditorM()
      this.showAlignEditorM()    
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