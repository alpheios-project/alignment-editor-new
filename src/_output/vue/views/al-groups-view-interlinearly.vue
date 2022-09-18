<template>
    <div class="alpheios-al-editor-container alpheios-al-editor-view-interlinearly" v-if="$fullData">
      <div class ="alpheios-al-editor-container-inner alpheios-al-editor-segment-view">

          <div class="alpheios-al-editor-segment-row"
                v-for="(segmentData, segIndex) in allOriginSegments" :key="getIndex('origin', segIndex)"
                :class = "{ 'alpheios-al-editor-segment-row-last': segIndex === allOriginSegments.length - 1 }"
            >
            <div class="alpheios-al-editor-segment-cell alpheios-al-editor-segment-cell-origin" >
              <segment-block textType = "origin"
                :segmentData = "segmentData.origin" :segIndex = "segIndex"
                :dir = "$fullData.getDir('origin')" :lang = "$fullData.getLang('origin')" 
                :langName = "$fullData.getLangName('origin')" :metadataShort = "$fullData.getMetadataShort('origin')"
                :shownTabs = "shownTabs" :interlinearly = "true"
              />
            </div><!-- alpheios-al-editor-segment-cell -->
          </div>
      </div>
    </div>
</template>
<script setup>
import EditorTabs from '@/_output/vue/common/editor-tabs.vue'
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

const shownTabs = computed(() => {
  return props.identList.filter(langData => !langData.hidden).map(langData => langData.targetId)
})

const allOriginSegments = computed(() => {
  return GroupUtility.allOriginSegments($fullData)
})

const targetDataForTabs = computed(() => {
  return GroupUtility.targetDataForTabs($fullData)
})

const getIndex = (textType, index, additionalIndex = 0) => {
  return additionalIndex ? `${textType}-${index}-${additionalIndex}` : `${textType}-${index}`
}

const selectTab = (targetId) => {
  if ((shownTabs.value.length > 1) && shownTabs.value.includes(targetId)) {
    shownTabs.value.splice(shownTabs.value.indexOf(targetId), 1)

  } else if (!shownTabs.value.includes(targetId)) {
    shownTabs.value.push(targetId)
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
  
  }

</style>
