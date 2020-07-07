<template>
  <div class="alpheios-alignment-editor-container" v-show="showAlignEditor">
      <h2>Define Alignment for Source and Translation Texts
        (<span class="alpheios-alignment-editor-text-define-container__show-label" @click="toggleDefineAlignShow">{{ defineAlignShowLabel }}</span>)
      </h2>
      <div class="alpheios-alignment-editor-align-define-container" v-if="showAlignEditor" v-show="defineAlignShow">
          <div class="alpheios-alignment-editor-align-text alpheios-alignment-editor-align__source"
            v-html = "sourceFormattedText"
            :dir = "sourceText.direction" :lang = "sourceText.lang" 
          ></div>
          <div class="alpheios-alignment-editor-align-text alpheios-alignment-editor-align__translation"
            v-html = "translationFormattedText"
            :dir = "translationText.direction" :lang = "translationText.lang" 
          ></div>
      </div>
  </div>
</template>
<script>
import Vue from '@vue-runtime'
import FormatText from '@/lib/format-text.js'

export default {
  name: 'AlignEditor',
  components: {},
  props: {
    sourceText: {
      type: Object,
      required: false
    },
    translationText: {
      type: Object,
      required: false
    },
    showEditor: {
      type: Number,
      required: false
    }
  },
  data () {
    return {
      defineAlignShow: false
    }
  },
  watch: {
    async showEditor () {
      this.defineAlignShow = true

      await Vue.nextTick()
      const elements = document.querySelectorAll('.alpheios-alignment-editor-align-text span')
      elements.forEach(el => {
        el.addEventListener('click', this.clickWord)
      })
    }
  },
  computed: {
    defineAlignShowLabel () {
      return this.defineAlignShow ? 'hide' : 'show'
    },
    sourceFormattedText () {
      return FormatText.defineIdentification(this.sourceText.text, 'L1:1', 'source')
    },
    translationFormattedText () {
      return FormatText.defineIdentification(this.translationText.text, 'L2:1', 'translation')
    },
    showAlignEditor () {
      return this.sourceText && this.sourceText.text && this.translationText && this.translationText.text
    }
  },
  methods: {
    toggleDefineAlignShow () {
      this.defineAlignShow = !this.defineAlignShow
    },
    clickWord (e) {
      console.info('clickWord - e', e.target, e)
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-align-define-container {
        margin-top: 15px;
        border: 1px solid #ddd;
        background: #f3f3f3;

        padding: 20px;

        &:before,
        &:after {
            clear: both;
            display: table;
            content: '';
        }

        .alpheios-alignment-editor-align-text {
            float: left;
            width: 50%;
        }

        .alpheios-alignment-editor-align__source {
            border-right: 2px solid #ddd;
            padding-right: 20px;
        }

        .alpheios-alignment-editor-align__translation {
            padding-left: 20px;
        }

        .alpheios-alignment-editor-align-text {
            span {
                cursor: pointer;
                padding: 4px;
                border: 1px solid transparent;

                &:hover {
                    border-color: #FFC24F;
                    background: #FFD27D;
                }
            }
        }
    }
</style>