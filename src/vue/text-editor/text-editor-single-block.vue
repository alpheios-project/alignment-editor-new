<template>
  <div class="alpheios-alignment-editor-text-block" v-show="dataUpdated">
      <p class="alpheios-alignment-editor-text-block__title">{{ indexData }}{{ textBlockTitle }}
        <span :id="removeId" class="alpheios-alignment-editor-text-block__remove" v-show="showDeleteIcon" @click="deleteText">
          <delete-icon />
        </span>
      </p>
      <!--
      <radio-items 
        itemName = "direction"
        :properties = "directionProperties"
        :disabled="!docSourceEditAvailable"
        :idPrefix = "idRadioPrefix"
        @updateData = "updateDirection"
      />
      
      <direction-options-block :textType = "textType" :index = "index" 
        @updateText = "updateText" @updateLocalSourceTextOptions = "updateLocalSourceTextOptions"
      />
      -->
      <textarea :id="textareaId" v-model="text" :dir="direction" tabindex="2" :lang="selectedLang" @blur="updateText"
                 :disabled="!docSourceEditAvailable" >
      ></textarea>

      <p class="alpheios-alignment-editor-text-block__ava-lang">
          <span>{{ chooseAvaLangLabel}}</span>
          <select class="alpheios-alignment-editor-text-block__ava-lang__select alpheios-editor-select" v-model="selectedAvaLang" @change="updateAvaLang" :disabled="!docSourceEditAvailable" >
            <option v-for="lang in langsList" :key="lang.value" :value="lang.value">{{ lang.label }}</option>
          </select>
      </p>
      <div class="alpheios-alignment-editor-text-block__other-lang-block">
        <div class="alpheios-alignment-editor-text-block__other-lang">
          <span>{{ l10n.getMsgS('TEXT_EDITOR_LANGUAGE_OTHER_LABEL') }}</span>
          <div class="alpheios-alignment-editor-text-block__other-lang-input-block">
            <input type="text" class="alpheios-alignment-editor-text-block__other-lang__input alpheios-editor-input" v-model="selectedOtherLang" @change="updateText" :disabled="!docSourceEditAvailable" >
            <p class="alpheios-alignment-editor-text-block__other-lang__description">
              {{ l10n.getMsgS('TEXT_EDITOR_LANGUAGE_OTHER_DESCRIPTION') }}
            </p>
          </div>
        </div>
        
      </div>

      <tokenize-options-block :textType = "textType" :index = "index" 
        @updateText = "updateText" @updateLocalTokenizeOptions = "updateLocalTokenizeOptions"
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
    directionOptionsBlock: DirectionOptionsBlock
  },
  data () {
    return {
      text: null,
      prevText: null,
      direction: 'ltr',
      directionProperties: ['ltr', 'rtl'],

      langsList: [],
      selectedAvaLang: null,
      selectedOtherLang: null,

      localTokenizeOptions: null,
      localSourceTextOptions: null
    }
  },
  /**
   * Uploads lang list from Json and defines default lang
   */
  created () {
    this.langsList = Langs.all
    this.selectedAvaLang = this.langsList[0].value
  },

  watch: {
    text (val) {
      if ((!this.prevText && val) || (this.prevText && !val)) {
        this.updateText()
      }
      this.prevText = val
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
    /**
     * Defines Label for available language list
     */
    chooseAvaLangLabel () {
      return this.l10n.getMsgS('TEXT_EDITOR_AVA_LANGUAGE_TITLE', { textType: this.textTypeFormatted })
    },
    /**
     * Defines final language
     */
    selectedLang () {
      return this.selectedOtherLang ? this.selectedOtherLang : this.selectedAvaLang
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
    }
  },
  methods: {
    updateFromExternal () {
      const data = this.$textC.getDocSource(this.textType, this.textId)
      if (data && data.lang) {
        this.text = data.text
        this.direction = data.direction
        this.updateLang(data.lang)
      }
    },

    /**
     * If a user reselects language from select, input[text] would be cleared
     */
    updateAvaLang () {
      this.selectedOtherLang = null
      this.updateText()
    },
    /**
     * It is used when we need to upload lang from external source,
     * first it checks langs list, and if it is failed, then it would be printed to unput[text]
     */
    updateLang (lang) {
      const langFromList = this.langsList.find(langOb => langOb.value === lang)

      if (langFromList) {
        this.selectedAvaLang = langFromList.value
        this.selectedOtherLang = null
      } else {
        this.selectedOtherLang = lang
        this.selectedAvaLang = this.langsList[0].value
      }
    },

    updateLocalSourceTextOptions (localOptions) {
      this.localSourceTextOptions = localOptions
      this.updateText()
    },


    updateLocalTokenizeOptions (localOptions) {
      this.localTokenizeOptions = localOptions
      this.updateText()
    },
    /**
     * Emits update-text event with data from properties
     */
    updateText () {
      const params = {
        text: this.text,
        direction: this.direction,
        lang: this.selectedLang,
        id: this.textId,
        tokenization: TokenizeController.defineTextTokenizationOptions(this.$settingsC, this.localTokenizeOptions)
      }
      
      this.$textC[this.updateTextMethod](params)

    },
    deleteText () {
      this.$textC.deleteText(this.textType, this.textId)
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
