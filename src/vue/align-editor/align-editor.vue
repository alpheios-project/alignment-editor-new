<template>
  <div class="alpheios-alignment-editor-container" v-show="showAlignEditor">
      <h2>Define Alignment for Origin and Target Texts
        (<span class="alpheios-alignment-editor-text-define-container__show-label" @click="toggleDefineAlignShow">{{ defineAlignShowLabel }}</span>)
      </h2>
      <div class="alpheios-alignment-editor-align-define-container" v-if="showAlignEditor" v-show="defineAlignShow">
          <align-text 
            :align-text-data="originText" :prefix-id = "1" 
            :show-alignment="showAlignment"
            @clickWord="clickWord" @addHoverWord="addHoverWord" @removeHoverWord="removeHoverWord"
            @clickEmptyText="clickEmptyText"
          />
          <align-text 
            :align-text-data="targetText" :prefix-id = "2"
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
    originText: {
      type: Object,
      required: false
    },
    targetText: {
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
      return this.originText && this.originText.text && this.targetText && this.targetText.text
    }
  },
  methods: {
    toggleDefineAlignShow () {
      this.defineAlignShow = !this.defineAlignShow
    },
    clickWord (textWord) {
      // console.info('clickWord ', textWord)
      if (textWord.textType === 'origin' && (!this.prevClickedWordType || this.prevClickedWordType !== 'origin')) {
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
        origin: [ textWord.idWord ],
        target: []
      }
      // console.info('startNewAlignment - currentAlignment', this.currentAlignment)
    },
    finishCurrentAlignment () {
      if (this.alignmentId > 0) {
        this.alignments.push(this.currentAlignment)
        // console.info('finishCurrentAlignment - ', this.alignments)
        this.alignedIds.push(...this.currentAlignment.origin)
        this.alignedIds.push(...this.currentAlignment.target)
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
        const showAlignmentObj = this.alignments.find(al => al.origin.includes(searchId) || al.target.includes(searchId))
        this.showAlignment = []
        this.showAlignment.push(...showAlignmentObj.origin)
        this.showAlignment.push(...showAlignmentObj.target)
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