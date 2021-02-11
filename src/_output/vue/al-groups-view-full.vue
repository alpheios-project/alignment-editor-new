<template>
    <div class="alpheios-alignment-editor-align-groups-editor-container alpheios-alignment-editor-view-full" v-if="fullData">
        <editor-tabs 
            v-if="allTargetTextsIds.length > 1"
            :tabs = "allTargetTextsIds" @selectTab = "selectTab"
        />

        <div class ="alpheios-alignment-editor-align-define-container-inner">
            <div class="alpheios-alignment-editor-align-segment-data"
                v-for="(segmentData, segIndex) in allShownSegments" :key="getIndex('origin', segIndex)"
                :class = "{ 'alpheios-alignment-editor-align-segment-data-last': segIndex === allShownSegments.length }"
            >

              <origin-segment-block
                :segmentData = "segmentData" :segIndex = "segIndex" :maxHeight = "maxHeight"
                :dir = "fullData.origin.dir" :lang = "fullData.origin.lang"
                :shownTabs = "shownTabs" :hoveredGroupsId = "hoveredGroupsId"
                @addHoverToken = "addHoverToken" @removeHoverToken = "removeHoverToken"
              />

                <div class="alpheios-alignment-editor-align-segment-data-item alpheios-alignment-editor-align-segment-data-target">
                    <div class="alpheios-alignment-editor-align-text-segment" 
                      v-for="(segmentTarget, targetId) in segmentData.targets" :key="getIndex('target', segIndex, targetId)"
                      :id = "cssId('target', targetId, segIndex)" :style="cssStyle('target', targetId, segIndex)"
                      :class = "cssClass('target', targetId)" :dir = "fullData.targets[targetId].dir" :lang = "fullData.targets[targetId].lang"
                      v-show="isShownTab(targetId)"
                    >
                        <template v-for = "(token, tokenIndex) in segmentTarget.tokens">
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

            </div>

        </div>
    </div>
</template>
<script>
import EditorTabs from '@/_output/vue/editor-tabs.vue'
import TokenBlock from '@/_output/vue/token-block.vue'

import OriginSegmentBlock from '@/_output/vue/origin-segment-block.vue'

export default {
  name: 'AlGroupsViewFull',
  components: {
    editorTabs: EditorTabs,
    tokenBlock: TokenBlock,
    originSegmentBlock: OriginSegmentBlock
  },
  props: {
    fullData: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      colors: ['#F8F8F8', '#e3e3e3', '#FFEFDB', '#dbffef', '#efdbff', '#fdffdb', '#ffdddb', '#dbebff'],
      originColor: '#F8F8F8',
      hoveredGroupsId: null,
      shownTabs: []
    }
  },
  mounted () {
    this.shownTabs = this.allTargetTextsIds.slice(0, 1)
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
    allShownSegments () {
      let allS = [] // eslint-disable-line prefer-const

      this.fullData.origin.segments.forEach((segment, indexS) => {
        allS.push({
          index: indexS,
          origin: segment,
          targets: {}
        })
      })

      this.allTargetTextsIds.forEach(targetId => {
        if (this.fullData.targets[targetId].segments && this.isShownTab(targetId)) {
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

      this.fullData.origin.segments.forEach((segment, segIndex) => {
        segment.tokens.forEach(token => {
          if (token.grouped) {
            token.groupData.forEach(groupDataItem => {
              if (!allG[groupDataItem.groupId]) { allG[groupDataItem.groupId] = { targetId: groupDataItem.targetId, segIndex, tokens: [] } }
              allG[groupDataItem.groupId].tokens.push(token.idWord)
            })

          }
        })
      })

      this.allTargetTextsIds.forEach(targetId => {
        if (this.fullData.targets[targetId].segments) {
          this.fullData.targets[targetId].segments.forEach(segment => {
            segment.tokens.forEach(token => {
              if (token.grouped) {
                token.groupData.forEach(groupDataItem => {
                  allG[groupDataItem.groupId].tokens.push(token.idWord)
                })
              }
            })
          })
        }
      })

      return allG
    },
    orderedTargetsId () {
      return this.allTargetTextsIds.filter(targetId => this.shownTabs.includes(targetId))
    },
    lastTargetId () {
      return this.orderedTargetsId[this.orderedTargetsId.length - 1]
    },
    containerHeight () {
      return (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight) - 150
    },
    maxHeight () {
      const minHeight = 400
      
      if (this.allShownSegments.length === 1) {
        return this.containerHeight
      } 
      return Math.round(Math.min(minHeight, this.containerHeight/this.shownTabs.length))
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
        return `order: ${segmentIndex}; background: ${this.colors[this.targetIdIndex(targetId)]}; max-height: ${this.maxHeight}px`
      } else {
        return `order: ${segmentIndex}; background: ${this.originColor}; max-height: ${this.maxHeight}px`
      }
    },
    targetIdIndex (targetId) {
      return targetId ? this.allTargetTextsIds.indexOf(targetId) : null
    },
    cssClass (textType, targetId) {
      let classes = {}
      classes[`alpheios-align-text-segment-${textType}`] = true
      classes[`alpheios-align-text-segment-${textType}-last`] = this.isLast(targetId)
      return classes
    },
    addHoverToken (token) {
      this.hoveredGroupsId = token.grouped ? token.groupData.map(groupDataItem => groupDataItem.groupId) : null

      if (this.hoveredGroupsId && (token.textType === 'target')) {
        const hoveredGroup = this.alGroups[this.hoveredGroupsId[0]]
        const minOpositeTokenId = hoveredGroup.tokens[0] // the first is always min origin token
        this.makeScrollTo(minOpositeTokenId, 'origin', hoveredGroup)
      }

      if (this.hoveredGroupsId && (token.textType === 'origin')) {
        const hoveredGroup = this.alGroups[this.hoveredGroupsId[0]]
        const minOpositeTokenId = hoveredGroup.tokens.find(tokenGr => token.idWord.split('-')[0] !== tokenGr.split('-')[0])

        this.makeScrollTo(minOpositeTokenId, 'target', hoveredGroup)
      }
    },
    removeHoverToken() {
      this.hoveredGroupsId = null
    },
    selectTab (targetId) {
      if ((this.shownTabs.length > 1) && this.shownTabs.includes(targetId)) {
        this.shownTabs = this.shownTabs.filter(innerTargetId => innerTargetId !== targetId)
      } else if (!this.shownTabs.includes(targetId)) {
        this.shownTabs.push(targetId)
      }     
    },
    isShownTab (targetId) {
      return this.shownTabs.includes(targetId)
    },
    isLast(targetId) {
      return targetId === this.lastTargetId
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

    // scroll behaviour
    makeScrollTo (idWord, textType, hoveredGroup) {

      const tokenEl = document.getElementById(`token-${idWord}`)
      const segId = this.cssId(textType, hoveredGroup.targetId, hoveredGroup.segIndex)
      const segBlockEl = document.getElementById(segId)

      let pPos = segBlockEl.getBoundingClientRect()
      let cPos = tokenEl.getBoundingClientRect()
      
      const toTop = cPos.top - pPos.top + segBlockEl.scrollTop - 10
      // segBlockEl.scrollTop = toTop
      this.scrollTo(segBlockEl, toTop, 1)
    },

    easeInOutQuad (t) { 
      return t<.5 ? 2*t*t : -1+(4-2*t)*t 
    },

    scrollTo (element, to, duration) {
      let start = element.scrollTop
      let change = to - start
      let startTime = performance.now()
      let now, elapsed, t

      const animateScroll = () => {
        now = performance.now()
        elapsed = (now - startTime)/1000
        t = (elapsed/duration)

        element.scrollTop = start + change * this.easeInOutQuad(t)

        if( t < 1 )
            window.requestAnimationFrame(animateScroll)

      }
      animateScroll()
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
      max-height: 400px;
      overflow-y: scroll;

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

</style>
