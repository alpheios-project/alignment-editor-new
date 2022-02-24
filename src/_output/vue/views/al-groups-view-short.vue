<template>
    <div class="alpheios-al-editor-container alpheios-al-editor-view-short" v-if="fullData">
        
        <div class ="alpheios-al-editor-container-inner alpheios-al-editor-table-view">

          <div class="alpheios-al-editor-segment-block-all-origins">
            <div class="alpheios-al-editor-segment-block alpheios-al-editor-segment-block-origin"
                v-for="(segmentData, segIndex) in allOriginSegments" :key="getIndex('origin', segIndex)"
                :class = "{ 'alpheios-al-editor-segment-block-last': segIndex === allOriginSegments.length - 1 }"
            >
              <segment-block textType = "origin"
                :segmentData = "segmentData.origin" :segIndex = "segIndex" :maxHeight = "maxHeight"
                :dir = "fullData.getDir('origin')" :lang = "fullData.getLang('origin')" 
                :langName = "fullData.getLangName('origin')" :metadata = "fullData.getMetadata('origin')"
                :hoveredGroupsId = "hoveredGroupsId" :shownTabs = "languageTargetIds"
                @addHoverToken = "addHoverToken" @removeHoverToken = "removeHoverToken"
              />
            </div>
          </div>

            <div class="alpheios-al-editor-segment-block alpheios-al-editor-segment-block-target" >
                <div class="alpheios-al-editor-segment-block-text" v-if="hoveredTargetTokens" >

                  <div class="alpheios-al-editor-target-hovered-block"
                    v-for = "(hoveredGroupData, hoveredGroupDataIndex) in hoveredTargetTokens" :key=" hoveredGroupDataIndex">
                      <span class="alpheios-al-editor-segment-block-text__langname">{{ targetLangName(hoveredGroupData) }}</span>
                      <div class="alpheios-al-editor-target-hovered-block_tokens">
                        <template v-for = "(token, tokenIndex) in hoveredGroupData.target">
                            <token-block :key = "tokenIndex" :token="token" />
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
import SegmentBlock from '@/_output/vue/segment-block.vue'

import GroupUtility from '@/_output/utility/group-utility.js'

export default {
  name: 'AlGroupsViewShort',
  components: {
    tokenBlock: TokenBlock,
    segmentBlock: SegmentBlock
  },
  props: {
    fullData: {
      type: Object,
      required: true
    },
    languageTargetIds: {
      type: Array,
      required: true
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
    allAlGroups () {
      return GroupUtility.alignmentGroups(this.fullData, 'short')
    },
    hoveredTargetTokens () {
      if (this.updateHovered && this.hoveredGroupsId) {
        const allHoveredTargetTokens = Object.keys(this.allAlGroups).filter(groupId => this.hoveredGroupsId.includes(groupId)).map(groupId => {
              return {
                metadata: this.allAlGroups[groupId].metadata,
                target: this.allAlGroups[groupId].target,
                targetId: this.allAlGroups[groupId].targetId
              }
            })
        return allHoveredTargetTokens.filter(groupData => this.languageTargetIds.includes(groupData.targetId)).sort((a, b) => {
          return this.languageTargetIds.indexOf(a.targetId) - this.languageTargetIds.indexOf(b.targetId)
        })
      }

      return []
            
    },
    containerHeight () {
      return (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight) - 150
    },
    maxHeight () {
      const maxHeight = 400
      const minHeight = 25
      if (this.allOriginSegments.length === 1) {
        return this.containerHeight
      } 
      return Math.max(minHeight, Math.round(Math.min(maxHeight, this.containerHeight/this.allOriginSegments.length)))
    }
  },
  methods: {
    
    getIndex (textType, index, additionalIndex = 0) {
      return additionalIndex ? `${textType}-${index}-${additionalIndex}` : `${textType}-${index}`
    },
    isShownTab (targetId) {
      return this.languageTargetIds.includes(targetId)
    },
    groupedToken (token) {
      return token.grouped && token.groupData.some(groupdataItem => this.isShownTab(groupdataItem.targetId))
    },

    isTokenInHovered (token) {
      return token.groupData.some(groupDataItem => this.hoveredGroupsId.includes(groupDataItem.groupId) ) 
    },

    selectedToken (token) {
      return this.hoveredGroupsId && (this.hoveredGroupsId.length > 0) && this.groupedToken(token) && this.isTokenInHovered(token)
    },

    addHoverToken (token) {
      const hoveredGroupsId = token.grouped ? token.groupData.map(groupDataItem => groupDataItem.groupId) : null
      if (hoveredGroupsId) {
        this.hoveredGroupsId = hoveredGroupsId
        this.updateHovered++
      }
    },

    removeHoverToken (token) {
      // this.hoveredGroupsId = null
      // this.updateHovered++
    },
    targetLangName (hoveredTargetTokens) {
      return this.fullData.getLangName('target', hoveredTargetTokens.targetId)
    }
  }
}
</script>
<style lang="scss">

  .alpheios-al-editor-table-view {
    display: table;
    width: 100%;
    vertical-align: top;

    .alpheios-al-editor-segment-block-all-origins {
      width: 70%;
      display: table-cell;
      vertical-align: top;
    }

    .alpheios-al-editor-segment-block-target {
      width: 30%;
      display: table-cell;
      vertical-align: top;
      border-left: 1px solid  #ddd;

      .alpheios-al-editor-segment-block-text {
          border-bottom: none;
          padding: 0;
      }
    }

    .alpheios-al-editor-segment-block {
      background: #F8F8F8;
      border-bottom: 2px solid  #ddd;

      &.alpheios-al-editor-segment-block-last {
        border-bottom-color: transparent;
      }
    }    
  }

  
  .alpheios-al-editor-target-hovered-block {
    // margin-bottom: 20px;

    .alpheios-al-editor-target-hovered-block__metadata {
      padding: 0 15px;
      margin: 0;
      color: #666666;
    }
    .alpheios-al-editor-target-hovered-block_tokens {
      padding: 0 10px;
    }
  }

  .alpheios-al-editor-target-hovered-block {
    position: relative;
    padding: 30px 10px 10px;

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
