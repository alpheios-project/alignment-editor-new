<template>
    <div class="alpheios-alignment-editor-align-text-segment-edit" 
         :id = "cssId" :style="cssStyle"
         :class = "cssClass" :dir = "direction" :lang = "lang" 
          >
        <actions-menu-token-edit 
            :token = "actionsToken" v-show="showActionsMenuFlag"
            :leftPos = "actionsMenuLeft" :topPos = "actionsMenuTop"
            :containerWidth = "containerWidth"

            @updateTokenWord = "updateTokenWord"
            @mergeToken = "mergeToken"
            @splitToken = "splitToken"
            @addLineBreak = "addLineBreak"
            @removeLineBreak = "removeLineBreak"
            @moveToNextSegment = "moveToNextSegment"
            @moveToPrevSegment = "moveToPrevSegment"
            @deleteToken = "deleteToken"
        />
        <empty-tokens-input :text-type = "textType" :textId="targetId" input-type="start" v-if="segment.index === 1"/>

        <template v-for = "(token, tokenIndex) in allTokens">
          <token-edit-block
            v-if ="token.word"
            :token = "token" :key = "tokenIndex" :deactivated = "deactivated"
            :updateTokenIdWord = "updateTokenIdWord === token.idWord ? updateTokenIdWord : null"
            :mergeTokenPrevIdWord = "mergeTokenPrevIdWord === token.idWord ? mergeTokenPrevIdWord : null"
            :mergeTokenNextIdWord = "mergeTokenNextIdWord === token.idWord ? mergeTokenNextIdWord : null"
            :splitTokenIdWord = "splitTokenIdWord === token.idWord ? splitTokenIdWord : null"
            :addLineBreakIdWord = "addLineBreakIdWord === token.idWord ? addLineBreakIdWord : null"
            :removeLineBreakIdWord = "removeLineBreakIdWord === token.idWord ? removeLineBreakIdWord : null"

            @hideActionsMenu = "hideActionsMenu" 
            @showActionsMenu = "showActionsMenu"
            @removeAllActivated = "removeAllActivatedEvent"

          />
          <br v-if="$store.state.tokenUpdated && token.hasLineBreak" />
        </template>

        <empty-tokens-input :text-type = "textType" :textId="targetId" input-type="end" v-if="segment.index === amountOfSegments"/>
    </div>
</template>
<script>
import Vue from '@vue-runtime'
import TokenEditBlock from '@/vue/tokens-editor/token-edit-block.vue'
import ActionsMenuTokenEdit from '@/vue/tokens-editor/actions-menu-token-edit.vue'

import HistoryStep from '@/lib/data/history/history-step.js'
import EmptyTokensInput from '@/vue/tokens-editor/empty-tokens-input.vue'

export default {
  name: 'SegmentEditBlock',
  components: {
    tokenEditBlock: TokenEditBlock,
    actionsMenuTokenEdit: ActionsMenuTokenEdit,
    emptyTokensInput: EmptyTokensInput
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

    isLast: {
      type: Boolean,
      required: false,
      default: false
    },

    blockTokensActionsFlag: {
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
      showActionsMenuFlag: false,
      actionsToken: null,
      actionsMenuLeft: 0,
      actionsMenuTop: 0,
      deactivated: 1,
      containerWidth: 0,

      updateTokenIdWord: null,
      mergeTokenPrevIdWord: null,
      mergeTokenNextIdWord: null,
      splitTokenIdWord: null,
      addLineBreakIdWord: null,
      removeLineBreakIdWord: null
    }
  },
  watch: {
    blockTokensActionsFlag () {
      this.removeAllActivated()
    }
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
      return this.$store.state.alignmentUpdated && this.segment.lang
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
    },
    amountOfSegments () {
      return this.$alignedGC.getAmountOfSegments(this.segment)
    }
  },
  methods: {
    hideActionsMenu () {
      this.showActionsMenuFlag = false
    },
    showActionsMenu (data) {
      
      this.actionsToken = data.token
      this.actionsMenuLeft = data.leftPos
      this.actionsMenuTop = data.topPos
      this.containerWidth = this.$el.offsetWidth

      this.showActionsMenuFlag = true
    },
    removeAllActivatedEvent () {
      this.$emit('removeAllActivated')
    },
    removeAllActivated () {
      this.showActionsMenuFlag = false
      this.deactivated++
    },
    async clearPrevIdWord (token, typeName) {
      if (token.idWord === this[typeName]) {
        this[typeName] = null
        await Vue.nextTick()
      }
    },
    async updateTokenWord (token) {
      await this.clearPrevIdWord(token, 'updateTokenIdWord')
      this.updateTokenIdWord = token.idWord
    },
    async mergeToken (token, direction) {
      if (direction === HistoryStep.directions.PREV) {
        await this.clearPrevIdWord(token, 'mergeTokenPrevIdWord')
        this.mergeTokenPrevIdWord = token.idWord
      }
      if (direction === HistoryStep.directions.NEXT) {
        await this.clearPrevIdWord(token, 'mergeTokenNextIdWord')
        this.mergeTokenNextIdWord = token.idWord
      }
    },
    async splitToken (token) {
      await this.clearPrevIdWord(token, 'splitTokenIdWord')
      this.splitTokenIdWord = token.idWord
    },
    async addLineBreak (token) {
      await this.clearPrevIdWord(token, 'removeLineBreakIdWord')
      this.addLineBreakIdWord = token.idWord
    },
    async removeLineBreak (token) {
      await this.clearPrevIdWord(token, 'removeLineBreakIdWord')
      this.removeLineBreakIdWord = token.idWord
    },
    moveToNextSegment (token) {
      this.$tokensEC.moveToSegment(token, HistoryStep.directions.NEXT)
      this.removeAllActivated()
    },
    moveToPrevSegment (token) {
      this.$tokensEC.moveToSegment(token, HistoryStep.directions.PREV)
      this.removeAllActivated()
    },
    deleteToken (token) {
      this.$tokensEC.deleteToken(token)
      this.removeAllActivated()
    }
  }

}
</script>
<style lang="scss">
  .alpheios-alignment-editor-align-text-segment-edit {
    position: relative;
  }
</style>