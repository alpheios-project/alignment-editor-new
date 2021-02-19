<template>
      <div class = "alpheios-al-editor-segment-block-text" 
          :class = "{ 'alpheios-al-editor-segment-block-text__no-langname': !showLangName }"
          :id = "cssId" :style="cssStyle"
          :dir = "dir" :lang = "lang"
      >
        <lang-name-bar :langName = "langName" v-show="showLangName" :metadata = "metadata" @updateMetadataHeight = "updateMetadataHeight"/>

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

</template>
<script>
import TokenBlock from '@/_output/vue/token-block.vue'
import LangNameBar from '@/_output/vue/lang-name-bar.vue'

export default {
  name: 'OriginSegmentBlock',
  components: {
    tokenBlock: TokenBlock,
    langNameBar: LangNameBar
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
    metadata: {
      type: String,
      required: false,
      defult: ''
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
    },
    showLangName: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data () {
    return {
      originColor: '#F8F8F8',
      paddingTop: 30
    }
  },
  computed: {
    cssId () {
      return `alpheios-align-text-segment-origin-${this.segIndex}`
    },
    cssStyle () {
      return `order: ${this.segIndex}; background: ${this.originColor}; max-height: ${this.maxHeight}px; padding-top: ${this.paddingTop}px;`
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
    },
    updateMetadataHeight (height) {
      this.paddingTop = height
    }
  }
}
</script>
<style lang="scss">
  .alpheios-al-editor-segment-block-text {
    position: relative;
    padding: 30px 10px 10px;
    overflow-y: scroll;

    &.alpheios-al-editor-segment-block-text__no-langname {
      padding: 10px;
    }

    .alpheios-al-editor-segment-block-text__langname {
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