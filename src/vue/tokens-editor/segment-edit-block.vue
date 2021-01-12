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
        />
        <template v-for = "token in allTokens">
          <token-edit-block
            v-if ="token.word"
            :token = "token" :key = "token.idWord" :deactivated = "deactivated"
            :updateTokenIdWord = "updateTokenIdWord === token.idWord ? updateTokenIdWord : null"
            :mergeTokenLeftIdWord = "mergeTokenLeftIdWord === token.idWord ? mergeTokenLeftIdWord : null"
            :mergeTokenRightIdWord = "mergeTokenRightIdWord === token.idWord ? mergeTokenRightIdWord : null"
            :splitTokenIdWord = "splitTokenIdWord === token.idWord ? splitTokenIdWord : null"

            @hideActionsMenu = "hideActionsMenu" 
            @showActionsMenu = "showActionsMenu"
            @removeAllActivated = "removeAllActivated"
          />
          <br v-if="token.hasLineBreak" />
        </template>
    </div>
</template>
<script>
import TokenEditBlock from '@/vue/tokens-editor/token-edit-block.vue'
import ActionsMenuTokenEdit from '@/vue/tokens-editor/actions-menu-token-edit.vue'

export default {
  name: 'SegmentEditBlock',
  components: {
    tokenEditBlock: TokenEditBlock,
    actionsMenuTokenEdit: ActionsMenuTokenEdit
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
      originColor: '#F8F8F8',
      showActionsMenuFlag: false,
      actionsToken: null,
      actionsMenuLeft: 0,
      actionsMenuTop: 0,
      deactivated: 1,
      containerWidth: 0,
      updateTokenIdWord: null,
      mergeTokenLeftIdWord: null,
      mergeTokenRightIdWord: null,
      splitTokenIdWord: null
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
      return this.$store.state.alignmentUpdated && this.$alignedC.alignmentGroupsWorkflowAvailable
    },
    allTokens () {
      return  this.$store.state.tokenUpdated ? this.segment.tokens : []
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
    removeAllActivated () {
      this.showActionsMenuFlag = false
      this.deactivated++
    },
    updateTokenWord (token) {
      this.updateTokenIdWord = token.idWord
    },
    mergeToken (token, direction) {
      if (direction === 'left') {
        this.mergeTokenLeftIdWord = token.idWord
      }
      if (direction === 'right') {
        this.mergeTokenRightIdWord = token.idWord
      }
    },
    splitToken (token) {
      this.splitTokenIdWord = token.idWord
    }
  }

}
</script>
<style lang="scss">
  .alpheios-alignment-editor-align-text-segment-edit {
    position: relative;
  }
</style>