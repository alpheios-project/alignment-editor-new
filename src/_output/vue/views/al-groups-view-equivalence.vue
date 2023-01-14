<template>
    <div class="alpheios-al-editor-container alpheios-al-editor-view-equivalence" v-if="fullData">
        
        <div class ="alpheios-al-editor-container-inner alpheios-al-editor-table-view">

          <div class="alpheios-al-editor-segment-block-all-origins">
            <div class="alpheios-al-editor-segment-block alpheios-al-editor-segment-block-origin"
                v-for="(segmentData, segIndex) in allOriginSegments" :key="getIndex('origin', segIndex)"
                :class = "{ 'alpheios-al-editor-segment-block-last': segIndex === allOriginSegments.length - 1 }"
            >
              <segment-block textType = "origin"
                :segmentData = "segmentData.origin" :segIndex = "segIndex" :maxHeight = "maxHeight"
                :dir = "fullData.getDir('origin')" :lang = "fullData.getLang('origin')" 
                :langName = "fullData.getLangName('origin')" :metadataShort = "fullData.getMetadataShort('origin')"
                :hoveredGroupsId = "hoveredOriginGroupsId" :shownTabs = "shownTabs"
                @addHoverToken = "addHoverToken" @removeHoverToken = "removeHoverToken"
              />
            </div>
          </div>

            <div class="alpheios-al-editor-segment-block alpheios-al-editor-segment-block-target" >
                <div class="alpheios-al-editor-segment-block-text" v-if="hoveredTargetsData" >

                  <div class="alpheios-al-editor-target-hovered-block"
                       v-for = "(hoveredTargetsDataItem, hoveredTargetsDataItemIndex) in hoveredTargetsData" :key=" hoveredTargetsDataItemIndex">
                      
                      <span class="alpheios-al-editor-segment-block-text__langname">{{ hoveredTargetsDataItem.langName }}</span>
                      <div class="alpheios-al-editor-target-hovered-block_tokens" 
                           v-for = "(targetsRow, targetsRowIndex) in hoveredTargetsDataItem.filteredTargets"
                           :key = "targetsRowIndex"
                      >
                        <template v-for = "(token, tokenIndex) in targetsRow.target">
                            <token-block :key = "tokenIndex" :token="token" :selected="true"/>
                        </template>
                        <span class="alpheios-token" v-if="targetsRow.count > 1"> ({{ targetsRow.count }})</span>
                      </div>
                      <p class="alpheios-al-editor-target-hovered-block__metadata" v-if="hoveredTargetsDataItem.metadataShort">
                        {{ hoveredTargetsDataItem.metadataShort }}
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
import LangNameBar from '@/_output/vue/lang-name-bar.vue'

import GroupUtility from '@/_output/utility/group-utility.js'

export default {
  name: 'AlGroupsViewEquivalence',
  components: {
    tokenBlock: TokenBlock,
    segmentBlock: SegmentBlock,
    langNameBar: LangNameBar
  },
  props: {
    fullData: {
      type: Object,
      required: true
    },
    identList: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      hoveredOriginGroupsId: null,
      hoveredTargetsData: null,
      updateHovered: 1
    }
  },
  computed: {
    shownTabs () {
      this.hoveredGroupsId = null
      return this.identList.filter(langData => !langData.hidden).map(langData => langData.targetId)
    },
    allOriginSegments () {
      return GroupUtility.allOriginSegments(this.fullData)
    },
    allAlGroups () {
      return GroupUtility.alignmentGroups(this.fullData, 'equivalence')
    },
    tokensEqGroups () {
      return GroupUtility.tokensEquivalentGroups(this.fullData, this.allAlGroups, this.shownTabs)
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
    
    addHoverToken (token) {
      const hoveredOriginGroupsId = token.grouped ? token.groupData.map(groupDataItem => groupDataItem.groupId) : null

      if (hoveredOriginGroupsId) {
        const hoveredTargetsDataObj = token.grouped ? this.tokensEqGroups[token.word].targets : null

        if (hoveredTargetsDataObj) {
          const hoveredTargetsKeys = Object.keys(hoveredTargetsDataObj).sort((a, b) => {
            return this.shownTabs.indexOf(a) - this.shownTabs.indexOf(b)
          })
          const hoveredTargetsData = hoveredTargetsKeys.map(targetId => hoveredTargetsDataObj[targetId])

          this.hoveredOriginGroupsId = hoveredOriginGroupsId
          this.hoveredTargetsData = hoveredTargetsData
          this.updateHovered++
        }
      }
    },

    removeHoverToken (token) {
      // this.hoveredGroupsId = null
      // this.updateHovered++
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
