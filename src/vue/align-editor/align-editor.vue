<template>
  <div class="alpheios-alignment-editor-container" v-show="showAlignEditor">
      <h2>{{ $l10n.getMsg('ALIGN_EDITOR_HEADING') }} 
        (<span class="alpheios-alignment-editor-text-define-container__show-label" @click="toggleDefineAlignShow">{{ defineAlignShowLabel }}</span>)
      </h2>
      <div class="alpheios-alignment-editor-align-define-container" v-if="showAlignEditor" v-show="defineAlignShow">
          <align-editor-single-block
            :align-text-data="originAlignedText" :prefix-id = "1" 
            :show-alignment="showAlignment"
            @clickWord="clickWord" @addHoverWord="addHoverWord" @removeHoverWord="removeHoverWord"
            @clickEmptyText="clickEmptyText"
          />
          <align-editor-single-block 
            :align-text-data="targetAlignedText" :prefix-id = "2"
            :show-alignment="showAlignment"
            @clickWord="clickWord" @addHoverWord="addHoverWord" @removeHoverWord="removeHoverWord"
            @clickEmptyText="clickEmptyText"
          />
      </div>
  </div>
</template>
<script>
import Vue from '@vue-runtime'
import AlignEditorSingleBlock from '@/vue/align-editor/align-editor-single-block.vue'

export default {
  name: 'AlignEditor',
  components: {
    alignEditorSingleBlock: AlignEditorSingleBlock
  },
  props: {
    showEditor: {
      type: Number,
      required: false
    }
  },
  data () {
    return {
      defineAlignShow: false,
      prevClickedWordType: null,
      showAlignment: [],
      originUpdated: 1,
      targetUpdated: 1
    }
  },
  watch: {
    showEditor () {
      this.defineAlignShow = true
      this.updateOriginEditor()
      this.updateTargetEditor()
    }
  },
  computed: {
    defineAlignShowLabel () {
      return this.defineAlignShow ? this.$l10n.getMsg('ALIGN_EDITOR_HIDE') : this.$l10n.getMsg('ALIGN_EDITOR_SHOW')
    },
    showAlignEditor () {
      return this.originAlignedText && this.originAlignedText.tokens && this.targetAlignedText && this.targetAlignedText.tokens
    },
    originAlignedText () {
      return this.originUpdated ? this.$textC.originAlignedText : {}
    },
    targetAlignedText () {
      return this.targetUpdated ? this.$textC.targetAlignedText : {}
    }
  },
  methods: {
    updateOriginEditor () {
      this.originUpdated = this.originUpdated + 1
    },

    updateTargetEditor () {
      this.targetUpdated = this.targetUpdated + 1
    },

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