<template>
    <div class="alpheios-alignment-editor-align-text-segment" 
         :style="cssStyle"
         :class = "cssClass" 
          >
          <p class="alpheios-alignment-editor-align-text-segment-row" v-if="isFirst">
            <span class="alpheios-alignment-editor-align-text-segment-row__langname" >{{ segment.langName }}</span>

            <metadata-icons :text-type = "textType" :text-id = "segment.docSourceId" @showModalMetadata = "showModalMetadata = true" />
          </p>
          <p class="alpheios-alignment-editor-align-text-parts" v-if="allPartsKeys.length > 1">
            <span class="alpheios-alignment-editor-align-text-parts-link" 
                  :class = "{ 'alpheios-alignment-editor-align-text-parts-link-current': currentPartIndex === parseInt(partKey) }"
                  v-for = "partKey in allPartsKeys" :key="partKey"
                  @click="clickPart(partKey)"
            >
                  {{ partKey }}
            </span>
          </p>
          <div class="alpheios-alignment-editor-align-text-segment-tokens" :id = "cssId" :style="cssStyleSeg" :dir = "direction" :lang = "lang" >
            <p class="alpheios-alignment-editor-align-text-single-link" v-if="currentPartIndex > allPartsKeys[0]">
              <span class="alpheios-alignment-editor-align-text-parts-link" @click="clickPart(currentPartIndex-1)">prev</span>
            </p>

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
            
            <p class="alpheios-alignment-editor-align-text-single-link" v-if="currentPartIndex < allPartsKeys[allPartsKeys.length-1]">
              <span class="alpheios-alignment-editor-align-text-parts-link" @click="clickPart(currentPartIndex+1)">next</span>  
            </p>
          </div>

          <metadata-block :text-type = "textType" :text-id = "segment.docSourceId" :showModal="showModalMetadata" @closeModal = "showModalMetadata = false"  v-if="isFirst"/>
    </div>
</template>
<script>
import Vue from '@vue-runtime'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import TokenBlock from '@/vue/align-editor/token-block.vue'
import ScrollUtility from '@/lib/utility/scroll-utility.js'
import NoMetadataIcon from '@/inline-icons/no-metadata.svg'
import HasMetadataIcon from '@/inline-icons/has-metadata.svg'
import Tooltip from '@/vue/common/tooltip.vue'
import MetadataBlock from '@/vue/text-editor/metadata-block.vue'
import MetadataIcons from '@/vue/common/metadata-icons.vue'

export default {
  name: 'SegmentBlock',
  components: {
    token: TokenBlock,
    tooltip: Tooltip,
    noMetadataIcon: NoMetadataIcon,
    hasMetadataIcon: HasMetadataIcon,
    metadataBlock: MetadataBlock,
    metadataIcons: MetadataIcons
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
    },

    isFirst: {
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
      heightStep: 20,
      heightDelta: 0,
      heightUpdated: 1,
      showUpDown: false,
      minMaxHeight: 500,
      showModalMetadata: false,
      currentPartIndex: 1
    }
  },
  watch: {
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
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
        result = `order: ${this.segment.index};`
      } else {
        result = `order: ${this.segment.index};`
      }
      return result
    },
    cssStyleSeg () {
      let result 
      if (this.textType === 'target') {
        result = `${this.backgroundStyle} max-height: ${this.maxHeight}px;`
      } else {
        result = `${this.backgroundStyle} max-height: ${this.maxHeight}px;`
      }
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
      classes[`alpheios-align-text-segment-first`] = this.isFirst
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
    allPartsKeys () {
      return  this.$store.state.tokenUpdated ? Object.keys(this.segment.uploadParts) : {}
    },
    allTokens () {
      return  this.$store.state.tokenUpdated ? this.segment.partsTokens(this.currentPartIndex) : []
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
    },
    isEmptyMetadata () {
      const docSource = this.$textC.getDocSource(this.textType, this.segment.docSourceId)
      return this.$store.state.docSourceUpdated && docSource && docSource.hasEmptyMetadata
    },

    hasMetadata () {
      const docSource = this.$textC.getDocSource(this.textType, this.segment.docSourceId)
      return this.$store.state.docSourceUpdated && docSource && !docSource.hasEmptyMetadata
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

    clickPart (partIndex) {
      if (this.currentPartIndex !== parseInt(partIndex)) {
        this.currentPartIndex = parseInt(partIndex)
      }
    }
  }

}
</script>
<style lang="scss">
.alpheios-alignment-editor-align-text-segment {
  // padding: 10px;
  // position: relative;
  .alpheios-alignment-editor-align-text-segment-tokens {
    padding: 10px;
    max-height: 400px;
    overflow-y: scroll;
  }
}

.alpheios-align-text-segment-first {
  // padding-top: 40px;
}
  .alpheios-alignment-editor-align-text-segment-row {
      margin: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      // position: absolute;
      min-height: 2px;

      // overflow-y: hidden;
      border-bottom: 0;
      // top: 0;
      // right: 0;
      // left: 0;
      margin: 0;
      padding: 0;
      
      font-size: 90%;

      background: #eee;
      // color: #fff;
      // z-index: 100;

      .alpheios-alignment-editor-align-text-segment-row__langname {
        display: inline-block;
        padding: 5px 5px 0 15px;
        color: #000;
        font-weight: bold;
      }
    }
        span.alpheios-alignment-editor-text-blocks-single__icons {
          display: block;
          padding: 5px;

          svg {
            display: block;
            width: 25px;
            height: 25px;
            stroke: #99002a;
            fill: transparent;
          }
        }

        span.alpheios-alignment-editor-text-blocks-single__icons{

          &.alpheios-alignment-editor-text-blocks-single__metadata_icon_no_data {
            cursor: pointer;
            svg {
              stroke: #99002a;
            }
          }

          &.alpheios-alignment-editor-text-blocks-single__metadata_icon_has_data {
            cursor: pointer;
            svg {
              stroke: #2a9900;
            }
          }
        }

  .alpheios-alignment-editor-align-text-parts-link {
    cursor: pointer;
    display: inline-block;
    padding: 3px;
    text-decoration: underline;

    &.alpheios-alignment-editor-align-text-parts-link-current {
      cursor: initial;
      text-decoration: none;
    }
  }

  .alpheios-alignment-editor-align-text-parts,
  .alpheios-alignment-editor-align-text-single-link {
    margin: 0;
    text-align: center;
    color: #000;
    font-weight: bold;
  }
</style>