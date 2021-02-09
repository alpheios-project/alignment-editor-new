<template>
    <div class="alpheios-alignment-editor-align-groups-editor-container alpheios-alignment-editor-view-short" v-if="fullData">
        <div class ="alpheios-alignment-editor-align-define-container-inner alpheios-alignment-editor-align-table-data">
            <div class="alpheios-alignment-editor-align-segment-data-item alpheios-alignment-editor-align-segment-data-origin" >
                <div class="alpheios-alignment-editor-align-text-segment alpheios-align-text-segment-origin" 
                    v-for="(segmentData, segIndex) in allOriginSegments" :key="getIndex('origin', segIndex)"
                    :id = "cssId('origin', 'no', segIndex)" :style="cssStyle"
                    :dir = "fullData.origin.dir" :lang = "fullData.origin.lang"
                >
                    <template v-for = "(token, tokenIndex) in segmentData.origin.tokens">
                        <token-block :key = "tokenIndex" :token="token" 
                                        :selected = "selectedToken(token)"
                                        :grouped = "groupedToken(token)"
                                        @addHoverToken = "addHoverToken"
                                        @removeHoverToken = "removeHoverToken"
                        />
                        <br v-if="token.hasLineBreak" />
                    </template>
                </div>
            </div>
            <div class="alpheios-alignment-editor-align-segment-data-item alpheios-alignment-editor-align-segment-data-target" >
                <div class="alpheios-alignment-editor-align-text-segment" v-if="hoveredTargetTokens" >

                  <div class="alpheios-alignment-editor-align-text-target-hovered-block"
                    v-for = "(hoveredGroupData, hoveredGroupDataIndex) in hoveredTargetTokens" :key="hoveredGroupDataIndex">

                      <div class="alpheios-alignment-editor-align-text-target-hovered-block__tokens">
                        <template v-for = "(token, tokenIndex) in hoveredGroupData.tokensTarget">
                            <token-block :key = "tokenIndex" :token="token" />
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

export default {
  name: 'AlGroupsViewShort',
  components: {
    tokenBlock: TokenBlock
  },
  props: {
    fullData: {
      type: Object,
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
      let allS = [] // eslint-disable-line prefer-const

      this.fullData.origin.segments.forEach((segment, indexS) => {
        allS.push({
          index: indexS,
          origin: segment,
          targets: {}
        })
      })
      return allS
    },
    allTargetTextsIds () {
      return Object.keys(this.fullData.targets)
    },
    allAlGroups () {
      let allGroups = {}

      this.fullData.origin.segments.forEach((segment, segIndex) => {
        segment.tokens.forEach(token => {
          if (token.grouped) {
            token.groupData.forEach(groupDataItem => {
              if (!allGroups[groupDataItem.groupId]) { 
                allGroups[groupDataItem.groupId] = { targetId: groupDataItem.targetId, segIndex, tokensTarget: [] } 
              }
            })
          }
        })
      })

      this.allTargetTextsIds.forEach(targetId => {
        
        const metadata = this.fullData.targets[targetId].metadata
        if (this.fullData.targets[targetId].segments) {
          this.fullData.targets[targetId].segments.forEach(segment => {
            segment.tokens.forEach(token => {
              if (token.grouped) {
                token.groupData.forEach(groupDataItem => {                 
                  if (!allGroups[groupDataItem.groupId].metadata) { allGroups[groupDataItem.groupId].metadata = metadata }
                  allGroups[groupDataItem.groupId].tokensTarget.push(token)
                })
              }
            })
          })
        }
      })

      return allGroups
    },
    hoveredTargetTokens () {
      return this.updateHovered && this.hoveredGroupsId && 
            Object.keys(this.allAlGroups).filter(groupId => this.hoveredGroupsId.includes(groupId)).map(groupId => {
              return {
                metadata: this.allAlGroups[groupId].metadata,
                tokensTarget: this.allAlGroups[groupId].tokensTarget
              }
            })
    },
    containerHeight () {
      return (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight) - 200
    },
    cssStyle () {
      const minHeight = 400
      let maxHeight
      if (this.fullData.origin.segments.length === 1) {
        maxHeight = this.containerHeight
      } else {
        maxHeight = Math.round(Math.min(minHeight, this.containerHeight/this.fullData.origin.segments.length))
      }
      return `max-height: ${maxHeight}px`
    }
  },
  methods: {
    
    getIndex (textType, index, additionalIndex = 0) {
      return additionalIndex ? `${textType}-${index}-${additionalIndex}` : `${textType}-${index}`
    },
    cssId (textType, targetId, segmentIndex) {
      if (textType === 'target') {
        return `alpheios-align-text-segment-${textType}-${targetId}-${segmentIndex}`
      } else {
        return `alpheios-align-text-segment-${textType}-${segmentIndex}`
      }
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
    }
  }
}
</script>
<style lang="scss">

  .alpheios-alignment-editor-align-table-data {
    display: table;

    .alpheios-alignment-editor-align-segment-data-origin {
      width: 70%;
      display: table-cell;
    }

    .alpheios-alignment-editor-align-segment-data-target {
      width: 30%;
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
