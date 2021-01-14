<template>
    <div class="alpheios-alignment-editor-align-text-segment" 
         :id = "cssId" :style="cssStyle"
         :class = "cssClass" :dir = "direction" :lang = "lang" 
          >
        <template v-for = "(token, tokenIndex) in allTokens">
          <token
            v-if ="token.word"
            :token = "token" :key = "tokenIndex"
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
      colors: ['#F8F8F8', '#e3e3e3', '#FFEFDB', '#dbffef', '#efdbff', '#fdffdb', '#ffdddb', '#dbebff'],
      originColor: '#F8F8F8'
    }
  },
  watch: {
  },
  computed: {
    /**
     * @returns {String} - origin/target
     */
    textType () {
      return this.segment.textType
    },
    /**
     * @returns {String} - ltr/rtl
     */
    direction () {
      return this.segment.direction
    },
    /**
     * @returns {String} - lang code
     */
    lang () {
      return this.segment.lang
    },
    /**
     * @returns {String} css id for html layout
     */
    cssId () {
      if (this.textType === 'target') {
        return `alpheios-align-text-segment-${this.textType}-${this.targetId}-${this.segment.index}`
      } else {
        return `alpheios-align-text-segment-${this.textType}-${this.segment.index}`
      }
    },
    /**
     * Styles for creating a html table layout with different background-colors for different targetIds
     * @returns {String}
     */
    cssStyle () {
      if (this.textType === 'target') {
        return `order: ${this.segment.index}; background: ${this.colors[this.targetIdIndex]};`
      } else {
        return `order: ${this.segment.index}; background: ${this.originColor};`
      }
    },
    /**
     * Defines classes by textType and isLast flag
     * @returns {Object}
     */
    cssClass () {
      let classes = {}
      classes[`alpheios-align-text-segment-${this.textType}`] = true
      classes[`alpheios-align-text-segment-${this.textType}-last`] = this.isLast
      return classes
    },
    /**
     * @returns {Array[String]} - array of all targetIds
     */
    allTargetTextsIds () {
      return this.$store.state.alignmentUpdated ? this.$textC.allTargetTextsIds : []
    },
    /**
     * @returns {Number | Null} - if it is a target segment, then it returns targetId order index, otherwise - null
     */
    targetIdIndex () {
      return this.targetId ? this.allTargetTextsIds.indexOf(this.targetId) : null
    },
    /**
     * @returns {String | Null} - if it is a target segment, returns targetId otherwise null
     */
    targetId () {
      return (this.segment.textType === 'target') ? this.segment.docSourceId : null
    },
    alignmentGroupsWorkflowAvailable () {
      return this.$store.state.alignmentUpdated && this.$alignedGC.alignmentGroupsWorkflowAvailable
    },
    allTokens () {
      return  this.$store.state.tokenUpdated ? this.segment.tokens : []
    }
  },
  methods: {
    /**
     * Starts click token workflow
     * @param {Token}
     */
    clickToken (token) {
      if (this.alignmentGroupsWorkflowAvailable && this.currentTargetId) {
        this.$alignedGC.clickToken(token, this.currentTargetId)
      }
    },
    /**
     * Starts hover token workflow
     * @param {Token}
     */
    addHoverToken (token) {
      this.$alignedGC.activateHoverOnAlignmentGroups(token, this.currentTargetId)
    },
    /**
     * Ends hover token workflow
     */
    removeHoverToken () {
      this.$alignedGC.clearHoverOnAlignmentGroups()
    },
    /**
     * Used for defining that token is in hovered saved alignmentGroup
     * @param {Token}
     */
    selectedToken (token) {
      return this.$alignedGC.selectedToken(token, this.currentTargetId)
    },
    /**
     * Used for defining that token is in some saved alignmentGroup
     * @param {Token}
     */
    groupedToken (token) {
      return this.$alignedGC.tokenIsGrouped(token, this.currentTargetId)
    },
    /**
     * Used for defining that token is in active alignmentGroup
     * @param {Token}
     */
    inActiveGroup (token) {
      return this.$alignedGC.tokenInActiveGroup(token, this.currentTargetId)
    },
    /**
     * Used for defining that token is in active alignmentGroup
     * @param {Token}
     */
    isFirstInActiveGroup (token) {
      return this.$alignedGC.isFirstInActiveGroup(token, this.currentTargetId)
    }
  }

}
</script>
<style lang="scss">
</style>