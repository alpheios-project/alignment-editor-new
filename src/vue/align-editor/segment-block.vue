<template>
    <div class="alpheios-alignment-editor-align-text-segment" 
         :id = "cssId" :style="cssStyle"
         :class = "cssClass" :dir = "direction" :lang = "lang" 
          >
        <template v-for = "token in segment.tokens">
          <token
            v-if ="token.word"
            :text-type = "textType" :text-word = "token" :key = "token.idWord"
            @click-token = "clickToken"
            @add-hover-token = "addHoverToken"
            @remove-hover-token = "removeHoverToken"
            :selected = "$store.state.alignmentUpdated && selectedToken(token)"
            :grouped = "$store.state.alignmentUpdated && groupedToken(token)"
            :inActiveGroup = "$store.state.alignmentUpdated && inActiveGroup(token)"
            :firstInActiveGroup = "$store.state.alignmentUpdated && isFirstInActiveGroup(token)"
          />
          <br v-if="token.hasLineBreak" />
        </template>
    </div>
</template>
<script>
import TokenBlock from '@/vue/align-editor/token-block.vue'

export default {
  name: 'SegmentBlock',
  components: {
    token: TokenBlock
  },
  props: {
    currentTargetId: {
      type: String,
      required: false
    },

    segment: {
      type: Object,
      required: true
    },

    isLast : {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      updated: 1,
      colors: ['e3e3e3', '#FFEFDB', '#dbffef', '#efdbff', '#fdffdb', '#ffdddb', '#dbebff']
    }
  },
  watch: {
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
      return `alpheios-align-text-segment-${this.textType}-${this.targetId ? this.targetId : 'none' }-${this.segment.index}`
    },
    cssStyle () {
      return `order: ${this.segment.index}; background: ${this.colors[this.targetIdIndex]};`
    },
    cssClass () {
      let classes = {}
      classes[`alpheios-align-text-segment-${this.textType}`] = true
      classes[`alpheios-align-text-segment-${this.textType}-last`] = this.isLast
      return classes
    },
    targetId () {
      return (this.segment.textType === 'target') ? this.segment.docSourceId : ''
    },
    allTargetTextsIds () {
      return this.$store.state.alignmentUpdated ? this.$textC.allTargetTextsIds : []
    },
    targetIdIndex () {
      return this.targetId ? this.allTargetTextsIds.indexOf(this.targetId) : null
    }
  },
  methods: {
    clickToken (token) {
      if (this.currentTargetId) {
        this.$alignedC.clickToken(token, this.currentTargetId)
      }
    },
    addHoverToken (token) {
      this.$alignedC.activateHoverOnAlignmentGroups(token, this.currentTargetId)
    },
    removeHoverToken () {
      this.$alignedC.clearHoverOnAlignmentGroups()
    },
    /**
     * Used for defining that token is in hovered saved alignmentGroup
     */
    selectedToken (token) {
      return this.$alignedC.selectedToken(token, this.currentTargetId)
    },
    /**
     * Used for defining that token is in some saved alignmentGroup
     */
    groupedToken (token) {
      return this.$alignedC.tokenIsGrouped(token, this.currentTargetId)
    },
    /**
     * Used for defining that token is in active alignmentGroup
     */
    inActiveGroup (token) {
      return this.$alignedC.tokenInActiveGroup(token, this.currentTargetId)
    },
    /**
     * Used for defining that token is in active alignmentGroup
     */
    isFirstInActiveGroup (token) {
      return this.$alignedC.isFirstInActiveGroup(token, this.currentTargetId)
    }
  }

}
</script>
<style lang="scss">
</style>