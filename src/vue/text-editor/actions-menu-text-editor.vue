<template>
    <div class="alpheios-alignment-editor-actions-menu">
      <div class="alpheios-alignment-editor-actions-menu__buttons">
        <!--
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button"  id="alpheios-actions-menu-button__download"
            @click="downloadSingle" :disabled="!downloadAvailable" >
            {{ l10n.getMsgS('ACTIONS_DOWNLOAD_TITLE') }}
        </button>
        -->
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__upload"
            @click="uploadTexts" :disabled="!docSourceEditAvailable" v-show="!onlyMetadata">
            {{ l10n.getMsgS('ACTIONS_UPLOAD_TITLE') }}
        </button>
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__clear_text"
            @click="clearText" v-show="showClearText">
            {{ l10n.getMsgS('ACTIONS_CLEAR_TEXT_TITLE') }}
        </button>
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__metadata"
            @click="toggleMetadata" :disabled = "!metadataAvailable">
            {{ toggleMetadataTitle }}
        </button>
      </div>
      <div class="alpheios-alignment-editor-actions-menu__upload-block" v-show="showUploadBlock && docSourceEditAvailable" >
          <input type="file" @change="loadTextFromFile" ref="fileupload">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__metadata"
              @click="showModal = true">
              DTSAPI
          </button>
      </div>
      <upload-dtsapi-block :showModal="showModal" @closeModal = "showModal = false" @uploadFromDTSAPI = "uploadFromDTSAPI"/>
    </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import UploadDTSAPIBlock from '@/vue/text-editor/upload-dtsapi-block.vue'

export default {
  name: 'ActionsMenuTextEditor',
  components: {
    uploadDtsapiBlock: UploadDTSAPIBlock
  },
  props: {
    textType: {
      type: String,
      required: true
    },
    textId: {
      type: String,
      required: false
    },
    onlyMetadata: {
      type: Boolean,
      required: false,
      default: false
    },
    showUploadBlockFlag: {
      type: Number,
      required: false,
      default: 1
    },
    showClearTextFlag: {
      type: Number,
      required: false,
      default: 1
    }
  },
  data () {
    return {
      showUploadBlock: false,
      shownMetadataBlock: false,
      showModal: false,
      showClearText: false
    }
  },
  watch: {
    '$store.state.alignmentRestarted' () {
      this.$refs.fileupload.value = ''
    },
    'showUploadBlockFlag' () {
      this.uploadTexts()
    },
    'showClearTextFlag' () {
      this.showClearText = true
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    docSourceEditAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && !this.$textC.sourceTextIsAlreadyTokenized(this.textType, this.textId)
    },
    downloadAvailable () {
      const docSource = this.$textC.getDocSource(this.textType, this.textId)
      return Boolean(this.$store.state.alignmentUpdated) && Boolean(docSource) && (docSource.text)
    },
    metadataAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && Boolean(this.$textC.getDocSource(this.textType, this.textId))
    },
    toggleMetadataTitle () {
      return this.shownMetadataBlock ? this.l10n.getMsgS('ACTIONS_METADATA_HIDE_TITLE') : this.l10n.getMsgS('ACTIONS_METADATA_SHOW_TITLE')
    }
  },
  methods: {
    downloadSingle () {
      this.$textC.downloadSingleSourceText(this.textType, this.textId)
    },
    /**
     * Shows/Hides block with choose file input
     */
    uploadTexts () {
      this.showUploadBlock = !this.showUploadBlock
    },

    toggleMetadata () {
      this.shownMetadataBlock = !this.shownMetadataBlock
      this.$emit('toggle-metadata')
    },

    /**
     * Creates FileReader and passes data from file to App component for parsing
     */
    loadTextFromFile(ev) {
      const file = ev.target.files[0]     
      if (!file) { return }
      const extension = file.name.split('.').pop()

      if (!this.$textC.checkUploadedFileByExtension(extension, false)) { return }

      const reader = new FileReader()

      reader.onload = e => {
        this.$emit('upload-single', { text: e.target.result, extension })
        this.showUploadBlock = false
      }
      reader.readAsText(file)

      this.$refs.fileupload.value = ''
    },

    uploadFromDTSAPI (filedata) {
      this.$emit('upload-single', { text: filedata.tei, lang: filedata.lang, extension: filedata.extension })
      this.showUploadBlock = false
    },

    clearText () {
      this.$emit('clear-text')
      this.showClearText = false
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-actions-menu__buttons,
  .alpheios-alignment-editor-actions-menu__upload-block {
    padding: 5px 0 15px;
    text-align: left;
  }
</style>