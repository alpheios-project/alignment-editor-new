<template>
    <div class="alpheios-al-editor-container alpheios-al-editor-view-short" v-if="$fullData">
        
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
                @addHoverToken = "addHoverToken" @removeHoverToken = "removeHoverToken"
              />
            </div>
          </div>

            <div class="alpheios-al-editor-segment-block alpheios-al-editor-segment-block-target" >
                <div class="alpheios-al-editor-segment-block-text" v-if="hoveredTargetTokens" >

                  <div class="alpheios-al-editor-target-hovered-block"
                    v-for = "(hoveredGroupData, hoveredGroupDataIndex) in hoveredTargetTokens" :key="hoveredGroupDataIndex" :data-key="hoveredGroupDataIndex">
                      <span class="alpheios-al-editor-segment-block-text__langname">{{ targetLangName(hoveredGroupData) }}</span>
                      <div class="alpheios-al-editor-target-hovered-block_tokens">
                        <template v-for = "(token, tokenIndex) in hoveredGroupData.target" :key = "getIndex('target', tokenIndex, 'token')" >
                            <token-block :token="token" />
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

const allAlGroups = computed(() => {
  return GroupUtility.alignmentGroups($fullData, 'short')
})

const hoveredTargetTokens = computed(() => {
  if (state.updateHovered && state.hoveredGroupsId) {
    const allHoveredTargetTokens = Object.keys(allAlGroups.value).filter(groupId => state.hoveredGroupsId.includes(groupId)).map(groupId => {
          return {
            metadata: allAlGroups.value[groupId].metadata,
            metadataShort: allAlGroups.value[groupId].metadataShort,
            target: allAlGroups.value[groupId].target,
            targetId: allAlGroups.value[groupId].targetId
          }
        })
    return allHoveredTargetTokens.filter(groupData => shownTabs.value.includes(groupData.targetId)).sort((a, b) => {
      return shownTabs.value.indexOf(a.targetId) - shownTabs.value.indexOf(b.targetId)
    })
  }

  return []
        
})

const containerHeight = computed(() => {
  return (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight) - 150
})

const maxHeight = computed(() => {
  const maxHeight = 400
  const minHeight = 25
  if (allOriginSegments.value.length === 1) {
    return containerHeight.value
  } 
  return Math.max(minHeight, Math.round(Math.min(maxHeight, containerHeight.value/allOriginSegments.value.length)))
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
  return state.hoveredGroupsId && (state.hoveredGroupsId.length > 0) && groupedToken.value(token) && isTokenInHovered(token)
}

const addHoverToken = (token) => {
  const hoveredGroupsId = token.grouped ? token.groupData.map(groupDataItem => groupDataItem.groupId) : null
  if (hoveredGroupsId) {
    state.hoveredGroupsId = hoveredGroupsId
    state.updateHovered++
  }
}

const removeHoverToken = (token) => {
  // this.hoveredGroupsId = null
  // this.updateHovered++
}

const targetLangName = (hoveredTargetTokens) => {
  return $fullData.getLangName('target', hoveredTargetTokens.targetId)
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

