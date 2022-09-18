<template>
    <div class="alpheios-al-editor-container alpheios-al-editor-view-sentence" v-if="$fullData">
        <div class ="alpheios-al-editor-container-inner alpheios-al-editor-table-view">

            <div class="alpheios-al-editor-segment-block-all-origins">
              <div class="alpheios-al-editor-segment-block alpheios-al-editor-segment-block-origin"
                  v-for="(segmentData, segIndex) in allOriginSegments" :key="getIndex('origin', segIndex)"
                  :class = "{ 'alpheios-al-editor-segment-block-last': segIndex === allOriginSegments.length - 1 }"
              >
                <segment-block textType = "origin"
                  :segmentData = "segmentData.origin" :segIndex = "segIndex" :maxHeight = "maxHeight"
                  :dir = "$fullData.getDir('origin')" :lang = "$fullData.getLang('origin')" 
                  :langName = "$fullData.getLangName('origin')" :metadataShort = "$fullData.getMetadataShort('origin')"
                  :hoveredGroupsId = "state.hoveredGroupsId" :shownTabs = "shownTabs"
                  @addHoverToken = "addHoverToken" 
                />
              </div>
            </div>
            
            <div class="alpheios-al-editor-segment-block alpheios-al-editor-segment-block-target" >
                <div class="alpheios-al-editor-segment-block-text" v-if="hoveredTargetTokens" >

                  <div class="alpheios-al-editor-target-hovered-block" 
                    v-for = "(hoveredGroupData, hoveredGroupDataIndex) in hoveredTargetTokens" :key="hoveredGroupDataIndex" >
                      <span class="alpheios-al-editor-segment-block-text__langname">{{ targetLangName(hoveredGroupData) }}</span>
                      <div class="alpheios-al-editor-target-hovered-block__tokens" :id = "getTargetSegId(hoveredGroupDataIndex)" :style="cssStyleTarget">
                        <template v-for = "(token, tokenIndex) in hoveredGroupData.targetSentence" 
                                  :key = "getIndex('target', tokenIndex, 'token')" >
                            <token-block :token="token" 
                                :selected = "selectedToken(token)"
                                :grouped = "groupedToken(token)"
                            />
                            <br v-if="token.hasLineBreak" :key = "getIndex('target', tokenIndex, 'br')" />
                        </template>
                      </div>
                      <p class="alpheios-al-editor-target-hovered-block__metadata" v-if="hoveredGroupData.metadataShort">
                        {{ hoveredGroupData.metadataShort }}
                      </p>
                  </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import TokenBlock from '@/_output/vue/parts/token-block.vue'
import SegmentBlock from '@/_output/vue/parts/segment-block.vue'

import ScrollUtility from '@/lib/utility/scroll-utility.js'
import GroupUtility from '@/_output/utility/group-utility.js'

import { computed, reactive, inject, onMounted, watch } from 'vue'

const $fullData = inject('$fullData')

const props = defineProps({
  identList: {
    type: Array,
    required: true
  },
  sentenceCount: {
    type: Number,
    required: false,
    default: 0
  }
})

const state = reactive({
  hoveredGroupsId: null,
  updateHovered: 1
})

const shownTabs = computed(() => {
  state.hoveredGroupsId = null
  return props.identList.filter(langData => !langData.hidden).map(langData => langData.targetId)
})

const allOriginSegments = computed(() => {
  return GroupUtility.allOriginSegments($fullData)
})

const containerHeight = computed(() => {
  return (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight) - 200
})

const maxHeight = computed(() => {
  const maxHeight = 400
  const minHeight = 25
  if (allOriginSegments.value.length === 1) {
    return containerHeight.value
  } 
  return Math.max(minHeight, Math.round(Math.min(maxHeight, containerHeight.value/allOriginSegments.value.length)))
})

const cssStyle = computed(() => {
  return `max-height: ${maxHeight.value}px`
})

const cssStyleTarget = computed(() => {
  return `max-height: ${containerHeight.value}px`
})

const allAlGroups = computed(() => {
  return GroupUtility.alignmentGroups($fullData, 'sentence', props.sentenceCount)
})

const hoveredTargetTokens = computed(() => {
  if (state.updateHovered && state.hoveredGroupsId) {
    const allHoveredTargetTokens = Object.keys(allAlGroups.value).filter(groupId => state.hoveredGroupsId.includes(groupId)).map(groupId => {
          return {
            metadata: allAlGroups.value[groupId].metadata,
            metadataShort: allAlGroups.value[groupId].metadataShort,
            targetSentence: allAlGroups.value[groupId].targetSentence,
            targetId: allAlGroups.value[groupId].targetId
          }
        })
    return allHoveredTargetTokens.filter(groupData => shownTabs.value.includes(groupData.targetId)).sort((a, b) => {
      return shownTabs.value.indexOf(a.targetId) - shownTabs.value.indexOf(b.targetId)
    })
  }

  return []
})

const getIndex = (textType, index, additionalIndex = 0) => {
  return additionalIndex ? `${textType}-${index}-${additionalIndex}` : `${textType}-${index}`
}

const isShownTab = (targetId) => {
  return shownTabs.value.includes(targetId)
}

const groupedToken = (token) => {
  return token.grouped && token.groupData.some(groupdataItem => isShownTab(groupdataItem.targetId))
}

const isTokenInHovered = (token) => {
  return token.groupData.some(groupDataItem => state.hoveredGroupsId.includes(groupDataItem.groupId) ) 
}

const selectedToken = (token) => {
  return state.hoveredGroupsId && (state.hoveredGroupsId.length > 0) && groupedToken(token) && isTokenInHovered(token)
}

const addHoverToken = (token) => {
  const hoveredGroupsId = token.grouped ? token.groupData.map(groupDataItem => groupDataItem.groupId) : null
  if (hoveredGroupsId) {
    state.hoveredGroupsId = hoveredGroupsId
    state.updateHovered++
  }
}
const targetLangName = (hoveredTargetTokens) => {
  return $fullData.targets[hoveredTargetTokens.targetId].langName
}

const getTargetSegId = (hoveredGroupDataIndex) => {
  return `hovered-segment-target-id-${hoveredGroupDataIndex}`
}

</script>

<style lang="scss">

  .alpheios-al-editor-view-sentence .alpheios-al-editor-table-view {
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
        padding: 35px 0 10px;
      }
      .alpheios-al-editor-target-hovered-block__tokens {
        padding: 0 10px 10px;
        overflow-y: scroll;
        max-height: 400px;
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
  }
</style>
