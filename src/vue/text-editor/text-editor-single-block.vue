<template>
  <div class="alpheios-alignment-editor-text-block" v-show="dataUpdated">
      <p class="alpheios-alignment-editor-text-block__title">{{ indexData }}{{ textBlockTitle }}
        <span :id="removeId" class="alpheios-alignment-editor-text-block__remove" v-show="showDeleteIcon" @click="deleteText">
          <delete-icon />
        </span>
      </p>

      <direction-options-block :textType = "textType" :index = "index" 
        @updateText = "updateText" :localOptions = "localTextEditorOptions"
      />
      <textarea :id="textareaId" v-model="text" :dir="direction" tabindex="2" :lang="language" @blur="updateText"
                 :disabled="!docSourceEditAvailable" >
      ></textarea>

      <language-options-block :textType = "textType" :index = "index" 
        @updateText = "updateText" :localOptions = "localTextEditorOptions"
      />

      <tokenize-options-block :textType = "textType" :index = "index" :localOptions = "localTextEditorOptions"
        @updateText = "updateText"
      />

  </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import Langs from '@/lib/data/langs/langs.js'

import DeleteIcon from '@/inline-icons/delete.svg'

import TokenizeController from '@/lib/controllers/tokenize-controller.js'
import RadioItems from '@/vue/form-items/radio-items.vue'

import OptionItemBlock from '@/vue/options/option-item-block.vue'

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
    radioItems: RadioItems,
    optionItemBlock: OptionItemBlock,
    tokenizeOptionsBlock: TokenizeOptionsBlock,
    directionOptionsBlock: DirectionOptionsBlock,
    languageOptionsBlock: LanguageOptionsBlock
  },
  data () {
    return {
      text: null,
      prevText: null,

      localTextEditorOptions: {}
    }
  },
  /**
   * Uploads lang list from Json and defines default lang
   */
  async mounted () {
    if (!this.localTextEditorOptions.ready && this.$settingsC.tokenizerOptionsLoaded) {
      await this.prepareDefaultTextEditorOptions()
    }
  },
  watch: {
    text (val) {
      if ((!this.prevText && val) || (this.prevText && !val)) {
        this.updateText()
      }
      this.prevText = val
    },
    async '$store.state.optionsUpdated' () {
      if (!this.localTextEditorOptions.ready && this.$settingsC.tokenizerOptionsLoaded) {
        await this.prepareDefaultTextEditorOptions()
      }
    }
  },
  computed: {
    dataUpdated () {
      this.updateFromExternal()
      return this.$store.state.alignmentUpdated
    },
    /**
     * Defines unique id for textArea for tracking changes
     */
    textareaId () {
      return `alpheios-alignment-editor-text-block__${this.textType}_${this.textId}`
    },
    removeId () {
      return `alpheios-alignment-editor-remove-block__${this.textType}_${this.textId}`
    },
    /**
     * Defines textType from textId
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
      return Boolean(this.$store.state.alignmentUpdated) && !this.$alignedC.alignmentGroupsWorkflowStarted
    },
    idRadioPrefix () {
      return `alpheios-alignment-editor-text-block__${this.textType}__${this.textId}`
    },
    updateTextMethod () {
      return this.textType === 'origin' ? 'updateOriginDocSource' : 'updateTargetDocSource'
    },
    direction () {
      return this.$store.state.optionsUpdated && this.localTextEditorOptions.ready && this.localTextEditorOptions.sourceText.items.direction.currentValue
    },
    language () {
      return this.$store.state.optionsUpdated && this.localTextEditorOptions.ready && this.localTextEditorOptions.sourceText.items.language.currentValue
    },
    sourceType () {
      return this.$store.state.optionsUpdated && this.localTextEditorOptions.ready && this.localTextEditorOptions.sourceText.items.sourceType.currentValue
    }
  },
  methods: {
    
    updateFromExternal () {
      /*
      const data = this.$textC.getDocSource(this.textType, this.textId)
      if (data && data.lang) {
        this.text = data.text
        // this.direction = data.direction
        this.updateLang(data.lang)
      }
      */
    },

    /**
     * Emits update-text event with data from properties
     */
    updateText () {
      console.info('updateText', this.textType, this.localTextEditorOptions, this.localTextEditorOptions[this.sourceType])
      const params = {
        text: this.text,
        direction: this.direction,
        lang: this.language,
        id: this.textId,
        sourceType: this.sourceType,
        tokenization: TokenizeController.defineTextTokenizationOptions(this.$settingsC, this.localTextEditorOptions[this.sourceType])
      }
      
      console.info('updateText - ', params)
      this.$textC[this.updateTextMethod](params)

    },
    deleteText () {
      this.$textC.deleteText(this.textType, this.textId)
    },
    async prepareDefaultTextEditorOptions () {
      this.localTextEditorOptions = await this.$settingsC.cloneTextEditorOptions(this.textType, this.index)
      this.localTextEditorOptions.ready = true
      this.updateText()
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-text-block {
        textarea {
            width:100%;
            min-height: 300px;
        }

        p {
            margin-bottom: 10px;
        }

        .alpheios-alignment-editor-text-block__ava-lang,
        .alpheios-alignment-editor-text-block__other-lang {
          span {
            min-width: 160px;
            display: inline-block;
            vertical-align: top;
          }
        }
        .alpheios-alignment-editor-text-block__ava-lang__select,
        .alpheios-alignment-editor-text-block__other-lang-input-block {
            width: 80%;
            max-width: 300px;
            display: inline-block;
            vertical-align: top;
        }

        .alpheios-alignment-editor-text-block__other-lang__description {
          font-size: 90%;
          color: #888;
        }
    }

    .alpheios-alignment-editor-text-block__title {
      position: relative;
    }
    .alpheios-alignment-editor-text-block__remove {
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

    .alpheios-alignment-text__group {
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
</style>
