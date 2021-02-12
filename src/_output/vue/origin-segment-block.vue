<template>
    <div class="alpheios-alignment-editor-align-segment-data-item alpheios-alignment-editor-align-segment-data-origin" >
        
        <div class="alpheios-alignment-editor-align-text-segment alpheios-align-text-segment-origin" 
            :id = "cssId" :style="cssStyle"
            :dir = "dir" :lang = "lang"
        >
          <span class="alpheios-align-text-segment__langname">{{ langName }}</span>
            <template v-for = "(token, tokenIndex) in segmentData.origin.tokens">
                <token-block :key = "tokenIndex" :token="token" 
                                :selected = "selectedToken(token)"
                                :grouped = "groupedToken(token)"
                                @addHoverToken = "$emit('addHoverToken', token)"
                                @removeHoverToken = "$emit('removeHoverToken', token)"
                />
                <br v-if="token.hasLineBreak" />
            </template>
        </div>
    </div>
</template>
<script>
import TokenBlock from '@/_output/vue/token-block.vue'

export default {
  name: 'OriginSegmentBlock',
  components: {
    tokenBlock: TokenBlock
  },
  props: {
    segmentData: {
      type: Object,
      required: true
    },
    segIndex: {
      type: Number,
      required: true
    },
    maxHeight: {
      type: Number,
      required: true
    },
    dir: {
      type: String,
      required: true
    },
    lang: {
      type: String,
      required: true
    },
    langName: {
      type: String,
      required: true
    },
    shownTabs: {
      type: Array,
      required: false,
      default: () => { return [] }
    },
    hoveredGroupsId: {
      type: Array,
      required: false,
      default: () => { return [] }
    }
  },
  data () {
    return {
      originColor: '#F8F8F8',
    }
  },
  computed: {
    cssId () {
      return `alpheios-align-text-segment-origin-${this.segIndex}`
    },
    cssStyle () {
      return `order: ${this.segIndex}; background: ${this.originColor}; max-height: ${this.maxHeight}px`
    },
  },
  methods: {
    isShownTab (targetId) {
      return this.shownTabs.includes(targetId)
    },
    groupedToken (token) {
      return token.grouped && ((this.shownTabs.length === 0) || token.groupData.some(groupdataItem => this.isShownTab(groupdataItem.targetId)))
    },
    isTokenInHovered (token) {
      return token.groupData.some(groupDataItem => this.hoveredGroupsId.includes(groupDataItem.groupId) ) 
    },
    selectedToken (token) {
      return this.hoveredGroupsId && (this.hoveredGroupsId.length > 0) && this.groupedToken(token) && this.isTokenInHovered(token)
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-align-text-segment {
    position: relative;
    padding-top: 30px;

    .alpheios-align-text-segment__langname {
      position: absolute;
      overflow-y: hidden;
      border-bottom: 0;
      top: 0;
      right: 0;
      left: 0;
      margin: 0;
      padding: 0;
      text-align: right;
      padding: 5px;
      font-size: 90%;

      background: #185F6D;
      color: #fff;
      z-index: 100;
    }
  }
</style>