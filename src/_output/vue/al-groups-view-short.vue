<template>
    <div class="alpheios-alignment-editor-align-groups-editor-container alpheios-alignment-editor-view-short" v-if="fullData">
        <div class ="alpheios-alignment-editor-align-define-container-inner alpheios-alignment-editor-align-table-data">
            <div class="alpheios-alignment-editor-align-segment-data-item alpheios-alignment-editor-align-segment-data-origin" >
                <div class="alpheios-alignment-editor-align-text-segment alpheios-align-text-segment-origin" 
                    v-for="(segmentData, segIndex) in allOriginSegments" :key="getIndex('origin', segIndex)"
                    :id = "cssId('origin', 'no', segIndex)" 
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
                <div class="alpheios-alignment-editor-align-text-segment" v-if="allAlGroups">

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
    allAlGroups () {
      let allGroups = {}

      this.fullData.origin.segments.forEach((segment, segIndex) => {
        segment.tokens.forEach(token => {
          if (token.grouped) {
            token.groupData.forEach(groupDataItem => {
              if (!allGroups[groupDataItem.groupId]) { 
                allGroups[groupDataItem.groupId] = { targetId: groupDataItem.targetId, segIndex, tokensOrigin: [] } 
              }
              allGroups[groupDataItem.groupId].tokensOrigin.push(token.idWord)
            })

          }
        })
      })

      console.info('allGroups - ', allGroups)
      return allGroups
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
      return token.groupData.some(groupDataItem => this.hoveredGroupId.includes(groupDataItem.groupId) ) 
    },

    selectedToken (token) {
      return this.hoveredGroupId && (this.hoveredGroupId.length > 0) && this.groupedToken(token) && this.isTokenInHovered(token)
    },

    addHoverToken (token) {

    },

    removeHoverToken (token) {
        
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
</style>
