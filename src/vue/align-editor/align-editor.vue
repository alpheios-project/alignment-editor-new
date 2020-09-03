<template>
  <div class="alpheios-alignment-editor-container" v-show="showAlignEditor">
      <h2>{{ l10n.getMsgS('ALIGN_EDITOR_HEADING') }} 
        (<span class="alpheios-alignment-editor-text-define-container__show-label" @click="toggleDefineAlignShow">{{ defineAlignShowLabel }}</span>)
      </h2>
      <div class="alpheios-alignment-editor-align-define-container" v-if="showAlignEditor" v-show="defineAlignShow">
          <align-editor-single-block
            :align-text-data="originAlignedText" 
            :show-alignment="showAlignment"
            :alignment-updated = "alignmentUpdated"
            @clickWord="clickWord" @addHoverWord="addHoverWord" @removeHoverWord="removeHoverWord"
          />
          <align-editor-single-block 
            :align-text-data="targetAlignedText"
            :show-alignment="showAlignment"
            :alignment-updated = "alignmentUpdated"
            @clickWord="clickWord" @addHoverWord="addHoverWord" @removeHoverWord="removeHoverWord"
          />
      </div>
  </div>
</template>
<script>
import Vue from '@vue-runtime'
import AlignEditorSingleBlock from '@/vue/align-editor/align-editor-single-block.vue'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

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
      showAlignment: [],
      originUpdated: 1,
      targetUpdated: 1,
      alignmentUpdated: 1
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
      return this.defineAlignShow ? this.l10n.getMsgS('ALIGN_EDITOR_HIDE') : this.l10n.getMsgS('ALIGN_EDITOR_SHOW')
    },
    showAlignEditor () {
      return this.originAlignedText && this.originAlignedText.tokens && this.targetAlignedText && this.targetAlignedText.tokens
    },
    originAlignedText () {
      return this.originUpdated ? this.$alignedC.originAlignedText : {}
    },
    targetAlignedText () {
      return this.targetUpdated ? this.$alignedC.targetAlignedText : {}
    },
    l10n () {
      return L10nSingleton
    }
  },
  methods: {
    updateTokenClasses () {
      this.alignmentUpdated = this.alignmentUpdated + 1
    },
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
      this.$alignedC.clickToken(token)
      this.updateTokenClasses()
    },
    addHoverWord (token) {
      this.showAlignment = this.$alignedC.findAlignmentGroupIds(token)
      this.updateTokenClasses()
    },
    removeHoverWord (textWord) {
      this.showAlignment = []
      this.updateTokenClasses()
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