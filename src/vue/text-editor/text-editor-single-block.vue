<template>
  <div class="alpheios-alignment-editor-text-blocks-single" v-show="dataUpdated" :id="containerId">
      <p class="alpheios-alignment-editor-text-blocks-single__title">{{ indexData }}{{ textBlockTitle }}
        <span :id="removeId" class="alpheios-alignment-editor-text-blocks-single__remove" v-show="showDeleteIcon" @click="deleteText">
          <delete-icon />
        </span>
      </p>
      <div v-show="showTypeUploadButtons">
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button"  id="alpheios-actions-menu-button__typetext"
            @click="selectTypeText">
            {{ l10n.getMsgS('TEXT_SINGLE_TYPE_BUTTON') }}
        </button>
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button"  id="alpheios-actions-menu-button__uploadtext"
            @click="selectUploadText">
            {{ l10n.getMsgS('TEXT_SINGLE_UPLOAD_BUTTON') }}
        </button>
      </div>
      
      <actions-menu :text-type = "textType" :text-id = "textId" @upload-single="uploadSingle" @toggle-metadata="toggleMetadata" 
                    :onlyMetadata = "showOnlyMetadata" :showUploadBlockFlag = "showUploadBlockFlag" 
                    :showClearTextFlag = "showClearTextFlag" @clear-text="restartTextEditor"
                    v-show="showTextProps || showUploadMenu"/>      
      <metadata-block :text-type = "textType" :text-id = "textId" v-show="showMetadata" />

      <div v-show="showTypeTextBlock">
        <p class="alpheios-alignment-editor-text-blocks-info-line" 
          :class = "charactersClasses">
          <span class="alpheios-alignment-editor-text-blocks-single__characters">{{ charactersText }}</span>
          <span class="alpheios-alignment-editor-text-blocks-single__icons" v-show="isEmptyMetadata">
            <tooltip :tooltipText="l10n.getMsgS('NO_METADATA_ICON')" tooltipDirection="top">
              <no-metadata-icon />
            </tooltip>
          </span>
        </p>
        <textarea :id="textareaId" v-model="text" :dir="direction" tabindex="2" :lang="language" @blur="updateText('text')" 
                  :disabled="!docSourceEditAvailable" >
        ></textarea>
      </div>

      <direction-options-block 
        @updateText = "updateText" :localOptions = "localTextEditorOptions" :disabled="!docSourceEditAvailable"  v-show="showTextProps" 
      />

      <language-options-block :textType = "textType"
        @updateText = "updateText" @updateDirection = "updateDirection" :localOptions = "localTextEditorOptions" v-show="showTextProps"
      />

      <tokenize-options-block :localOptions = "localTextEditorOptions" v-if="$settingsC.hasTokenizerOptions" v-show="showTextProps"
        @updateText = "updateText" :disabled="!docSourceEditAvailable"
      />
  </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import DeleteIcon from '@/inline-icons/delete.svg'
import NoMetadataIcon from '@/inline-icons/no-metadata.svg'

import TokenizeController from '@/lib/controllers/tokenize-controller.js'

import OptionItemBlock from '@/vue/options/option-item-block.vue'

import ActionsMenu from '@/vue/text-editor/actions-menu-text-editor.vue'
import MetadataBlock from '@/vue/text-editor/metadata-block.vue'

import TokenizeOptionsBlock from '@/vue/text-editor/tokenize-options-block.vue'
import DirectionOptionsBlock from '@/vue/text-editor/direction-options-block.vue'
import LanguageOptionsBlock from '@/vue/text-editor/language-options-block.vue'
import Tooltip from '@/vue/common/tooltip.vue'

import Langs from '@/lib/data/langs/langs.js'

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
    },
    clearFileInput: {
      type: Number,
      required: false
    }
  },
  components: {
    deleteIcon: DeleteIcon,
    noMetadataIcon: NoMetadataIcon,
    optionItemBlock: OptionItemBlock,
    actionsMenu: ActionsMenu,
    metadataBlock: MetadataBlock,
    tokenizeOptionsBlock: TokenizeOptionsBlock,
    directionOptionsBlock: DirectionOptionsBlock,
    languageOptionsBlock: LanguageOptionsBlock,
    tooltip: Tooltip
  },
  data () {
    return {
      text: null,
      prevText: null,

      localTextEditorOptions: { ready: false },
      showMetadata: false,
      showTypeUploadButtons: true,

      showTypeTextBlock: false,
      showTextProps: false,
      showUploadMenu: false,
      showOnlyMetadata: true,
      showUploadBlockFlag: 1,
      showClearTextFlag: 1,

      updatedLocalOptionsFlag: 1
    }
  },
  /**
   * Clone options (sourceText and tokenize options) for the cuurent instance of a sourceText
   */
  async mounted () {
    if (!this.localTextEditorOptions.ready && this.$settingsC.tokenizerOptionsLoaded) {
      this.prepareDefaultTextEditorOptions()
    }
    this.initDataProps()
    await this.updateFromExternal()
  },
  watch: {
    async '$store.state.optionsUpdated' () {
      if (!this.localTextEditorOptions.ready && this.$settingsC.tokenizerOptionsLoaded) {
        this.prepareDefaultTextEditorOptions()
      }
    },
    async '$store.state.uploadCheck' () {
      await this.updateFromExternal()
    },
    '$store.state.alignmentRestarted' () {
      this.restartTextEditor()
    },
    async '$store.state.resetOptions' () {
      this.localTextEditorOptions = this.$settingsC.resetLocalTextEditorOptions(this.textType, this.textId)
      await this.updateText()
    }
  },
  computed: {

    l10n () {
      return L10nSingleton
    },
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
    dataUpdated () {
      if (!this.localTextEditorOptions.ready && this.$settingsC.tokenizerOptionsLoaded) {
        this.prepareDefaultTextEditorOptions()
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
      if (this.textType === 'origin') {
        return 'Original'
      }
      if (this.textType === 'target') {
        return 'Translation'
      }
    },
    /**
     * Defines Title for the text block
     */
    textBlockTitle () {
      return (this.textType === 'target') ? this.textTypeFormatted : this.l10n.getMsgS('TEXT_EDITOR_TEXT_BLOCK_TITLE', { textType: this.textTypeFormatted })
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
      return (this.showIndex || (this.text && (this.text.length > 0))) && !this.$textC.sourceTextIsAlreadyTokenized(this.textType, this.textId)
    },
    /**
     * Blocks changes if aligned version is already created and aligned groups are started
     */
    docSourceEditAvailable () {
      return Boolean(this.$store.state.alignmentUpdated) && 
             !this.$textC.sourceTextIsAlreadyTokenized(this.textType, this.textId)
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
    },
    charactersClasses () {
      return {
        'alpheios-alignment-editor-hidden' : this.textCharactersAmount === 0,
        'alpheios-alignment-editor-red' : this.textCharactersAmount > this.maxCharactersForTheText
      }
    },
    textCharactersAmount () {
      return this.text ? this.text.length : 0
    },
    maxCharactersForTheText () {
      return this.$store.state.optionsUpdated && this.$settingsC.maxCharactersPerTextValue
    },
    charactersText () {
      return `Characters count - ${this.textCharactersAmount} (max - ${this.maxCharactersForTheText})`
    },

    updatedLocalOptions () {
      return this.updatedLocalOptionsFlag && this.localTextEditorOptions
    },
    isEmptyMetadata () {
      return this.$store.state.alignmentUpdated && this.docSource && this.docSource.hasEmptyMetadata
    }
  },
  methods: {
    initDataProps () {
      this.showMetadata = false
      this.showTypeUploadButtons = true

      this.showTypeTextBlock = false
      this.showTextProps = false
      this.showUploadMenu = false
      this.showOnlyMetadata = true
    },

    /**
     * Updates sourceText properties from textController
     */
    async updateFromExternal () {
      const sourceTextData = this.$textC.getDocSource(this.textType, this.textId)
      if (sourceTextData && sourceTextData.text) {
        this.text = sourceTextData.text
        this.$settingsC.updateLocalTextEditorOptions(this.localTextEditorOptions, sourceTextData)
        await this.updateText()

        this.showTypeUploadButtons = false
        this.showTypeTextBlock = true
        this.showOnlyMetadata = true
      }
    },

    /**
     * Clears text and reloads local options
     */
    async restartTextEditor () {
      this.text = ''
      this.prepareDefaultTextEditorOptions()
      await this.updateText()

      this.showTypeUploadButtons = true
      this.showTypeTextBlock = false
      this.showTextProps = false
      this.showUploadMenu = false
      this.showOnlyMetadata = true
      this.$textC.deleteText(this.textType, this.textId)
    },

    /**
     * Emits update-text event with data from properties
     */
    async updateText (updatePlace) {
      if ((updatePlace === 'text') || (this.text)) {
        const params = {
          text: this.text,
          direction: this.direction,
          lang: this.language,
          id: this.textId,
          sourceType: this.sourceType,
          tokenization: this.tokenization
        }

        if (this.text && (this.text.length === 0) && this.textId) {
          this.$textC.removeDetectedFlag(this.textType, this.textId)
        }

        await this.$textC[this.updateTextMethod](params, this.textId)  

        if (this.$textC.checkDetectedProps(this.textType, this.textId) || (this.text && this.text.length > 0)) {
          this.showTextProps = true
          this.showClearTextFlag++ 
        }
      }
    },

    updateDirection () {
      this.localTextEditorOptions.sourceText.items.direction.currentValue = Langs.defineDirection(this.localTextEditorOptions.sourceText.items.language.currentValue)
      this.$store.commit('incrementOptionsUpdated')
    },

    deleteText () {
      if (!this.showIndex) {
        this.text = ''
      } else {
        this.$textC.deleteText(this.textType, this.textId)
      }
    },

    /**
     * Reloads local options
     */
    prepareDefaultTextEditorOptions () {
      this.localTextEditorOptions = this.$settingsC.cloneTextEditorOptions(this.textType, this.index)
      this.localTextEditorOptions.ready = true
      this.$store.commit('incrementOptionsUpdated')
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
      this.showTypeTextBlock = true
      this.showOnlyMetadata = true
    },

    toggleMetadata () {
      this.showMetadata = !this.showMetadata
    },

    selectTypeText () {
      this.showTypeTextBlock = true
      this.showOnlyMetadata = true
      this.showTypeUploadButtons = false
      this.showClearTextFlag++ 
    },

    selectUploadText () { 
      this.showUploadMenu = true
      this.showUploadBlockFlag++

      this.showOnlyMetadata = true
      this.showTypeUploadButtons = false
      this.showClearTextFlag++ 
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-hidden {
      visibility: hidden;
    }
  
    .alpheios-alignment-editor-text-blocks-single {
        textarea {
            width:100%;
            min-height: 300px;
            font-size: inherit;
        }

        p {
            margin-bottom: 10px;
        }

        p.alpheios-alignment-editor-text-blocks-info-line {
          margin: 0;

          &:before,
          &:after {
            clear: both;
            content: '';
            display: table;
          }
        }
        span.alpheios-alignment-editor-text-blocks-single__characters {
          color: #888;
          font-size: 90%;
          display: block;
          float: left;
          padding: 10px 0;
        }
        span.alpheios-alignment-editor-text-blocks-single__icons {
          display: block;
          float: right;
          padding: 5px;

          svg {
            display: block;
            width: 30px;
            height: 30px;
            stroke: #99002a;
            fill: transparent;
          }
        }
        p.alpheios-alignment-editor-red {
          color: #99002a;
        }
    }

    .alpheios-alignment-editor-text-blocks-single__title {
      position: relative;
      font-size: 20px;
      font-weight: bold;
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
