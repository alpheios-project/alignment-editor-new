<template>
    <div class="alpheios-alignment-editor-align-text-segment" 
         :id = "cssId" :style="orderStyle"
         :class = "cssClass" :dir = "direction" :lang = "lang" 
          >
        <template v-for = "token in segment.tokens">
          <token
            v-if ="token.word"
            :text-type = "textType" :text-word = "token" :key = "token.idWord"
            @click-token = "clickToken"
            @add-hover-token = "addHoverToken"
            @remove-hover-token = "removeHoverToken"
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
import TokenBlock from '@/vue/align-editor/token-block.vue'

export default {
  name: 'AlignEditorSingleBlock',
  components: {
    token: TokenBlock
  },
  props: {
    segment: {
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
    },

    isLast : {
      type: Boolean,
      required: false,
      default: false
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
      return this.segment.textType
    },
    direction () {
      return this.segment.direction
    },
    lang () {
      return this.segment.lang
    },
    cssId () {
      return `alpheios-align-text-segment-${this.textType}-${this.segment.index}`
    },
    orderStyle () {
      return `order: ${this.segment.index};`
    },
    cssClass () {
      let classes = {}
      classes[`alpheios-align-text-segment-${this.textType}`] = true
      classes[`alpheios-align-text-segment-${this.textType}-last`] = this.isLast
      return classes
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
</style>