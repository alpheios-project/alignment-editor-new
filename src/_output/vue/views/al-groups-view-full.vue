<template>
    <div class="alpheios-al-editor-container alpheios-al-editor-view-full" v-if="fullData">
        <div class ="alpheios-al-editor-container-inner alpheios-al-editor-segment-view">

          <div class="alpheios-al-editor-segment-row"
                v-for="(segmentData, segIndex) in allShownSegments" :key="getIndex('origin', segIndex)"
                :class = "{ 'alpheios-al-editor-segment-row-last': segIndex === allShownSegments.length - 1 }"
            >
            <div class="alpheios-al-editor-segment-cell alpheios-al-editor-segment-cell-origin" >
              <segment-block textType = "origin"
                :segmentData = "segmentData.origin" :segIndex = "segIndex" :maxHeight = "maxHeight"
                :dir = "fullData.getDir('origin')" :lang = "fullData.getLang('origin')" 
                :langName = "fullData.getLangName('origin')" :metadataShort = "fullData.getMetadataShort('origin')"
                :shownTabs = "shownTabs" :hoveredGroupsId = "hoveredGroupsId"
                @addHoverToken = "addHoverToken" @removeHoverToken = "removeHoverToken"
              />
            </div><!-- alpheios-al-editor-segment-cell -->

            <div class="alpheios-al-editor-segment-cell alpheios-al-editor-segment-cell-target">
              <div class="alpheios-al-editor-segment-cell-target-container" :style="targetContainerStyle">
                <segment-block textType = "target"
                  v-for="(segmentTarget, targetIndex) in getSegmentData(segIndex)" :key="getIndex('target', segIndex, segmentTarget.targetId)"
                  :targetId = "segmentTarget.targetId" :segIndex = "segIndex" 
                  :dir = "fullData.getDir('target', segmentTarget.targetId)" :lang = "fullData.getLang('target', segmentTarget.targetId)" 
                  :langName = "fullData.getLangName('target', segmentTarget.targetId)" :metadataShort = "fullData.getMetadataShort('target', segmentTarget.targetId)"
                  :segmentData = "segmentTarget.segment" :targetIdIndex = "targetIndex" :maxHeight = "maxHeight" :hoveredGroupsId = "hoveredGroupsId"
                  :isLast = "targetIndex === segmentData.targets.length - 1" @addHoverToken = "addHoverToken" @removeHoverToken = "removeHoverToken"
                  v-show="isShownTab(segmentTarget.targetId)"
                />
              </div>
            </div><!-- alpheios-al-editor-segment-cell -->

            </div>

        </div><!-- alpheios-al-editor-container-inner-->
    </div>
</template>
<script>
import EditorTabs from '@/_output/vue/editor-tabs.vue'
import LangNameBar from '@/_output/vue/lang-name-bar.vue'

import SegmentBlock from '@/_output/vue/segment-block.vue'

import ScrollUtility from '@/lib/utility/scroll-utility.js'
import GroupUtility from '@/_output/utility/group-utility.js'

export default {
  name: 'AlGroupsViewFull',
  components: {
    editorTabs: EditorTabs,
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
      colors: ['#F8F8F8', '#e3e3e3', '#FFEFDB', '#dbffef', '#efdbff', '#fdffdb', '#ffdddb', '#dbebff'],
      originColor: '#F8F8F8',
      hoveredGroupsId: null
    }
  },
  computed: {

    shownTabs () {
      return this.identList.filter(langData => !langData.hidden).map(langData => langData.targetId)
    },
    allShownSegments () {
      return GroupUtility.allShownSegments(this.fullData, this.shownTabs)
    },
    targetDataForTabs () {
      return GroupUtility.targetDataForTabs(this.fullData)
    },
    alGroups () {
      return GroupUtility.alignmentGroups(this.fullData, 'full')
    },
    orderedTargetsId () {
      return this.shownTabs.filter(targetId => this.shownTabs.includes(targetId))
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
    },
    targetContainerStyle () {
      return `max-height: ${this.containerHeight}px;`
    }
  },
  methods: {
    getSegmentData (segIndex) {
      return this.allShownSegments[segIndex].targets
    },
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
    targetIdIndex (targetId) {
      return targetId ? this.shownTabs.indexOf(targetId) : null
    },
    addHoverToken (token) {
      this.hoveredGroupsId = token.grouped ? token.groupData.filter(groupDataItem => this.shownTabs.includes(groupDataItem.targetId)).map(groupDataItem => groupDataItem.groupId) : null
      this.makeScroll(token)
    },

    makeScroll (token) {
      if (this.hoveredGroupsId) {
        let scrolledTargetsIds = []
        const textTypeSeg = (token.textType === 'target') ? 'origin' : 'target'

        for (let i = 0; i < this.hoveredGroupsId.length; i++) {
          const hoveredGroup = this.alGroups[this.hoveredGroupsId[i]]

          if (!scrolledTargetsIds.includes(hoveredGroup.targetId)) {

            scrolledTargetsIds.push(hoveredGroup.targetId)
            const minOpositeTokenId = hoveredGroup[textTypeSeg].sort()[0]

            const segId = this.cssId(textTypeSeg, hoveredGroup.targetId, hoveredGroup.segIndex)
            ScrollUtility.makeScrollTo(`token-${minOpositeTokenId}`, segId)

          }
        }
      }
    },
    removeHoverToken() {
      this.hoveredGroupsId = null
    },
    selectTab (targetId) {
      if ((this.shownTabs.length > 1) && this.shownTabs.includes(targetId)) {
        this.shownTabs.splice(this.shownTabs.indexOf(targetId), 1)

      } else if (!this.shownTabs.includes(targetId)) {
        this.shownTabs.push(targetId)
      }     
    },
    isShownTab (targetId) {
      return this.shownTabs.includes(targetId)
    },
    isLast(targetId) {
      return targetId === this.lastTargetId
    }
  }
}
</script>
<style lang="scss">

  .alpheios-al-editor-container-inner {
    // margin-top: 15px;
    border: 1px solid #ddd;
    border-bottom-color: transparent;
    background: #F8F8F8;
    color: #ae0000;

    .alpheios-al-editor-segment-row {
      background: #F8F8F8;
      border-bottom: 2px solid  #ddd;

      &.alpheios-al-editor-segment-row-last {
        border-bottom-color: transparent;
      }
    }    

    .alpheios-al-editor-segment-cell-target-row {
      //border-bottom: 2px solid  #e3e3e3;
      padding: 10px; 
      max-height: 400px;
      overflow-y: scroll;
      /*
      &.alpheios-align-text-segment-origin,
      &.alpheios-align-text-segment-target-last {
        border-bottom: 2px solid  transparent;
      }
      */
    }

    .alpheios-al-editor-segment-cell-target-container {
      overflow: overlay;
    }

    .alpheios-al-editor-segment-cell {

      &.alpheios-al-editor-segment-cell-target {
        border-left: 2px solid  #ddd;
      }
    }
  }

  .alpheios-al-editor-view-full .alpheios-al-editor-container-inner {
    .alpheios-al-editor-segment-row {
      display: table;
      width: 100%;
    }

    .alpheios-al-editor-segment-cell {
      display: table-cell;
      width: 50%;
      vertical-align: top;
    }
  }

  .alpheios-al-editor-container-inner .alpheios-al-editor-segment-cell-target-row {
    position: relative;
    // padding-top: 30px;
  }
</style>
