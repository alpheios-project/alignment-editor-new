<template>
    <div class="alpheios-al-editor-container alpheios-al-editor-view-full" v-if="$fullData">
        <div class ="alpheios-al-editor-container-inner alpheios-al-editor-segment-view">

          <div class="alpheios-al-editor-segment-row"
                v-for="(segmentData, segIndex) in allShownSegments" :key="getIndex('origin', segIndex)"
                :class = "{ 'alpheios-al-editor-segment-row-last': segIndex === allShownSegments.length - 1 }"
            >
            <div class="alpheios-al-editor-segment-cell alpheios-al-editor-segment-cell-origin" >

              <segment-block textType = "origin"
                :segmentData = "segmentData.origin" :segIndex = "segIndex" :maxHeight = "maxHeight"
                :dir = "$fullData.getDir('origin')" :lang = "$fullData.getLang('origin')" 
                :langName = "$fullData.getLangName('origin')" :metadataShort = "$fullData.getMetadataShort('origin')"
                :shownTabs = "shownTabs" :hoveredGroupsId = "state.hoveredGroupsId"
                @addHoverToken = "addHoverToken" @removeHoverToken = "removeHoverToken"
              />
            </div><!-- alpheios-al-editor-segment-cell -->

            <div class="alpheios-al-editor-segment-cell alpheios-al-editor-segment-cell-target">
              <div class="alpheios-al-editor-segment-cell-target-container" :style="targetContainerStyle">
                <segment-block textType = "target"
                  v-for="(segmentTarget, targetIndex) in getSegmentData(segIndex)" :key="getIndex('target', segIndex, segmentTarget.targetId)"

                  :targetId = "segmentTarget.targetId" :segIndex = "segIndex" 
                  :dir = "$fullData.getDir('target', segmentTarget.targetId)" :lang = "$fullData.getLang('target', segmentTarget.targetId)" 
                  :langName = "$fullData.getLangName('target', segmentTarget.targetId)" :metadataShort = "$fullData.getMetadataShort('target', segmentTarget.targetId)"
                  :segmentData = "segmentTarget.segment" :targetIdIndex = "targetIndex" :maxHeight = "maxHeight" :hoveredGroupsId = "state.hoveredGroupsId"
                  :isLast = "targetIndex === segmentData.targets.length - 1" @addHoverToken = "addHoverToken" @removeHoverToken = "removeHoverToken"
                  v-show="isShownTab(segmentTarget.targetId)"
                />
              </div>
            </div><!-- alpheios-al-editor-segment-cell -->

            </div>

        </div><!-- alpheios-al-editor-container-inner-->
    </div>
</template>
<script setup>
import SegmentBlock from '@/_output/vue/parts/segment-block.vue'

import ScrollUtility from '@/lib/utility/scroll-utility.js'
import GroupUtility from '@/_output/utility/group-utility.js'

import { computed, reactive, inject, onMounted, watch } from 'vue'

const $fullData = inject('$fullData')

const props = defineProps({
  identList: {
    type: Array,
    required: true
  }
})

const state = reactive({
  colors: ['#F8F8F8', '#e3e3e3', '#FFEFDB', '#dbffef', '#efdbff', '#fdffdb', '#ffdddb', '#dbebff'],
  originColor: '#F8F8F8',
  hoveredGroupsId: null
})

const shownTabs = computed(() => {
  return props.identList.filter(langData => !langData.hidden).map(langData => langData.targetId)
})

const allShownSegments = computed(() => {
  return GroupUtility.allShownSegments($fullData, shownTabs.value)
})

const targetDataForTabs = computed(() => {
  return GroupUtility.targetDataForTabs($fullData)
})

const alGroups = computed(() => {
  return GroupUtility.alignmentGroups($fullData, 'full')
})

const orderedTargetsId = computed(() => {
  return shownTabs.value.filter(targetId => shownTabs.value.includes(targetId))
})

const lastTargetId = computed(() => {
  return orderedTargetsId.value[orderedTargetsId.value.length - 1]
})

const containerHeight = computed(() => {
  return (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight) - 150
})

const targetContainerStyle = computed(() => {
  return `max-height: ${containerHeight.value}px;`
})
const maxHeight = computed(() => {
  const minHeight = 400
  
  if (allShownSegments.value.length === 1) {
    return containerHeight.value
  } 
  return Math.round(Math.min(minHeight, containerHeight.value/shownTabs.value.length))
})

const getSegmentData = (segIndex) => {
  return allShownSegments.value[segIndex].targets
}

const getIndex = (textType, index, additionalIndex = 0) => {
  return additionalIndex ? `${textType}-${index}-${additionalIndex}` : `${textType}-${index}`
}

const cssId = (textType, targetId, segmentIndex) => {
  if (textType === 'target') {
    return `alpheios-align-text-segment-${textType}-${targetId}-${segmentIndex}`
  } else {
    return `alpheios-align-text-segment-${textType}-${segmentIndex}`
  }
}

const targetIdIndex = (targetId) => {
  return targetId ? shownTabs.value.indexOf(targetId) : null
}

const addHoverToken = (token) => {
  state.hoveredGroupsId = token.grouped ? token.groupData.filter(groupDataItem => shownTabs.value.includes(groupDataItem.targetId)).map(groupDataItem => groupDataItem.groupId) : null
  makeScroll(token)
}

const makeScroll = (token) => {
  if (state.hoveredGroupsId) {
    let scrolledTargetsIds = []
    const textTypeSeg = (token.textType === 'target') ? 'origin' : 'target'

    for (let i = 0; i < state.hoveredGroupsId.length; i++) {
      const hoveredGroup = alGroups.value[state.hoveredGroupsId[i]]

      if (!scrolledTargetsIds.includes(hoveredGroup.targetId)) {

        scrolledTargetsIds.push(hoveredGroup.targetId)
        const minOpositeTokenId = hoveredGroup[textTypeSeg].sort()[0]

        const segId = cssId(textTypeSeg, hoveredGroup.targetId, hoveredGroup.segIndex)
        ScrollUtility.makeScrollTo(`token-${minOpositeTokenId}`, segId)

      }
    }
  }
}

const removeHoverToken = () => {
  state.hoveredGroupsId = null
}

const selectTab = (targetId) => {
  if ((shownTabs.value.length > 1) && shownTabs.value.includes(targetId)) {
    shownTabs.value.splice(shownTabs.value.indexOf(targetId), 1)

  } else if (!shownTabs.value.includes(targetId)) {
    shownTabs.value.push(targetId)
  }     
}

const isShownTab = (targetId) => {
  return shownTabs.value.includes(targetId)
}

const isLast = (targetId) => {
  return targetId === lastTargetId.value
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

    .alpheios-al-editor-segment-cell {

      &.alpheios-al-editor-segment-cell-target {
        border-left: 2px solid  #ddd;
        overflow-y: scroll;
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
