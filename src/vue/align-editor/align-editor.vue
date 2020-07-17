<template>
  <div class="alpheios-alignment-editor-container" v-show="showAlignEditor">
      <h2>Define Alignment for Source and Translation Texts
        (<span class="alpheios-alignment-editor-text-define-container__show-label" @click="toggleDefineAlignShow">{{ defineAlignShowLabel }}</span>)
      </h2>
      <div class="alpheios-alignment-editor-align-define-container" v-if="showAlignEditor" v-show="defineAlignShow">
          <align-text :align-text-data="sourceText" :prefix-id = "1" @clickWord="clickWord"/>
          <align-text :align-text-data="translationText" :prefix-id = "2" @clickWord="clickWord"/>
      </div>
  </div>
</template>
<script>
import Vue from '@vue-runtime'
import FormatText from '@/lib/format-text.js'
import AlignText from '@/vue/align-editor/align-text.vue'

export default {
  name: 'AlignEditor',
  components: {
    alignText: AlignText
  },
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
      defineAlignShow: false,
      alignments: [],
      currentAlignment: {},
      alignmentId: 0,
      prevClickedWordType: null
    }
  },
  watch: {
    async showEditor () {
      this.defineAlignShow = true
    }
  },
  computed: {
    defineAlignShowLabel () {
      return this.defineAlignShow ? 'hide' : 'show'
    },
    showAlignEditor () {
      return this.sourceText && this.sourceText.text && this.translationText && this.translationText.text
    }
  },
  methods: {
    toggleDefineAlignShow () {
      this.defineAlignShow = !this.defineAlignShow
    },
    clickWord (textWord) {
      console.info('clickWord ', textWord)
      if (textWord.textType === 'source' && (!this.prevClickedWordType || this.prevClickedWordType === 'source')) {
        this.finishCurrentAlignment()
        this.startNewAlignment(textWord)
      } else {
        this.addToAlignment(textWord)
      }
      this.prevClickedWordType = textWord.textType
    },
    startNewAlignment (textWord) {
      this.alignmentId = this.alignmentId + 1
    },
    finishCurrentAlignment () {
    },
    addToAlignment (textWord) {
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
    }
</style>