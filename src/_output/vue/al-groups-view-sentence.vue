<template>
    <div class="alpheios-alignment-editor-align-groups-editor-container alpheios-alignment-editor-view-sentence" v-if="fullData">
        <div class ="alpheios-alignment-editor-align-define-container-inner alpheios-alignment-editor-align-table-data">
            <div class="alpheios-alignment-editor-align-segment-data-origin" >
                <div class="alpheios-align-text-segment-origin" 
                    v-for="(segmentData, segIndex) in allOriginSegments" :key="getIndex('origin', segIndex)"
                >
                  <origin-segment-block
                    :segmentData = "segmentData" :segIndex = "segIndex" :maxHeight = "maxHeight"
                    :dir = "fullData.origin.dir" :lang = "fullData.origin.lang" :langName = "fullData.origin.langName"
                    :hoveredGroupsId = "hoveredGroupsId"
                    @addHoverToken = "addHoverToken" @removeHoverToken = "removeHoverToken"
                  />
                </div>
            </div>
            
            <div class="alpheios-alignment-editor-align-segment-data-item alpheios-alignment-editor-align-segment-data-target" >
                <div class="alpheios-alignment-editor-align-text-segment" v-if="hoveredTargetTokens" :style="cssStyle">

                  <div class="alpheios-alignment-editor-align-text-target-hovered-block"
                    v-for = "(hoveredGroupData, hoveredGroupDataIndex) in hoveredTargetTokens" :key="hoveredGroupDataIndex">
                      <span class="alpheios-align-text-segment__langname">{{ targetLangName(hoveredGroupData) }}</span>
                      <div class="alpheios-alignment-editor-align-text-target-hovered-block__tokens">
                        <template v-for = "(token, tokenIndex) in hoveredGroupData.target">
                            <token-block :key = "tokenIndex" :token="token" 
                                :selected = "selectedToken(token)"
                                :grouped = "groupedToken(token)"
                            />
                            <br v-if="token.hasLineBreak" />
                        </template>
                      </div>
                      <p class="alpheios-alignment-editor-align-text-target-hovered-block__metadata" v-if="hoveredGroupData.metadata">
                        {{ hoveredGroupData.metadata }}
                      </p>
                  </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import TokenBlock from '@/_output/vue/token-block.vue'
import OriginSegmentBlock from '@/_output/vue/origin-segment-block.vue'

import GroupUtility from '@/_output/utility/group-utility.js'

export default {
  name: 'AlGroupsViewSentence',
  components: {
    tokenBlock: TokenBlock,
    originSegmentBlock: OriginSegmentBlock
  },
  props: {
    fullData: {
      type: Object,
      required: true
    },
    sentenceCount: {
      type: Number,
      required: false,
      default: 0
    }
  },
  data () {
    return {
      hoveredGroupsId: null,
      updateHovered: 1
    }
  },
  computed: {
    allOriginSegments () {
      return GroupUtility.allOriginSegments(this.fullData)
    },
    containerHeight () {
      return (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight) - 200
    },
    maxHeight () {
      const minHeight = 400
      
      if (this.allOriginSegments.length === 1) {
        return this.containerHeight
      } 
      return Math.round(Math.min(minHeight, this.containerHeight/this.allOriginSegments.length))
    },
    cssStyle () {
      return `max-height: ${this.maxHeight}px`
    },
    allAlGroups () {
      return GroupUtility.alignmentGroups(this.fullData, 'sentence', this.sentenceCount)
    },
    hoveredTargetTokens () {
      return this.updateHovered && this.hoveredGroupsId && 
            Object.keys(this.allAlGroups).filter(groupId => this.hoveredGroupsId.includes(groupId)).map(groupId => {
              return {
                metadata: this.allAlGroups[groupId].metadata,
                target: this.allAlGroups[groupId].target,
                targetId: this.allAlGroups[groupId].targetId
              }
            })
    }
  },
  methods: {
    getIndex (textType, index, additionalIndex = 0) {
      return additionalIndex ? `${textType}-${index}-${additionalIndex}` : `${textType}-${index}`
    },
    groupedToken (token) {
      return token.grouped
    },
    isTokenInHovered (token) {
      return token.groupData.some(groupDataItem => this.hoveredGroupsId.includes(groupDataItem.groupId) ) 
    },

    selectedToken (token) {
      return this.hoveredGroupsId && (this.hoveredGroupsId.length > 0) && this.groupedToken(token) && this.isTokenInHovered(token)
    },

    addHoverToken (token) {
      this.hoveredGroupsId = token.grouped ? token.groupData.map(groupDataItem => groupDataItem.groupId) : null
      this.updateHovered++
    },

    removeHoverToken (token) {
      this.hoveredGroupsId = null
      this.updateHovered++
    },
    targetLangName (hoveredTargetTokens) {
      return this.fullData.targets[hoveredTargetTokens.targetId].langName
    }
  }
}
</script>
<style lang="scss">

  .alpheios-alignment-editor-align-table-data {
    display: table;
    width: 100%;

    .alpheios-alignment-editor-align-segment-data-origin {
      width: 50%;
      display: table-cell;
    }

    .alpheios-alignment-editor-align-segment-data-target {
      width: 50%;
      display: table-cell;

      .alpheios-alignment-editor-align-text-segment {
          border-bottom: none;
      }
    }
  }

  
  .alpheios-alignment-editor-align-text-target-hovered-block {
    margin-bottom: 20px;

    .alpheios-alignment-editor-align-text-target-hovered-block__metadata {
      padding: 0 5px;
      margin: 0;
      color: #666666;
    }
  }
</style>
