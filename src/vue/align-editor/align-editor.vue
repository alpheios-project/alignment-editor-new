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
import FormatText from '@/lib/utilities/format-text.js'
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
      return this.originText && this.originText.tokens && this.targetText && this.targetText.tokens
    }
  },
  methods: {
    toggleDefineAlignShow () {
      this.defineAlignShow = !this.defineAlignShow
    },
    clickWord (token) {
      if (token.textType === 'origin' && (!this.prevClickedWordType || this.prevClickedWordType !== 'origin')) {
        this.finishCurrentAlignmentGroup()
        this.startNewAlignmentGroup(token)
      } else {
        this.addToAlignmentGroup(token)
      }
      this.prevClickedWordType = token.textType
    },
    startNewAlignmentGroup (token) {
      this.$textC.startNewAlignmentGroup(token)
    },
    finishCurrentAlignmentGroup () {
      this.$textC.finishCurrentAlignmentGroup()
    },
    addToAlignmentGroup (token) {
      this.$textC.addToAlignmentGroup(token)
    },
    addHoverWord (token) {
      const activeAlignmentGroup = this.$textC.findAlignmentGroup(token)
      if (activeAlignmentGroup) {
        this.showAlignment = activeAlignmentGroup
      }
    },
    removeHoverWord (textWord) {
      this.showAlignment = []
    },
    clickEmptyText (textType) {
      this.finishCurrentAlignmentGroup()
      this.prevClickedWordType = null
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