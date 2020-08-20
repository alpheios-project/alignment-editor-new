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
          :inUnfinishedGroup = "updated && inUnfinishedGroup(token)"
          :firstInUnfinishedGroup = "updated && isFirstInUnfinishedGroup(token)"
        />
        <br v-if="token.hasLineBreak" />
      </template>
    </div>
</template>
<script>
import Vue from '@vue-runtime'

import Token from '@/vue/align-editor/token.vue'

export default {
  name: 'AlignEditorSingleBlock',
  components: {
    token: Token
  },
  props: {
    alignTextData: {
      type: Object,
      required: false
    },

    showAlignment: {
      type: Array,
      required: false
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
    alignTextClass () {
      return `alpheios-alignment-editor-align__${this.textType}`
    }
  },
  methods: {
    clickWord (token) {
      this.$emit('clickWord', token)
    },
    addHoverWord (token) {
      this.$emit('addHoverWord', token)
    },
    removeHoverWord (token) {
      this.$emit('removeHoverWord', token)
    },
    selectedToken (token) {
      return this.showAlignment.includes(token.idWord)
    },
    groupedToken (token) {
      return this.$alignedC.tokenIsGrouped(token)
    },
    inUnfinishedGroup (token) {
      return this.$alignedC.tokenInUnfinishedGroup(token)
    },
    isFirstInUnfinishedGroup (token) {
      return this.$alignedC.isFirstInUnfinishedGroup(token)
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
