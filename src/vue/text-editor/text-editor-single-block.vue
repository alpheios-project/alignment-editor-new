<template>
  <div class="alpheios-alignment-editor-text-blocks-single" v-show="dataUpdated" :id="containerId">
      <p class="alpheios-alignment-editor-text-blocks-single__title">{{ indexData }}{{ textBlockTitle }}
        <span :id="removeId" class="alpheios-alignment-editor-text-blocks-single__remove" v-show="showDeleteIcon" @click="deleteText">
          <delete-icon />
        </span>
      </p>
      <actions-menu :text-type = "textType" :text-id = "textId" @upload-single="uploadSingle" @toggle-metadata="toggleMetadata"/>
      
      <metadata-block :text-type = "textType" :text-id = "textId" v-show="showMetadata" />

      <direction-options-block 
        @updateText = "updateText" :localOptions = "localTextEditorOptions" :disabled="!docSourceEditAvailable" 
      />
      <textarea :id="textareaId" v-model="text" :dir="direction" tabindex="2" :lang="language" @blur="updateText" 
                 :disabled="!docSourceEditAvailable" >
      ></textarea>

      <language-options-block :textType = "textType"
        @updateText = "updateText" :localOptions = "localTextEditorOptions" :disabled="!docSourceEditAvailable" 
      />

      <tokenize-options-block :localOptions = "localTextEditorOptions" v-if="$settingsC.hasTokenizerOptions"
        @updateText = "updateText" :disabled="!docSourceEditAvailable"
      />

  </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import DeleteIcon from '@/inline-icons/delete.svg'

import TokenizeController from '@/lib/controllers/tokenize-controller.js'

import OptionItemBlock from '@/vue/options/option-item-block.vue'

import ActionsMenu from '@/vue/text-editor/actions-menu-text-editor.vue'
import MetadataBlock from '@/vue/text-editor/metadata-block.vue'

import TokenizeOptionsBlock from '@/vue/text-editor/tokenize-options-block.vue'
import DirectionOptionsBlock from '@/vue/text-editor/direction-options-block.vue'
import LanguageOptionsBlock from '@/vue/text-editor/language-options-block.vue'

export default {
  name: 'TextEditorSingleBlock',
  props: {
    textType: {
      type: String,
      required: true
    },
    textId: {
      type: String,
      required: false
    },
    index: {
      type: Number,
      required: false,
      default: 0
    }
  },
  components: {
    deleteIcon: DeleteIcon,
    optionItemBlock: OptionItemBlock,
    actionsMenu: ActionsMenu,
    metadataBlock: MetadataBlock,
    tokenizeOptionsBlock: TokenizeOptionsBlock,
    directionOptionsBlock: DirectionOptionsBlock,
    languageOptionsBlock: LanguageOptionsBlock
  },
  data () {
    return {
      text: null,
      prevText: null,

      localTextEditorOptions: { ready: false },
      showMetadata: false
    }
  },
  /**
   * Clone options (sourceText and tokenize options) for the cuurent instance of a sourceText
   */
  async mounted () {
    if (!this.localTextEditorOptions.ready && this.$settingsC.tokenizerOptionsLoaded) {
      await this.prepareDefaultTextEditorOptions()
    }
    this.updateFromExternal()
  },
  watch: {
    async '$store.state.optionsUpdated' () {
      if (!this.localTextEditorOptions.ready && this.$settingsC.tokenizerOptionsLoaded) {
        await this.prepareDefaultTextEditorOptions()
      }
    },
    '$store.state.uploadCheck' () {
      this.updateFromExternal()
    },
    async '$store.state.alignmentRestarted' () {
      await this.restartTextEditor()
    },
    async '$store.state.resetOptions' () {
      await this.$settingsC.resetLocalTextEditorOptions(this.localTextEditorOptions)
      this.updateText()
    }
  },
  computed: {
    /**
     * Used for css id definition
     */
    formattedTextId () {
      return this.textId ?? 'no-id'
    },

    /**
     * It is executed after each alignment update, 
     * checks if  localOptions is not yet uploaded
     */
    async dataUpdated () {
      if (!this.localTextEditorOptions.ready && this.$settingsC.tokenizerOptionsLoaded) {
        await this.prepareDefaultTextEditorOptions()
      }
      return this.$store.state.alignmentUpdated
    },
    containerId () {
      return `alpheios-alignment-editor-text-blocks-single__${this.textType}_${this.formattedTextId}`
    },
    /**
     * Defines unique id for textArea for tracking changes
     */
    textareaId () {
      return `alpheios-alignment-editor-text-blocks-single__textarea_${this.textType}_${this.formattedTextId}`
    },
    removeId () {
      return `alpheios-alignment-editor-text-blocks-single__remove_${this.textType}_${this.formattedTextId}`
    },
    /**
     * Formats textType
     */
    textTypeFormatted () {
      return this.textType.charAt(0).toUpperCase() + this.textType.slice(1)
    },
    /**
     * Defines Title for the text block
     */
    textBlockTitle () {
      return this.l10n.getMsgS('TEXT_EDITOR_TEXT_BLOCK_TITLE', { textType: this.textTypeFormatted })
    }, 

    l10n () {
      return L10nSingleton
    },

    /**
     * Defines if we have multiple targets then we need to show index of target text
     */
    showIndex () {
      return (this.textType === 'target') && this.$store.state.alignmentUpdated && this.$textC.allTargetTextsIds.length > 1 
    },
    
    /**
     * Defines formatted order index for multiple target texts
     */
    indexData () {
      return this.showIndex ? `${this.index + 1}. ` : ''
    },

    /**
     * Defines if we have multiple target texts then show delete index
     */
    showDeleteIcon () {
      return this.showIndex
    },
    /**
     * Blocks changes if aligned version is already created and aligned groups are started
     */
    docSourceEditAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && !this.$textC.sourceTextIsAlreadyTokenized(this.textType, this.textId)
    },
    updateTextMethod () {
      return this.textType === 'origin' ? 'updateOriginDocSource' : 'updateTargetDocSource'
    },
    direction () {
      return this.$store.state.optionsUpdated && this.$store.state.alignmentUpdated && this.localTextEditorOptions.ready && this.localTextEditorOptions.sourceText.items.direction.currentValue
    },
    language () {
      return this.$store.state.optionsUpdated && this.$store.state.alignmentUpdated && this.localTextEditorOptions.ready && this.localTextEditorOptions.sourceText.items.language.currentValue
    },
    sourceType () {
      return this.$store.state.optionsUpdated && this.$store.state.alignmentUpdated && this.localTextEditorOptions.ready && this.localTextEditorOptions.sourceText.items.sourceType.currentValue
    },
    tokenization () {
      return TokenizeController.defineTextTokenizationOptions(this.$settingsC.tokenizerOptionValue, this.localTextEditorOptions[this.sourceType])
    }
  },
  methods: {
    /**
     * Updates sourceText properties from textController
     */
    updateFromExternal () {
      const sourceTextData = this.$textC.getDocSource(this.textType, this.textId)

      if (sourceTextData) {
        this.text = sourceTextData.text
        this.$settingsC.updateLocalTextEditorOptions(this.localTextEditorOptions, sourceTextData)
        this.updateText()
      }
    },

    /**
     * Clears text and reloads local options
     */
    async restartTextEditor () {
        this.text = ''
        await this.prepareDefaultTextEditorOptions()
    },

    /**
     * Emits update-text event with data from properties
     */
    updateText () {
      if (this.text) {
        const params = {
          text: this.text,
          direction: this.direction,
          lang: this.language,
          id: this.textId,
          sourceType: this.sourceType,
          tokenization: this.tokenization
        }

        this.$textC[this.updateTextMethod](params, this.textId)  
      }
    },
    deleteText () {
      this.$textC.deleteText(this.textType, this.textId)
    },

    /**
     * Reloads local options
     */
    async prepareDefaultTextEditorOptions () {
      this.localTextEditorOptions = await this.$settingsC.cloneTextEditorOptions(this.textType, this.index)
      this.localTextEditorOptions.ready = true

      this.updateText()
    },

    /**
     * Uploads a single instance of text
     */
    uploadSingle (fileData) {
      this.$textC.uploadDocSourceFromFileSingle(fileData, {
        textType: this.textType,
        textId: this.textId,
        tokenization: this.tokenization
      })
    },

    toggleMetadata () {
      this.showMetadata = !this.showMetadata
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-text-blocks-single {
        textarea {
            width:100%;
            min-height: 300px;
            font-size: inherit;
        }

        p {
            margin-bottom: 10px;
        }
    }

    .alpheios-alignment-editor-text-blocks-single__title {
      position: relative;
    }
    .alpheios-alignment-editor-text-blocks-single__remove {
      display: inline-block;
      width: 25px;
      height: 25px;
      right: 0;
      top: 50%;
      top: 0;

      position: absolute;

      cursor: pointer;
      svg {
        display: inline-block;
        width: 100%;
        height: 100%;
      }
    }

    .alpheios-alignment-editor-options-fieldset {
      padding: 10px;
      border: 2px groove #f8f8f8;
      margin-bottom: 30px;

      legend {
        display: block;
        padding: 0 10px;
        margin-bottom: 10px;
        line-height: inherit;
        color: inherit;
        white-space: normal;
        font-size: 110%;
      }
    }

    .alpheios-alignment-editor-options-fieldset-slim {
      padding: 0;
      margin-bottom: 0;
      border: 0;

      legend {
        display: none;
      }
    }

    .alpheios-alignment-editor-options-fieldset-label-auto {
      .alpheios-alignment-option-item__label {
        width: auto;
        margin-right: 20px;
      }
      input.alpheios-alignment-input, 
      .alpheios-alignment-select, 
      .alpheios-alignment-radio-block {
        width: auto;
      }
    }
</style>
