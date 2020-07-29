<template>
  <div class="alpheios-alignment-editor-container" v-show="showAlignEditor">
      <h2>Define Alignment for Source and Translation Texts
        (<span class="alpheios-alignment-editor-text-define-container__show-label" @click="toggleDefineAlignShow">{{ defineAlignShowLabel }}</span>)
      </h2>
      <div class="alpheios-alignment-editor-align-define-container" v-if="showAlignEditor" v-show="defineAlignShow">
          <align-text 
            :align-text-data="sourceText" :prefix-id = "1" 
            :show-alignment="showAlignment"
            @clickWord="clickWord" @addHoverWord="addHoverWord" @removeHoverWord="removeHoverWord"
            @clickEmptyText="clickEmptyText"
          />
          <align-text 
            :align-text-data="translationText" :prefix-id = "2"
            :show-alignment="showAlignment"
            @clickWord="clickWord" @addHoverWord="addHoverWord" @removeHoverWord="removeHoverWord"
            @clickEmptyText="clickEmptyText"
          />
      </div>
  </div>
</template>
<script>
import Vue from '@vue-runtime'
import FormatText from '@/lib/format-text.js'
import AlignText from '@/vue/align-editor/aligned-text.vue'

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
      alignedIds: [],
      currentAlignment: {},
      alignmentId: 0, 
      prevClickedWordType: null,
      showAlignment: []
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
      // console.info('clickWord ', textWord)
      if (textWord.textType === 'source' && (!this.prevClickedWordType || this.prevClickedWordType !== 'source')) {
        this.finishCurrentAlignment()
        this.startNewAlignment(textWord)
      } else {
        this.addToAlignment(textWord)
      }
      this.prevClickedWordType = textWord.textType
    },
    startNewAlignment (textWord) {
      // console.info('startNewAlignment - textWord', textWord)
      this.alignmentId = this.alignmentId + 1
      this.currentAlignment = {
        id: this.alignmentId,
        source: [ textWord.idWord ],
        translation: []
      }
      // console.info('startNewAlignment - currentAlignment', this.currentAlignment)
    },
    finishCurrentAlignment () {
      if (this.alignmentId > 0) {
        this.alignments.push(this.currentAlignment)
        // console.info('finishCurrentAlignment - ', this.alignments)
        this.alignedIds.push(...this.currentAlignment.source)
        this.alignedIds.push(...this.currentAlignment.translation)
        // console.info('finishCurrentAlignment - alignedIds', this.alignedIds)
      }
    },
    addToAlignment (textWord) {
      // console.info('addToAlignment - textWord', textWord)
      // console.info('addToAlignment - currentAlignment', this.currentAlignment)
      this.currentAlignment[textWord.textType].push(textWord.idWord)
    },
    addHoverWord (textWord) {
      // console.info('hoverWord started ', textWord)
      const searchId = textWord.idWord
      if (this.alignedIds.includes(searchId)) {
        const showAlignmentObj = this.alignments.find(al => al.source.includes(searchId) || al.translation.includes(searchId))
        this.showAlignment = []
        this.showAlignment.push(...showAlignmentObj.source)
        this.showAlignment.push(...showAlignmentObj.translation)
        // console.info('showAlignment - ', this.showAlignment)
      }
    },
    removeHoverWord (textWord) {
      this.showAlignment = []
    },
    clickEmptyText (textType) {
      this.finishCurrentAlignment()
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