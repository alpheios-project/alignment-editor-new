<template>
      <div class = "alpheios-al-editor-segment-block-text" 
          :class = "cssClass"
          :id = "cssId" :style="cssStyle"
          :dir = "dir" :lang = "lang"
      >
        <lang-name-bar :langName = "langName" v-show="showLangName" 
                       :metadata = "metadata" @updateMetadataHeight = "updateMetadataHeight"
                       :showData = "showDataLangNameBar"
        />

          <template v-for = "(token, tokenIndex) in segmentData.tokens">
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
  name: 'SegmentBlock',
  components: {
    tokenBlock: TokenBlock,
    langNameBar: LangNameBar
  },
  props: {
    textType: {
      type: String,
      required: true
    },
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
    },
    targetIdIndex: {
      type: Number,
      required: false,
      default: 0
    },
    isLast: {
      type: Boolean,
      required: false,
      default: false
    },
    changeColor: {
      type: String,
      required: false,
      default: 'byTargetId'
    }
  },
  data () {
    return {
      colors: ['#F8F8F8', '#e3e3e3', '#FFEFDB', '#dbffef', '#efdbff', '#fdffdb', '#ffdddb', '#dbebff'],
      paddingTop: null
    }
  },
  computed: {
    cssId () {
      return `alpheios-align-text-segment-${this.textType}-${this.segIndex}`
    },
    cssStyle () {
      const colors = this.changeColor === 'byTargetId' ? `background: ${this.colors[this.targetIdIndex]};` : `background: transparent;`
      let styles = `order: ${this.segIndex}; ${colors} max-height: ${this.maxHeight}px;`

      if (this.paddingTop) {
        styles = `${styles} padding-top: ${this.paddingTop}px;`
      }
      return styles
    },
    showDataLangNameBar () {
      return this.segIndex === 0
    },
    cssClass () {
      return {
        'alpheios-al-editor-segment-block-text__no-langname': !this.showLangName,
        [`alpheios-align-text-segment-${this.textType}-${this.segIndex}`]: true,
        [`alpheios-al-editor-segment-cell-${this.textType}-row`]: true,
        [`alpheios-align-text-segment-${this.textType}`]: true,
        [`alpheios-align-text-segment-${this.textType}-last`]: this.isLast
      }
    }
  },
  methods: {
    isShownTab (targetId) {
      return this.shownTabs.length === 0 || this.shownTabs.includes(targetId)
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
  .alpheios-al-editor-segment-cell-origin-row {
    position: relative;
    padding: 10px;
    overflow-y: scroll;

    &.alpheios-align-text-segment-origin-0 {
      padding-top: 30px;
    }

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

  .alpheios-al-editor-segment-cell-target-row {
    &.alpheios-align-text-segment-target-0.alpheios-al-editor-segment-cell-target-row {
      padding-top: 30px;
    }
  }
</style>