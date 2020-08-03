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
        :updated-data = "updatedData"
        :hide-editor = "hideTextEditor"
      />
      <align-editor 
        v-if="textC"
        :origin-text = "textC.originAlignedText" 
        :target-text = "textC.targetAlignedText" 
        :show-editor = "showAlignEditor"
      />
  </div>
</template>
<script>
import MainMenu from '@/vue/main-menu.vue'
import TextEditor from '@/vue/text-editor/text-editor.vue'
import AlignEditor from '@/vue/align-editor/align-editor.vue'

import Download from '@/lib/download.js'
import TextsController from '@/lib/texts-controller.js'

export default {
  name: 'App',
  components: {
    mainMenu: MainMenu,
    textEditor: TextEditor,
    alignEditor: AlignEditor
  },
  data () {
    return {
      textC: null,
      originText: {},
      targetText: {},
      updatedData: null,
      hideTextEditor: 0,
      showAlignEditor: 0
    }
  },
  methods: {
    createTextController () {
      if (!this.textC) {
        this.textC = TextsController.createAlignment(this.originText)
      }
    },
    updateOriginText (text) {
      this.originText = text
      this.createTextController()

      this.textC.updateAlignment({
        originSourceText: this.originText
      })
    },

    updateTargetText (text) {
      this.targetText = text

      this.textC.updateAlignment({
        targetSourceText: this.targetText
      })
    },

    downloadData () {
      const fields = [ this.originText.text, this.originText.direction, this.originText.lang, 
                this.targetText.text, this.targetText.direction, this.targetText.lang 
              ]

      const fileName = `alignment-${this.originText.lang}-${this.targetText.lang}`
      Download.downloadFileOneColumn(fields, fileName)
    },

    uploadData (data) {
      data = data.split(/\n/)

      const formattedData = {
        origin: {
          text: data[0].replace(/\t/g, '\u000D'),
          dir: data[1],
          lang: data[2],
          textType: 'origin'
        },
        target: {
          text: data[3].replace(/\t/g, '\u000D'),
          dir: data[4],
          lang: data[5],
          textType: 'target'
        }
      }
      this.updatedData = formattedData
      this.updateOriginText(formattedData.origin)
      this.updateTargetText(formattedData.target)
    },

    alignTexts () {
      this.textC.updateAlignment({
        originAlignedText: this.originText,
        targetAlignedText: this.targetText
      })

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