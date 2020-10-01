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
    segment: {
      type: Object,
      required: true
    },

    showAlignment: {
      type: Array,
      required: false,
      default: []
    },

    isLast : {
      type: Boolean,
      required: false,
      default: false
    },

    targetId : {
      type: String,
      required: false,
      default: ''
    },

    targetIdIndex: {
      type: Number,
      required: false,
      default: 0
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
    }
  },
  methods: {
    clickToken (token) {
      this.$emit('click-token', token, this.segment)
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
      return this.showAlignment.some(alGroupData => {
        return (alGroupData.segmentIndex === this.segment.index) &&
                (token.textType === 'origin' || !this.targetId || alGroupData.targetId === this.targetId) &&  
                alGroupData.ids.includes(token.idWord)
      })
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