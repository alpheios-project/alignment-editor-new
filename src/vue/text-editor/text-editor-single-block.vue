<template>
  <div class="alpheios-alignment-editor-text-block">
      <p class="alpheios-alignment-editor-text-block__title">{{ textBlockTitle }}</p>
      <p class="alpheios-alignment-editor-text-block__direction">
          <span>Text Direction: </span>
          <input type="radio" :id="directionRadioId('ltr')" value="ltr" v-model="direction" tabindex="1" @change="updateText">
          <label :for="directionRadioId('ltr')">Left to Right</label>
          <input type="radio" :id="directionRadioId('rtl')" value="rtl" v-model="direction" tabindex="1" @change="updateText">
          <label :for="directionRadioId('rtl')">Right to Left</label>
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
          <span>Or Other Language:</span>
          <div class="alpheios-alignment-editor-text-block__other-lang-input-block">
            <input type="text" class="alpheios-alignment-editor-text-block__other-lang__input alpheios-input" v-model="selectedOtherLang" @change="updateText">
            <p class="alpheios-alignment-editor-text-block__other-lang__description">
              Please use ISO 639-2 or ISO 639-3 three-letter codes for any other languages
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
    this.langsList = LangsList
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
      return `Enter Text in ${ this.textIdFormatted } Language:`
    }, 
    chooseAvaLangLabel () {
      return `${ this.textIdFormatted } Language:`
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
