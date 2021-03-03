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
            <br v-if="$store.state.tokenUpdated && token.hasLineBreak" />
          </template>
          
          <div class="alpheios-alignment-editor-align-text-segment__up-down" :style="backgroundStyle" v-if="showUpDown">
            <span class="alpheios-align-text-segment-button" @click="reduceHeight"><up-arrow /></span>
            <span class="alpheios-align-text-segment-button" @click="increaseHeight"><down-arrow /></span>
          </div>
    </div>
</template>
<script>
import Vue from '@vue-runtime'
import TokenBlock from '@/vue/align-editor/token-block.vue'
import ScrollUtility from '@/lib/utility/scroll-utility.js'

import UpArrow from '@/inline-icons/up-arrow.svg'
import DownArrow from '@/inline-icons/down-arrow.svg'

export default {
  name: 'SegmentBlock',
  components: {
    token: TokenBlock,
    upArrow: UpArrow,
    downArrow: DownArrow
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
    },

    amountOfShownTabs: {
      type: Number,
      required: false,
      default: 1
    }
  },
  data () {
    return {
      updated: 1,
      colors: ['#F8F8F8', '#e3e3e3', '#FFEFDB', '#dbffef', '#efdbff', '#fdffdb', '#ffdddb', '#dbebff'],
      originColor: '#F8F8F8',
      heightStep: 20,
      heightDelta: 0,
      heightUpdated: 1,
      showUpDown: false,
      minMaxHeight: 500
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
      return this.getCssId(this.textType, this.targetId, this.segment.index)
    },
    /**
     * Styles for creating a html table layout with different background-colors for different targetIds
     * @returns {String}
     */
    backgroundStyle () {
      if (this.textType === 'target') {
         return `background: ${this.colors[this.targetIdIndex]};`
      } else {
        return `background: ${this.originColor};`
      }
    },
    cssStyle () {
      let result 
      if (this.textType === 'target') {
        result = `order: ${this.segment.index}; ${this.backgroundStyle} max-height: ${this.maxHeight}px;`
      } else {
        result = `order: ${this.segment.index}; ${this.backgroundStyle} max-height: ${this.maxHeight}px;`
      }
      // this.showUpDown = this.$el && (this.$el.clientHeight < this.$el.scrollHeight)
      return result
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
    },
    amountOfSegments () {
      return this.$store.state.alignmentUpdated ? this.$alignedGC.getAmountOfSegments(this.segment) : 1
    },
    containerHeight () {
      return (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight) - 350
    },
    maxHeight () {
      const minHeight = this.minMaxHeight * (this.textType === 'origin') ? this.amountOfShownTabs : 1
      if (this.amountOfSegments === 1) {
        return this.containerHeight + this.heightDelta
      } 

      const heightCalculated = (this.textType === 'origin') ? this.containerHeight * this.amountOfShownTabs/this.amountOfSegments : this.containerHeight/this.amountOfSegments
      return Math.round(Math.max(minHeight, heightCalculated)) + this.heightDelta
    }
  },
  methods: {
    getCssId (textType, targetId, segmentIndex) {
      if (textType === 'target') {
        return `alpheios-align-text-segment-${textType}-${targetId}-${segmentIndex}`
      } else {
        return `alpheios-align-text-segment-${textType}-${segmentIndex}`
      }
    },
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
      this.makeScroll(token)
    },
    makeScroll (token) {
      const scrollData = this.$alignedGC.getOpositeTokenTargetIdForScroll(token)
      if (scrollData.length > 0) {
        const textTypeSeg = (token.textType === 'target') ? 'origin' : 'target'
        
        for (let i = 0; i < scrollData.length; i++) {
          const segId = this.getCssId(textTypeSeg, scrollData[i].targetId, this.segment.index)
          const tokId = `token-${scrollData[i].minOpositeTokenId}`

          ScrollUtility.makeScrollTo(tokId, segId)
        }
      }
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
    },
    reduceHeight () {
      this.heightDelta = this.heightDelta - this.heightStep
      this.heightUpdated++
    },
    increaseHeight () {
      this.heightDelta = this.heightDelta + this.heightStep
      this.heightUpdated++
    }
  }

}
</script>
<style lang="scss">
.alpheios-alignment-editor-align-text-segment {
  max-height: 400px;
  overflow-y: scroll;
  padding: 10px;
  position: relative;

  .alpheios-alignment-editor-align-text-segment__up-down {
    position: sticky;
    bottom: -15px;
    left: 0; right: 0;
    width: 100%;
    // background: #F8F8F8;
    background: transparent;
    text-align: right;
    padding: 5px;

    .alpheios-align-text-segment-button {
      display: inline-block;
      padding: 2px;
      height: 30px;
      width: 30px;
      cursor: pointer;
      border-radius: 10px;

        svg {
          display: inline-block;
          width: 100%;
          height: 100%;
          vertical-align: top;
        }
    }
  }
}
</style>