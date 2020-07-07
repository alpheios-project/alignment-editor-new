<template>
  <div id="alpheios-alignment-app-container" class="alpheios-alignment-app-container">
      <main-menu 
        @download-data = "downloadData"
        @upload-data = "uploadData"
        @align-texts = "alignTexts"
      />
      <text-editor 
        @update-source-text = "updateSourceText" 
        @update-translation-text = "updateTranslationText"
        :updated-data = "updatedData"
        :hide-editor = "hideTextEditor"
      />
      <align-editor 
        :source-text = "sourceTextForAlign" 
        :translation-text = "translationTextForAlign" 
        :show-editor = "showAlignEditor"
      />
  </div>
</template>
<script>
import MainMenu from '@/vue/main-menu.vue'
import TextEditor from '@/vue/text-editor/text-editor.vue'
import AlignEditor from '@/vue/align-editor/align-editor.vue'

import Download from '@/lib/download.js'

export default {
  name: 'App',
  components: {
    mainMenu: MainMenu,
    textEditor: TextEditor,
    alignEditor: AlignEditor
  },
  data () {
    return {
      sourceText: {},
      translationText: {},
      updatedData: null,
      hideTextEditor: 0,
      showAlignEditor: 0,
      sourceTextForAlign: {},
      translationTextForAlign: {}
    }
  },
  methods: {
    updateSourceText (text) {
      this.sourceText = text
    },

    updateTranslationText (text) {
      this.translationText = text
    },

    downloadData () {
      const fields = [ this.sourceText.text, this.sourceText.direction, this.sourceText.lang, 
                this.translationText.text, this.translationText.direction, this.translationText.lang 
              ]

      const fileName = `alignment-${this.sourceText.lang}-${this.translationText.lang}`
      Download.downloadFileOneColumn(fields, fileName)
    },

    uploadData (data) {
      data = data.split(/\n/)

      const formattedData = {
        source: {
          text: data[0].replace(/\t/g, '\u000D'),
          dir: data[1],
          lang: data[2]
        },
        translation: {
          text: data[3].replace(/\t/g, '\u000D'),
          dir: data[4],
          lang: data[5]
        }
      }
      this.updatedData = formattedData
      this.sourceText = formattedData.source
      this.translationText = formattedData.translation
    },

    alignTexts () {
      this.sourceTextForAlign = this.sourceText

      this.translationTextForAlign = this.translationText

      this.hideTextEditor = this.hideTextEditor + 1
      this.showAlignEditor = this.showAlignEditor + 1      
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