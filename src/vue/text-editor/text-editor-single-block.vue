<template>
  <div class="alpheios-alignment-editor-text-block" v-show="dataUpdated">
      <p class="alpheios-alignment-editor-text-block__title">{{ indexData }}{{ textBlockTitle }}</p>
      <p class="alpheios-alignment-editor-text-block__direction">
          <span>{{ l10n.getMsgS('TEXT_EDITOR_DIRECTION_LABEL') }}  </span>
          <input type="radio" :id="directionRadioId('ltr')" value="ltr" v-model="direction" tabindex="1" @change="updateText">
          <label :for="directionRadioId('ltr')">{{ l10n.getMsgS('TEXT_EDITOR_DIRECTION_LEFT_TO_RIGHT') }}</label>
          <input type="radio" :id="directionRadioId('rtl')" value="rtl" v-model="direction" tabindex="1" @change="updateText">
          <label :for="directionRadioId('rtl')">{{ l10n.getMsgS('TEXT_EDITOR_DIRECTION_RIGHT_TO_LEFT') }}</label>
      </p>
      <textarea :id="textareaId" v-model="text" :dir="direction" tabindex="2" :lang="selectedLang" @blur="updateText"></textarea>
      <p class="alpheios-alignment-editor-text-block__ava-lang">
          <span>{{ chooseAvaLangLabel}}</span>
          <select class="alpheios-alignment-editor-text-block__ava-lang__select alpheios-select" v-model="selectedAvaLang" @change="updateAvaLang">
            <option v-for="lang in langsList" :key="lang.value" :value="lang.value">{{ lang.label }}</option>
          </select>
      </p>
      <div class="alpheios-alignment-editor-text-block__other-lang-block">
        <div class="alpheios-alignment-editor-text-block__other-lang">
          <span>{{ l10n.getMsgS('TEXT_EDITOR_LANGUAGE_OTHER_LABEL') }}</span>
          <div class="alpheios-alignment-editor-text-block__other-lang-input-block">
            <input type="text" class="alpheios-alignment-editor-text-block__other-lang__input alpheios-input" v-model="selectedOtherLang" @change="updateText">
            <p class="alpheios-alignment-editor-text-block__other-lang__description">
              {{ l10n.getMsgS('TEXT_EDITOR_LANGUAGE_OTHER_DESCRIPTION') }}
            </p>
          </div>
        </div>
        
      </div>
  </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
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
    }
  },
  components: {},
  data () {
    return {
      text: null,
      direction: 'ltr',
      langsList: [],
      selectedAvaLang: null,
      selectedOtherLang: null
    }
  },
  /**
   * Uploads lang list from Json and defines default lang
   */
  created () {
    this.langsList = Langs.all
    this.selectedAvaLang = this.langsList[0].value
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
    needToShowIndex () {
      return this.$store.state.alignmentUpdated && this.$textC.allTargetTextsIds.length > 1
    },
    
    indexData () {
      return this.needToShowIndex ? `${this.index + 1}. ` : ''
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
     * Defines unique id for direction input
     */
    directionRadioId (dir) {
      return `alpheios-alignment-editor-text-block__${this.textType}__${dir}_${this.textId}`
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
    /**
     * Emits update-text event with data from properties
     */
    updateText () {
      const methodName = this.textType === 'origin' ? 'updateOriginDocSource' : 'updateTargetDocSource'

      this.$textC[methodName]({
        text: this.text,
        direction: this.direction,
        lang: this.selectedLang,
        id: this.textId
      })
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

</style>
