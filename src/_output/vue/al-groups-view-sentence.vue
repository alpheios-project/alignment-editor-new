<template>
    <div class="alpheios-al-editor-container alpheios-al-editor-view-sentence" v-if="fullData">
        <div class ="alpheios-al-editor-container-inner alpheios-al-editor-table-view">

            <div class="alpheios-al-editor-segment-block-all-origins">
              <div class="alpheios-al-editor-segment-block alpheios-al-editor-segment-block-origin"
                  v-for="(segmentData, segIndex) in allOriginSegments" :key="getIndex('origin', segIndex)"
                  :class = "{ 'alpheios-al-editor-segment-row-last': segIndex === allOriginSegments.length }"
              >
                <origin-segment-block
                  :segmentData = "segmentData" :segIndex = "segIndex" :maxHeight = "maxHeight"
                  :dir = "fullData.origin.dir" :lang = "fullData.origin.lang" :langName = "fullData.origin.langName"
                  :hoveredGroupsId = "hoveredGroupsId"
                  @addHoverToken = "addHoverToken" @removeHoverToken = "removeHoverToken"
                />
              </div>
            </div>
            
            <div class="alpheios-al-editor-segment-block alpheios-al-editor-segment-block-target" >
                <div class="alpheios-al-editor-segment-block-text" v-if="hoveredTargetTokens" >

                  <div class="alpheios-al-editor-target-hovered-block" 
                    v-for = "(hoveredGroupData, hoveredGroupDataIndex) in hoveredTargetTokens" :key="hoveredGroupDataIndex" >
                      <span class="alpheios-al-editor-segment-block-text__langname">{{ targetLangName(hoveredGroupData) }}</span>
                      <div class="alpheios-al-editor-target-hovered-block__tokens" :id = "getTargetSegId(hoveredGroupDataIndex)" :style="cssStyleTarget">
                        <template v-for = "(token, tokenIndex) in hoveredGroupData.target">
                            <token-block :key = "tokenIndex" :token="token" 
                                :selected = "selectedToken(token)"
                                :grouped = "groupedToken(token)"
                            />
                            <br v-if="token.hasLineBreak" />
                        </template>
                      </div>
                      <p class="alpheios-al-editor-target-hovered-block__metadata" v-if="hoveredGroupData.metadata">
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
import ScrollUtility from '@/lib/utility/scroll-utility.js'
import GroupUtility from '@/_output/utility/group-utility.js'
import Vue from '@vue-runtime'

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
    cssStyleTarget () {
      return `max-height: ${this.containerHeight}px`
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

    async addHoverToken (token) {
      const hoveredGroupsId = token.grouped ? token.groupData.map(groupDataItem => groupDataItem.groupId) : null
      if (hoveredGroupsId) {
        this.hoveredGroupsId = hoveredGroupsId
        this.updateHovered++
        
        await Vue.nextTick()
        this.makeScroll(token)
      }
    },
    
    makeScroll (token) {
      if (this.hoveredGroupsId) {
        const hoveredGroupData = this.hoveredTargetTokens[0]
        const minOpositeTokenId = hoveredGroupData.target.find(targetToken => targetToken.grouped).idWord

        const segId = this.getTargetSegId(0)
        ScrollUtility.makeScrollTo(`token-${minOpositeTokenId}`, segId)
      }
    },

    removeHoverToken (token) {
      // this.hoveredGroupsId = null
      // this.updateHovered++
    },
    targetLangName (hoveredTargetTokens) {
      return this.fullData.targets[hoveredTargetTokens.targetId].langName
    },
    getTargetSegId (hoveredGroupDataIndex) {
      return `hovered-segment-target-id-${hoveredGroupDataIndex}`
    }
  }
}
</script>
<style lang="scss">

  .alpheios-al-editor-table-view {
    display: table;
    width: 100%;

    .alpheios-al-editor-segment-block-all-origins {
      width: 50%;
      display: table-cell;
    }

    .alpheios-al-editor-segment-block-target {
      width: 50%;
      display: table-cell;

      .alpheios-al-editor-segment-block-text {
          border-bottom: none;
          overflow: initial;
      }

      .alpheios-al-editor-target-hovered-block {
        padding: 30px 0;
      }
      .alpheios-al-editor-target-hovered-block__tokens {
        padding: 0 10px 10px;
        overflow-y: scroll;
        max-height: 400px;
      }
    }
  }

  
  .alpheios-al-editor-target-hovered-block {
    margin-bottom: 20px;

    .alpheios-al-editor-target-hovered-block__metadata {
      padding: 0 5px;
      margin: 0;
      color: #666666;
    }
  }
</style>
