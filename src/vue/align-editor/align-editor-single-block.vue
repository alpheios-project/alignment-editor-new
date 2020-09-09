<template>
    <div class  ="alpheios-alignment-editor-align-text"
         :class = "alignTextClass" 
         :dir = "direction" :lang = "lang" 
    >
      <template v-for = "token in alignTextData.tokens">
        <token
          v-if ="token.word"
          :text-type = "textType" :text-word = "token" :key = "token.idWord"
          @clickWord = "clickWord"
          @addHoverWord = "addHoverWord"
          @removeHoverWord = "removeHoverWord"
          :selected = "updated && selectedToken(token)"
          :grouped = "updated && groupedToken(token)"
          :inActiveGroup = "updated && inActiveGroup(token)"
          :firstInActiveGroup = "updated && isFirstInActiveGroup(token)"
        />
        <br v-if="token.hasLineBreak" />
      </template>
    </div>
</template>
<script>
import Vue from '@vue-runtime'

import TokenBlock from '@/vue/align-editor/token-block.vue'

export default {
  name: 'AlignEditorSingleBlock',
  components: {
    token: TokenBlock
  },
  props: {
    alignTextData: {
      type: Object,
      required: true
    },

    showAlignment: {
      type: Array,
      required: false,
      default: []
    },

    alignmentUpdated : {
      type: Number,
      required: false,
      default: 0
    }
  },
  data () {
    return {
      updated: 1
    }
  },
  watch: {
    /**
     * Catches alignmentUpdated and increments updated flag to redraw css styles
     */
    alignmentUpdated () {
      this.updated = this.updated + 1
    }
  },
  computed: {
    textType () {
      return this.alignTextData.textType
    },
    direction () {
      return this.alignTextData.direction
    },
    lang () {
      return this.alignTextData.lang
    },
    /**
     * Defines the main class for the block depending on textType (origin/target)
     */
    alignTextClass () {
      return `alpheios-alignment-editor-align__${this.textType}`
    }
  },
  methods: {
    clickToken (token) {
      this.$emit('click-token', token)
    },
    addHoverToken (token) {
      this.$emit('add-hover-token', token)
    },
    removeHoverToken () {
      this.$emit('remove-hover-token')
    },
    /**
     * Used for defining that token is in hovered saved alignmentGroup
     */
    selectedToken (token) {
      return this.showAlignment.includes(token.idWord)
    },
    /**
     * Used for defining that token is in some saved alignmentGroup
     */
    groupedToken (token) {
      return this.$alignedC.tokenIsGrouped(token)
    },
    /**
     * Used for defining that token is in active alignmentGroup
     */
    inActiveGroup (token) {
      return this.$alignedC.tokenInActiveGroup(token)
    },
    /**
     * Used for defining that token is in active alignmentGroup
     */
    isFirstInActiveGroup (token) {
      return this.$alignedC.isFirstInActiveGroup(token)
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-align-text {
        float: left;
        width: 50%;
    }

    .alpheios-alignment-editor-align__origin {
        border-right: 2px solid #ddd;
        padding-right: 20px;
    }

    .alpheios-alignment-editor-align__target {
        padding-left: 20px;
    }

</style>
