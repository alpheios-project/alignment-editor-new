<template>
    <div class="alpheios-alignment-editor-align-groups-editor-container">
        <div class ="alpheios-alignment-editor-align-define-container-inner" v-if="fullData">

                <div class="alpheios-alignment-editor-align-segment-data"
                    v-for="(segmentData, segIndex) in allSegments" :key="getIndex('origin', segIndex)"
                    :class = "{ 'alpheios-alignment-editor-align-segment-data-last': segIndex === allSegments.length }"
                >
                    <div class="alpheios-alignment-editor-align-segment-data-item alpheios-alignment-editor-align-segment-data-origin" >
                        <div class="alpheios-alignment-editor-align-text-segment" 
                            :id = "cssId('origin', 'no', segIndex)" :style="cssStyle('origin', 0, segIndex)"
                            :class = "cssClass('origin', segIndex === allSegments.length)" :dir = "fullData.origin.dir" :lang = "fullData.origin.lang"
                        >
                            <template v-for = "(token, tokenIndex) in segmentData.origin.tokens">
                                <span :key = "tokenIndex" class = "alpheios-token" :class="tokenClasses(token)"
                                      @mouseover = "addHoverToken(token)"
                                      @mouseout = "removeHoverToken"
                                >
                                    {{ token.beforeWord }}{{ token.word }}{{ token.afterWord }}
                                </span>
                                <br v-if="token.hasLineBreak" />
                            </template>
                        </div>
                    </div>

                    <div class="alpheios-alignment-editor-align-segment-data-item alpheios-alignment-editor-align-segment-data-target">
                        <div class="alpheios-alignment-editor-align-text-segment" 
                          v-for="(segmentTarget, targetId) in segmentData.targets" :key="getIndex('target', segIndex, targetId)"
                          :id = "cssId('target', targetId, segIndex)" :style="cssStyle('target', targetId, segIndex)"
                          :class = "cssClass('target', segIndex === allSegments.length)" :dir = "fullData.targets[targetId].dir" :lang = "fullData.targets[targetId].lang"
                        >
                            <template v-for = "(token, tokenIndex) in segmentTarget.tokens">
                                <span :key = "tokenIndex" class = "alpheios-token" :class="tokenClasses(token)" 
                                      @mouseover = "addHoverToken(token)"
                                      @mouseout = "removeHoverToken"
                                >
                                    {{ token.beforeWord }}{{ token.word }}{{ token.afterWord }}
                                </span>
                                <br v-if="token.hasLineBreak" />
                            </template>
                        </div>
                    </div>

                </div>

        </div>
    </div>
</template>
<script>
import FullData from '@/_output/vue/full-data.json'

export default {
  name: 'AlGroupsViewFull',
  data () {
    return {
      fullData: null,
      colors: ['#F8F8F8', '#e3e3e3', '#FFEFDB', '#dbffef', '#efdbff', '#fdffdb', '#ffdddb', '#dbebff'],
      originColor: '#F8F8F8',
      hoveredGroupId: null
    }
  },
  mounted () {
    this.fullData = FullData
  },
  computed: {
    allSegments () {
      let allS = [] // eslint-disable-line prefer-const

      this.fullData.origin.segments.forEach((segment, indexS) => {
        allS.push({
          index: indexS,
          origin: segment,
          targets: {}
        })
      })

      this.allTargetTextsIds.forEach(targetId => {
        if (this.fullData.targets[targetId].segments) {
          this.fullData.targets[targetId].segments.forEach((segment, indexS) => {
            allS[indexS].targets[targetId] = segment
          })
        }
      })
      return allS
    },
    allTargetTextsIds () {
      return Object.keys(this.fullData.targets)
    },
    alGroups () {
      let allG = {} // eslint-disable-line prefer-const

      this.fullData.origin.segments.forEach(segment => {
        segment.tokens.forEach(token => {
          if (token.grouped) {
            if (!allG[token.groupId]) { allG[token.groupId] = [] }
            allG[token.groupId].push(token.idWord)
          }
        })
      })

      this.allTargetTextsIds.forEach(targetId => {
        if (this.fullData.targets[targetId].segments) {
          this.fullData.targets[targetId].segments.forEach(segment => {
            segment.tokens.forEach(token => {
              if (token.grouped) {
                if (!allG[token.groupId]) { allG[token.groupId] = [] }
                allG[token.groupId].push(token.idWord)
              }
            })
          })
        }
      })

      return allG
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
    cssStyle (textType, targetId, segmentIndex) {
      if (textType === 'target') {
        return `order: ${segmentIndex}; background: ${this.colors[this.targetIdIndex(targetId)]};`
      } else {
        return `order: ${segmentIndex}; background: ${this.originColor};`
      }
    },
    targetIdIndex (targetId) {
      return targetId ? this.allTargetTextsIds.indexOf(targetId) : null
    },
    cssClass (textType, isLast) {
      let classes = {}
      classes[`alpheios-align-text-segment-${textType}`] = true
      classes[`alpheios-align-text-segment-${textType}-last`] = isLast
      return classes
    },
    tokenClasses (token) {
      return { 
        'alpheios-token-grouped': token.grouped,
        'alpheios-token-selected': this.hoveredGroupId && token.grouped && token.groupId === this.hoveredGroupId
      }
    }, 
    addHoverToken (token) {
      this.hoveredGroupId = token.groupId
    },
    removeHoverToken() {
      this.hoveredGroupId = null
    }
  }
}
</script>
<style lang="scss">

  .alpheios-alignment-editor-align-define-container-inner {
    margin-top: 15px;
    border: 1px solid #ddd;
    border-bottom-color: transparent;
    background: #F8F8F8;
    color: #ae0000;

    .alpheios-alignment-editor-align-segment-data {
      background: #F8F8F8;
      border-bottom: 2px solid  #ddd;

      &.alpheios-alignment-editor-align-segment-data-last {
        border-bottom-color: transparent;
      }
    }    

    .alpheios-alignment-editor-align-text-segment {
      border-bottom: 2px solid  #e3e3e3;
      padding: 10px; 

      &.alpheios-align-text-segment-origin,
      &.alpheios-align-text-segment-target-last {
        border-bottom: 2px solid  transparent;
      }
    }

    .alpheios-alignment-editor-align-segment-data-item {
      width: 50%;

      &.alpheios-alignment-editor-align-segment-data-target {
        border-left: 2px solid  #ddd;
      }
    }

    .alpheios-alignment-editor-align-segment-data {
      display: table;
      width: 100%;
    }
    .alpheios-alignment-editor-align-segment-data-item {
      display: table-cell;
    }
  }

    .alpheios-alignment-editor-align-text-segment {
        span.alpheios-token {
            cursor: pointer;
            padding: 4px;
            border: 1px solid transparent;
            display: inline-block;

            &.alpheios-token-grouped {
              border-color: #BCE5F0;
              background: #BCE5F0;
            }

            &.alpheios-token-selected {
              border-color: #F27431;
              background: #F27431;
              color: #fff;
            }
        }
    }

</style>
