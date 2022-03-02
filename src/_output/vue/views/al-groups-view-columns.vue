<template>
    <div class="alpheios-al-editor-container alpheios-al-editor-view-columns" v-if="fullData">
      <div class ="alpheios-al-editor-container-inner alpheios-al-editor-segment-view">

          <div class="alpheios-al-editor-segment-big-row"
                v-for="(segmentData, segIndex) in segmentsForColumns" :key="getIndex('origin', segIndex)"
                :class = "{ 'alpheios-al-editor-segment-row-last': segIndex === segmentsForColumns.length - 1 }"
            >

            <div class = "alpheios-al-editor-segment-row" 
                 :style = "rowColor(segIndex)"
                 v-for = "(segmentRow, segmentRowIndex) in segmentData.segmentRows" :key="segmentRowIndex"
            >
              <template v-if="segmentRow.length > 0">
                <div class="alpheios-al-editor-segment-row-cell" 
                     v-for = "(segmentSingle, segmentCellIndex) in segmentRow" :key="segmentCellIndex"
                
                >
                  <segment-block v-if="segmentSingle.textType"
                    :textType = "segmentSingle.textType" 
                    :segmentData = "segmentSingle" :segIndex = "segIndex" :maxHeight = "maxHeight"
                    :dir = "fullData.getDir(segmentSingle.textType, segmentSingle.targetId)"
                    :lang = "fullData.getLang(segmentSingle.textType, segmentSingle.targetId)"
                    :langName = "fullData.getLangName(segmentSingle.textType, segmentSingle.targetId)"
                    :metadataShort = "fullData.getMetadataShort(segmentSingle.textType, segmentSingle.targetId)"
                    :hoveredGroupsId = "hoveredGroupsId" :shownTabs = "languageTargetIds"
                    @addHoverToken = "addHoverToken" @removeHoverToken = "removeHoverToken"

                    :targetIdIndex = "targetIdIndex(segmentSingle.targetId)"
                    changeColor = "bySegment"

                    :showLangName = "segIndex === 0"
                  />
                </div>
              </template>

            </div>

          </div><!--alpheios-al-editor-segment-big-row-->

       </div><!-- alpheios-al-editor-container-inner-->
    </div>
</template>
<script>
import LangNameBar from '@/_output/vue/lang-name-bar.vue'

import SegmentBlock from '@/_output/vue/segment-block.vue'

import ScrollUtility from '@/lib/utility/scroll-utility.js'
import GroupUtility from '@/_output/utility/group-utility.js'

export default {
  name: 'AlGroupsViewColumns',
  components: {
    segmentBlock: SegmentBlock,
    langNameBar: LangNameBar
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
      colors: ['#F8F8F8', '#e3e3e3', '#FFEFDB', '#dbffef', '#efdbff', '#fdffdb', '#ffdddb', '#dbebff'],
      originColor: '#F8F8F8',
      hoveredGroupsId: null,
      changeColor: false
    }
  },
  computed: {
    segmentsForColumns () {
      return GroupUtility.segmentsForColumns(this.fullData, this.languageTargetIds)
    },
    allTargetTextsIds () {
      return GroupUtility.allTargetTextsIds(this.fullData)
    },
    alGroups () {
      return GroupUtility.alignmentGroups(this.fullData, 'full')
    },
    orderedTargetsId () {
      return this.allTargetTextsIds
    },
    lastTargetId () {
      return this.orderedTargetsId[this.orderedTargetsId.length - 1]
    },
    containerHeight () {
      return (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight) - 150
    },
    maxHeight () {
      return 400
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
    targetIdIndex (targetId) {
      return targetId ? this.allTargetTextsIds.indexOf(targetId) : null
    },
    addHoverToken (token) {
      this.hoveredGroupsId = token.grouped ? token.groupData.map(groupDataItem => groupDataItem.groupId) : null
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
    isLast(targetId) {
      return targetId === this.lastTargetId
    },
    rowColor(segIndex) {
      return `background: ${this.colors[segIndex]};`
    }

  }
}
</script>
<style lang="scss">

  .alpheios-al-editor-view-columns .alpheios-al-editor-container-inner {
    margin-top: 15px;
    border: 1px solid #ddd;
    border-bottom-color: transparent;
    background: #F8F8F8;
    color: #ae0000;

    .alpheios-al-editor-segment-row {
      background: #F8F8F8;
      border-bottom: 2px solid  #185F6D;
    }    

    .alpheios-al-editor-segment-cell {

      &.alpheios-al-editor-segment-cell-target {
        border-left: 2px solid  #ddd;
      }
    }
  }

  .alpheios-al-editor-container-inner {
    .alpheios-al-editor-segment-cell-target-row {
      padding: 10px; 
      max-height: 400px;
      overflow-y: scroll;
    }

  }

  .alpheios-al-editor-view-columns .alpheios-al-editor-container-inner {
    .alpheios-al-editor-segment-row {
      width: 100%;
      display: table;

      .alpheios-al-editor-segment-row-cell {
        display: table-cell;
        vertical-align: top;
        width: 33.33%;
        border-right: 2px solid #d8d8d8;
      }
    }
  }

</style>
