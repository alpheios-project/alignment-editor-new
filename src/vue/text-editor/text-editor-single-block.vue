<template>
  <div class="alpheios-alignment-editor-text-block">
      <p class="alpheios-alignment-editor-text-block__title">{{ textBlockTitle }}</p>
      <p class="alpheios-alignment-editor-text-block__direction">
          <span>{{ $l10n.getMsg('TEXT_EDITOR_DIRECTION_LABEL') }}  </span>
          <input type="radio" :id="directionRadioId('ltr')" value="ltr" v-model="direction" tabindex="1" @change="updateText">
          <label :for="directionRadioId('ltr')">{{ $l10n.getMsg('TEXT_EDITOR_DIRECTION_LEFT_TO_RIGHT') }}</label>
          <input type="radio" :id="directionRadioId('rtl')" value="rtl" v-model="direction" tabindex="1" @change="updateText">
          <label :for="directionRadioId('rtl')">{{ $l10n.getMsg('TEXT_EDITOR_DIRECTION_RIGHT_TO_LEFT') }}</label>
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
          <span>{{ $l10n.getMsg('TEXT_EDITOR_LANGUAGE_OTHER_LABEL') }}</span>
          <div class="alpheios-alignment-editor-text-block__other-lang-input-block">
            <input type="text" class="alpheios-alignment-editor-text-block__other-lang__input alpheios-input" v-model="selectedOtherLang" @change="updateText">
            <p class="alpheios-alignment-editor-text-block__other-lang__description">
              {{ $l10n.getMsg('TEXT_EDITOR_LANGUAGE_OTHER_DESCRIPTION') }}
            </p>
          </div>
        </div>
        
      </div>
  </div>
</template>
<script>
import LangsList from '@/vue/text-editor/langs-list.json'

export default {
  name: 'TextEditorSingleBlock',
  props: {
    textId: {
      type: String,
      required: true
    },
    externalText: {
      type: Object,
      required: false
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
  mounted () {
    this.langsList = LangsList.map(langData => {
      const l10nLabel = `LANG_${langData.value.toUpperCase()}`
      const l10nMessage = this.$l10n.getMsg(l10nLabel)
      return {
        value: langData.value,
        label: l10nMessage ? l10nMessage : langData.label
      }
    })
    this.selectedAvaLang = this.langsList[0].value
  },
  watch: {
    externalText (data) {
      this.text = data.text
      this.direction = data.direction
      this.updateLang(data.lang)
    }
  },
  computed: {
    textareaId () {
      return `alpheios-alignment-editor-text-block__${this.textId}`
    },
    textIdFormatted () {
      return this.textId.charAt(0).toUpperCase() + this.textId.slice(1)
    },
    textBlockTitle () {
      return this.$l10n.getMsg('TEXT_EDITOR_TEXT_BLOCK_TITLE', { textType: this.textIdFormatted })
    }, 
    chooseAvaLangLabel () {
      return this.$l10n.getMsg('TEXT_EDITOR_AVA_LANGUAGE_TITLE', { textType: this.textIdFormatted })
    },
    selectedLang () {
      return this.selectedOtherLang ? this.selectedOtherLang : this.selectedAvaLang
    }
  },
  methods: {
    directionRadioId (dir) {
      return `alpheios-alignment-editor-text-block__${this.textId}__${dir}`
    },
    updateAvaLang () {
      this.selectedOtherLang = null
      this.updateText()
    },
    updateLang (lang) {
      const langFromList = this.langsList.find(langOb => langOb.value === lang)

      if (langFromList) {
        this.selectedAvaLang = langFromList.value
      } else {
        this.selectedOtherLang = lang
      }
    },
    updateText () {
      this.$emit('update-text', {
        text: this.text,
        direction: this.direction,
        lang: this.selectedLang
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
