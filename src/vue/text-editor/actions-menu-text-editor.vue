<template>
    <div class="alpheios-alignment-editor-actions-menu">
      <div class="alpheios-alignment-editor-actions-menu__buttons">
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__clear_text"
            @click="clearText" v-show="showClearText" :disabled="!docSourceEditAvailable">
            {{ l10n.getMsgS('ACTIONS_CLEAR_TEXT_TITLE') }}
        </button>
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__metadata"
            @click="toggleMetadata" :disabled = "!metadataAvailable">
            {{ toggleMetadataTitle }}
        </button>
      </div>
    </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'ActionsMenuTextEditor',
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
    showClearTextFlag: {
      type: Number,
      required: false,
      default: 1
    }
  },
  data () {
    return {
      shownMetadataBlock: false,
      showClearText: false
    }
  },
  watch: {
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
    toggleMetadata () {
      this.shownMetadataBlock = !this.shownMetadataBlock
      this.$emit('toggle-metadata')
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
    padding: 5px 0 0;
    text-align: left;
  }
</style>