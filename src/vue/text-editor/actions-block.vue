<template>
    <div class="alpheios-alignment-actions">
      <div class="alpheios-alignment-actions__buttons">
        <button class="alpheios-editor-button-tertiary alpheios-actions-button alpheios-actions-download" 
            @click="downloadSingle" :disabled="!docSourceEditAvailable" >
            {{ l10n.getMsgS('ACTIONS_DOWNLOAD_TITLE') }}
        </button>
        <button class="alpheios-editor-button-tertiary alpheios-actions-button alpheios-actions-upload" 
            @click="uploadTexts" :disabled="!docSourceEditAvailable" >
            {{ l10n.getMsgS('ACTIONS_UPLOAD_TITLE') }}
        </button>
        <button class="alpheios-editor-button-tertiary alpheios-actions-button alpheios-actions-metadata" 
            @click="toggleMetadata" :disabled = "!metadataAvailable">
            {{ toggleMetadataTitle }}
        </button>
      </div>
      <div class="alpheios-alignment-actions__upload-block" v-show="showUploadBlock && docSourceEditAvailable" >
        <input type="file" @change="loadTextFromFile" ref="fileupload">
      </div>
    </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'ActionsBlock',
  props: {
    textType: {
      type: String,
      required: true
    },
    textId: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      showUploadBlock: false,
      shownMetadataBlock: false
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    docSourceEditAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && !this.$textC.sourceTextIsAlreadyTokenized(this.textType, this.textId)
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
      const reader = new FileReader()

      reader.onload = e => {
        this.$emit('upload-single', e.target.result)
        this.showUploadBlock = false
      }
      reader.readAsText(file)

      this.$refs.fileupload.value = ''
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-actions__buttons,
  .alpheios-alignment-actions__upload-block {
    padding: 5px 0 15px;
    text-align: left;
  }
</style>