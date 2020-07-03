<template>
  <div class="alpheios-alignment-editor-text-block">
      <p class="alpheios-alignment-editor-text-block__title">{{ textBlockTitle }}</p>
      <p class="alpheios-alignment-editor-text-block__direction">
          <span>Text Direction: </span>
          <input type="radio" :id="textDirectionRadio('ltr')" value="ltr" v-model="textDirection" tabindex="1">
          <label :for="textDirectionRadio('ltr')">Left to Right</label>
          <input type="radio" :id="textDirectionRadio('rtl')" value="rtl" v-model="textDirection" tabindex="1">
          <label :for="textDirectionRadio('rtl')">Right to Left</label>
      </p>
      <textarea :id="textareaId" v-model="textData" :dir="textDirection" tabindex="2" :lang="selectedLang" ></textarea>
      <p class="alpheios-alignment-editor-text-block__ava-lang">
          <span>{{ chooseAvaLangLabel}}</span>
          <select class="alpheios-alignment-editor-text-block__ava-lang__select alpheios-select" v-model="selectedAvaLang">
            <option v-for="lang in langsList" :key="lang.value" :value="lang.value">{{ lang.label }}</option>
          </select>
      </p>
      <div class="alpheios-alignment-editor-text-block__other-lang-block">
        <div class="alpheios-alignment-editor-text-block__other-lang">
          <span>Or Other Language:</span>
          <div class="alpheios-alignment-editor-text-block__other-lang-input-block">
            <input type="text" class="alpheios-alignment-editor-text-block__other-lang__input alpheios-input" v-model="selectedOtherLang">
            <p class="alpheios-alignment-editor-text-block__other-lang__description">
              Please use ISO 639-2 or ISO 639-3 three-letter codes for any other languages
            </p>
          </div>
        </div>
        
      </div>
  </div>
</template>
<script>
import LangsList from '@/vue/langs-list.json'

export default {
  name: 'EditorTextBlock',
  props: {
    textId: {
      type: String,
      required: true
    }
  },
  components: {},
  data () {
    return {
      textData: null,
      textDirection: 'ltr',
      langsList: [],
      selectedAvaLang: null,
      selectedOtherLang: null
    }
  },
  mounted () {
    this.langsList = LangsList
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
    textDirectionRadio (dir) {
      return `alpheios-alignment-editor-text-block__${this.textId}__${dir}`
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
