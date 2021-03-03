<template>
    <div class="alpheios-al-editor-segment-cell-target-row" 
        :id = "cssId" :style="cssStyle"
        :class = "cssClass" :dir = "dir" :lang = "lang"
    >
        <lang-name-bar :langName = "langName" :metadata = "metadata" @updateMetadataHeight = "updateMetadataHeight" />
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
  name: 'TargetSegmentBlock',
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
    dir: {
      type: String,
      required: true
    },
    maxHeight: {
      type: Number,
      required: true
    },
    targetId: {
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
      required: true
    },
    isLast: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      colors: ['#F8F8F8', '#e3e3e3', '#FFEFDB', '#dbffef', '#efdbff', '#fdffdb', '#ffdddb', '#dbebff'],
      paddingTop: 30
    }
  },
  computed: {
    cssId () {
      return `alpheios-align-text-segment-target-${this.targetId}-${this.segIndex}`
    },
    cssStyle () {
      return `order: ${this.segIndex}; background: ${this.colors[this.targetIdIndex]}; max-height: ${this.maxHeight}px; padding-top: ${this.paddingTop}px;`
    },
    cssClass () {
      let classes = {}
      classes[`alpheios-align-text-segment-target`] = true
      classes[`alpheios-align-text-segment-target-last`] = this.isLast
      return classes
    },
  },
  methods: {
    isShownTab () {
      return this.shownTabs.includes(this.targetId)
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