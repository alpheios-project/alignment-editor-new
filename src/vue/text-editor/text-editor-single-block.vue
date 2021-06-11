<template>
  <div class="alpheios-alignment-editor-text-blocks-single" v-show="dataUpdated" :id="containerId">
      <p class="alpheios-alignment-editor-text-blocks-single__title">
        <span class="alpheios-alignment-editor-text-blocks-single__title-text">{{ indexData }}{{ textBlockTitle }}</span>
        <span id="alpheios-alignment-editor-add-translation" class="alpheios-alignment-editor-add-translation" v-show="showAddTranslation" @click="$emit('add-translation')">
          <plus-icon />
        </span>

      </p>
      <div v-show="showTypeUploadButtons" >
        <span class="alpheios-alignment-editor-text-blocks-single__type-label">{{ l10n.getMsgS('TEXT_SINGLE_TYPE_LABEL') }}</span>
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button"  id="alpheios-actions-menu-button__uploadtext"
            @click="selectUploadText">
            {{ l10n.getMsgS('TEXT_SINGLE_UPLOAD_BUTTON') }}
        </button>
      </div>
      <div class="alpheios-alignment-editor-actions-menu__upload-block" v-show="showUploadMenu" >
          <input type="file" @change="loadTextFromFile" ref="fileupload">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__metadata"
              @click="showModalDTS = true">
              DTSAPI
          </button>
      </div>
      <upload-dtsapi-block :showModal="showModalDTS" @closeModal = "showModalDTS = false" @uploadFromDTSAPI = "uploadFromDTSAPI"/>

      <metadata-block :text-type = "textType" :text-id = "textId" :showModal="showModalMetadata" @closeModal = "showModalMetadata = false"  />
      <language-block :text-type = "textType" :text-id = "textId" :localOptions = "localTextEditorOptions" @updateText = "updateText" @updateDirection = "updateDirection"
                      :showModal="showModalLanguage" @closeModal = "showModalLanguage = false"  />
      <source-type-block :text-type = "textType" :text-id = "textId" :localOptions = "localTextEditorOptions" @updateText = "updateText" 
                :showModal="showModalSourceType" @closeModal = "showModalSourceType = false"  />

      <div v-show="showTypeTextBlock" class="alpheios-alignment-editor-text-blocks-single-text-area-container">
        <p class="alpheios-alignment-editor-text-blocks-info-line">
          <span class="alpheios-alignment-editor-text-blocks-single__characters" :class = "charactersClasses">{{ charactersText }}</span>

          <span class="alpheios-alignment-editor-text-blocks-single__lang-icon" v-show="showTextProps" @click="showModalSourceType = true"> {{ sourceType }} </span>
          <span class="alpheios-alignment-editor-text-blocks-single__lang-icon" v-show="showTextProps" @click="showModalLanguage = true"> {{ language }} </span>
          <span class="alpheios-alignment-editor-text-blocks-single__icons" v-show="showLangNotDetected">
            <tooltip :tooltipText="l10n.getMsgS('NO_LANG_DETECTED_ICON')" tooltipDirection="top">
              <no-lang-detected-icon />
            </tooltip>
          </span>

          <metadata-icons :text-type = "textType" :text-id = "textId" @showModalMetadata = "showModalMetadata = true" />

        </p>
        <span :id="removeId" class="alpheios-alignment-editor-text-blocks-single__remove" v-show="showDeleteIcon" @click="deleteText">
          <x-close-icon />
        </span>
        <textarea :id="textareaId" v-model="text" :dir="direction" tabindex="2" :lang="language" @blur="updateTextFromTextBlock()" 
                  :disabled="!docSourceEditAvailable" class="alpheios-alignment-editor-text-blocks-textarea">
        ></textarea>
      </div>


      <div class="alpheios-alignment-editor-text-blocks-single__describe-button" >
        <tooltip :tooltipText="l10n.getMsgS('DESCRIBE_BUTTON_TOOLTIP')" tooltipDirection="top">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button"  :id="describeButtonId"
              @click="showModalMetadata = true" :disabled="!isMetadataAvailable" >
              {{ l10n.getMsgS('DESCRIBE_BUTTON_TITLE') }}
          </button>
        </tooltip>
      </div>

      <div class="alpheios-alignment-editor-text-blocks-single__align-button" v-if="textType === 'origin'">
        <tooltip :tooltipText="l10n.getMsgS('ALIGN_TEXT_BUTTON_TOOLTIP')" tooltipDirection="top">
          <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button-align"  id="alpheios-actions-menu-button__align"
              @click="$emit('align-text')" :disabled="!alignAvailable" >
              {{ l10n.getMsgS('MAIN_MENU_ALIGN_TITLE') }}
          </button>
        </tooltip>
      </div>
  </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import XCloseIcon from '@/inline-icons/x-close.svg'
import NoMetadataIcon from '@/inline-icons/no-metadata.svg'
import HasMetadataIcon from '@/inline-icons/has-metadata.svg'
import NoLangDetectedIcon from '@/inline-icons/no-lang-detected.svg'
import PlusIcon from '@/inline-icons/plus.svg'

import TokenizeController from '@/lib/controllers/tokenize-controller.js'
import SettingsController from '@/lib/controllers/settings-controller.js'

import OptionItemBlock from '@/vue/options/option-item-block.vue'

import MetadataBlock from '@/vue/text-editor/metadata-block.vue'
import LanguageBlock from '@/vue/text-editor/language-block.vue'
import SourceTypeBlock from '@/vue/text-editor/source-type-block.vue'

import Tooltip from '@/vue/common/tooltip.vue'
import MetadataIcons from '@/vue/common/metadata-icons.vue'
import UploadDTSAPIBlock from '@/vue/text-editor/upload-dtsapi-block.vue'

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
    xCloseIcon: XCloseIcon,
    noMetadataIcon: NoMetadataIcon,
    hasMetadataIcon: HasMetadataIcon,
    noLangDetectedIcon: NoLangDetectedIcon,
    plusIcon: PlusIcon,
    optionItemBlock: OptionItemBlock,
    metadataBlock: MetadataBlock,
    sourceTypeBlock: SourceTypeBlock,
    languageBlock: LanguageBlock,
    tooltip: Tooltip,
    uploadDtsapiBlock: UploadDTSAPIBlock,
    metadataIcons: MetadataIcons
  },
  data () {
    return {
      text: '',
      prevText: null,

      localTextEditorOptions: { ready: false },
      showTypeUploadButtons: true,

      showTypeTextBlock: true,
      showTextProps: false,
      showUploadMenu: false,
      showModalDTS: false,
      showModalMetadata: false,
      showModalLanguage: false,
      showModalSourceType: false,
      showModalHelp: false,

      updatedLocalOptionsFlag: 1
    }
  },
  /**
   * Clone options (sourceText and tokenize options) for the cuurent instance of a sourceText
   */
  async mounted () {
    if (!this.localTextEditorOptions.ready && SettingsController.tokenizerOptionsLoaded) {
      this.prepareDefaultTextEditorOptions()
    }
    this.initDataProps()
    await this.updateFromExternal()
  },
  watch: {
    async '$store.state.optionsUpdated' () {
      if (!this.localTextEditorOptions.ready && SettingsController.tokenizerOptionsLoaded) {
        this.prepareDefaultTextEditorOptions()
      }
    },
    async '$store.state.uploadCheck' () {
      await this.updateFromExternal()
      this.$refs.fileupload.value = ''
    },
    async '$store.state.docSourceLangDetected' () {
      this.updateLangData()
    },

    '$store.state.alignmentRestarted' () {
      this.restartTextEditor()
    },
    async '$store.state.resetOptions' () {
      this.localTextEditorOptions = SettingsController.resetLocalTextEditorOptions(this.textType, this.textId)
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
      if (!this.localTextEditorOptions.ready && SettingsController.tokenizerOptionsLoaded) {
        this.prepareDefaultTextEditorOptions()
      }
      return this.$store.state.docSourceUpdated
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
      return (this.textType === 'target') && this.$store.state.docSourceUpdated && this.$textC.allTargetTextsIds.length > 1 
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
      return this.docSourceEditAvailable && (this.showIndex || (this.text && (this.text.length > 0)))
    },
    /**
     * Blocks changes if aligned version is already created and aligned groups are started
     */
    docSourceEditAvailable () {
      return this.$store.state.docSourceUpdated && this.$store.state.alignmentUpdated &&
             !this.$textC.sourceTextIsAlreadyTokenized(this.textType, this.textId)
    },
    updateTextMethod () {
      return this.textType === 'origin' ? 'updateOriginDocSource' : 'updateTargetDocSource'
    },
    direction () {
      return this.$store.state.optionsUpdated && this.$store.state.docSourceUpdated && this.localTextEditorOptions.ready && this.localTextEditorOptions.sourceText.items.direction.currentValue
    },
    language () {
      return this.$store.state.optionsUpdated && this.$store.state.docSourceUpdated && this.localTextEditorOptions.ready && this.localTextEditorOptions.sourceText.items.language.currentValue
    },
    sourceType () {
      return this.$store.state.optionsUpdated && this.$store.state.docSourceUpdated && this.localTextEditorOptions.ready && this.localTextEditorOptions.sourceText.items.sourceType.currentValue
    },
    tokenization () {
      return TokenizeController.defineTextTokenizationOptions(SettingsController.tokenizerOptionValue, this.localTextEditorOptions[this.sourceType])
    },
    charactersClasses () {
      return {
        'alpheios-alignment-editor-hidden' : (this.textCharactersAmount === 0),
        'alpheios-alignment-editor-red' : this.sourceType === 'text' && (this.textCharactersAmount > this.maxCharactersForTheText)
      }
    },
    textCharactersAmount () {
      return this.text ? this.text.length : 0
    },
    maxCharactersForTheText () {
      return this.$store.state.optionsUpdated && SettingsController.maxCharactersPerTextValue
    },
    charactersText () {
      return `Characters count - ${this.textCharactersAmount} (max - ${this.maxCharactersForTheText})`
    },

    updatedLocalOptions () {
      return this.updatedLocalOptionsFlag && this.localTextEditorOptions
    },
    isMetadataAvailable () {
      const docSource = this.$textC.getDocSource(this.textType, this.textId)
      return this.$store.state.docSourceUpdated && docSource
    },
    showLangNotDetected () {
      const docSource = this.$textC.getDocSource(this.textType, this.textId)
      return this.$store.state.docSourceLangDetected && docSource && (!docSource.skipDetected && !docSource.detectedLang && docSource.text.length > 0)
    },
    showAddTranslation () {
      return this.$store.state.docSourceUpdated && (this.textType === 'target') && (this.index === (this.$textC.allTargetTextsIds.length - 1)) && (this.text.length > 0)
    },
    showActionMenu () {
      return this.$store.state.docSourceUpdated && (this.showUploadMenu || this.showTextProps)
    },
    alignAvailable () {
      return this.$store.state.docSourceUpdated && this.$store.state.optionsUpdated && this.$store.state.alignmentUpdated && this.$textC.couldStartAlign && this.$textC.checkSize()
    },
    describeButtonId () {
      return `alpheios-actions-menu-button__describe-${this.textType}-${this.textId}-id`
    }
  },
  methods: {
    initDataProps () {
      this.showTypeUploadButtons = true

      this.showTextProps = false
      this.showUploadMenu = false
    },

    /**
     * Updates sourceText properties from textController
     */
    async updateFromExternal () {
      const sourceTextData = this.$textC.getDocSource(this.textType, this.textId)
      if (sourceTextData && sourceTextData.text) {
        this.text = sourceTextData.text
        SettingsController.updateLocalTextEditorOptions(this.localTextEditorOptions, sourceTextData)
        await this.updateText()

        this.showTypeUploadButtons = false
      }
    },

    /**
     * Clears text and reloads local options
     */
    async restartTextEditor () {
      this.text = ''
      this.$refs.fileupload.value = ''
      this.prepareDefaultTextEditorOptions()

      this.showTypeUploadButtons = true
      this.showTextProps = false
      this.showUploadMenu = false
      this.$textC.deleteText(this.textType, this.textId)
    },

    collectCurrentParams () {
      return {
        text: this.text,
        direction: this.direction,
        lang: this.language,
        id: this.textId,
        sourceType: this.sourceType,
        tokenization: this.tokenization
      }
    },

    async updateTextFromTextBlock () {
      const docSource = this.$textC.getDocSource(this.textType, this.textId)
      if (!docSource && (this.text.length === 0)) { return }

      const params = this.collectCurrentParams()
      const result = await this.$textC[this.updateTextMethod](params, this.textId)
      if (!result.resultUpdate) {
        this.text = ''
      }

      if (result.resultUpdate && this.showTypeUploadButtons) {

        setTimeout(() => {
          this.showTypeUploadButtons = false
          this.showTextProps = true
        }, 100)
        
      }
    },
    
    /**
     * Emits update-text event with data from properties
     */
    async updateText () {
      if (this.text) {
        const params = {
          text: this.text,
          direction: this.direction,
          lang: this.language,
          id: this.textId,
          sourceType: this.sourceType,
          tokenization: this.tokenization
        }

        const result = await this.$textC[this.updateTextMethod](params, this.textId)  

        if (this.$textC.checkDetectedProps(this.textType, this.textId) || (this.text && this.text.length > 0)) {
          this.showTypeUploadButtons = false
          this.showTextProps = true
        }
      }
    },

    updateLangData () {
      const sourceTextData = this.$textC.getDocSource(this.textType, this.textId)
      if (sourceTextData) {
        this.localTextEditorOptions.sourceText.items.direction.currentValue = sourceTextData.direction
        this.localTextEditorOptions.sourceText.items.language.currentValue = sourceTextData.lang
        this.localTextEditorOptions.sourceText.items.sourceType.currentValue = sourceTextData.sourceType
        this.$store.commit('incrementOptionsUpdated')
      }
    },

    updateDirection () {
      this.localTextEditorOptions.sourceText.items.direction.currentValue = Langs.defineDirection(this.localTextEditorOptions.sourceText.items.language.currentValue)
      this.$store.commit('incrementOptionsUpdated')
    },

    async deleteText () {
      this.text = ''
      this.$refs.fileupload.value = ''
      this.prepareDefaultTextEditorOptions()
      this.$textC.deleteText(this.textType, this.textId)
      setTimeout(() => {
        this.showTypeUploadButtons = true
        this.showUploadMenu = false
      }, 150)
    },

    /**
     * Reloads local options
     */
    prepareDefaultTextEditorOptions () {
      this.localTextEditorOptions = SettingsController.cloneTextEditorOptions(this.textType, this.index)

      this.localTextEditorOptions.ready = true
      this.$store.commit('incrementOptionsUpdated')
    },

    /**
     * Uploads a single instance of text
     */
    async uploadSingle (fileData) {
      const result = await this.$textC.uploadDocSourceFromFileSingle(fileData, {
        textType: this.textType,
        textId: this.textId,
        tokenization: this.tokenization
      })
      if (result.resultUpdate) {
        this.showTypeTextBlock = true
      } else {
        this.showTypeUploadButtons = true
        this.showTextProps = false
        this.showUploadMenu = false
      }
    },

    selectUploadText () { 
      this.showUploadMenu = true

      this.showTypeUploadButtons = false
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
        this.uploadSingle({ text: e.target.result, extension })
        this.showUploadMenu = false
      }
      reader.readAsText(file)

      this.$refs.fileupload.value = ''
    },

    uploadFromDTSAPI (filedata) {
      this.uploadSingle({ text: filedata.tei, lang: filedata.lang, extension: filedata.extension })
      this.showUploadMenu = false
    },
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

        span.alpheios-alignment-editor-text-blocks-single__icons{

          &.alpheios-alignment-editor-text-blocks-single__metadata_icon_no_data {
            cursor: pointer;
            svg {
              stroke: #99002a;
            }
          }

          &.alpheios-alignment-editor-text-blocks-single__metadata_icon_has_data {
            cursor: pointer;
            svg {
              stroke: #2a9900;
            }
          }
        }

        span.alpheios-alignment-editor-red {
          color: #99002a;
        }

        .alpheios-alignment-editor-text-blocks-single__lang-icon {
          display: block;
          float: right;

          font-weight: bold;
          padding: 3px;
          border: 2px solid #000;
          border-radius: 30px;
          font-size: 13px;
          margin-top: 5px;
          margin-left: 3px;

          cursor: pointer;

          min-width: 33px;
          text-align: center;
        }
    }

    .alpheios-alignment-editor-text-blocks-single__title {
      position: relative;
      font-size: 20px;
      font-weight: bold;
    }


    .alpheios-alignment-editor-add-translation {
      display: inline-block;
      width: 25px;
      height: 25px;

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

    .alpheios-alignment-editor-text-blocks-single__type-label {
      display: inline-block;
      padding-right: 15px;
    }

    .alpheios-alignment-editor-text-blocks-single__title {
      position: relative;

      .alpheios-alignment-editor-text-blocks-single__title-text {
        display: inline-block; 
        padding-right: 15px;
        line-height: 35px;
      }

      .alpheios-alignment-editor-add-translation {
        position: relative;
        top: 5px;
      }
    }

    .alpheios-alignment-editor-text-blocks-textarea {
      padding: 10px 55px 10px 10px;
    }

    .alpheios-alignment-editor-text-blocks-single-text-area-container {
      position: relative;

      .alpheios-alignment-editor-text-blocks-single__remove {
        top: 55px;
        right: 25px;
        fill: #ddd;

        display: inline-block;
        width: 20px;
        height: 20px;

        position: absolute;

        cursor: pointer;
        svg {
          display: inline-block;
          width: 100%;
          height: 100%;
        }
      }
    }

  .alpheios-alignment-editor-text-blocks-single__align-button {
    margin-top: 30px;
    text-align: right;
  }

  .alpheios-alignment-editor-text-blocks-single__describe-button {
    text-align: center;
    margin-top: 10px;
  }
</style>
