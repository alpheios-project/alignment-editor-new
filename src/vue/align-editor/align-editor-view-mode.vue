<template>
  <div class="alpheios-alignment-editor-align-groups-editor-container">
    <actions-menu-align-editor />
    
    <editor-tabs 
      v-if="allTokenizedTargetTextsIds.length > 1"
      :tabs = "allTokenizedTargetTextsIds" @selectTab = "selectTab"
      :tabsTooltips = "$textC.getTargetDataForTabs(allTokenizedTargetTextsIds)"
    />

    <div class ="alpheios-alignment-editor-align-define-container-inner">
      <div class="alpheios-alignment-editor-align-segment-data"
           v-for="segmentData in allAlignedTextsSegments" :key="getIndex('origin', segmentData.index)"
           :class = "{ 'alpheios-alignment-editor-align-segment-data-last': segmentData.index === allAlignedTextsSegments.length }"
      >
        <div class="alpheios-alignment-editor-align-segment-data-item alpheios-alignment-editor-align-segment-data-origin">
          <segment-block 
              :currentTargetId = "currentTargetId" :amountOfShownTabs = "amountOfShownTabs" :isFirst = "segmentData.isFirst"
              :shownTabs = "state.shownTabs"
              :segmentIndex = "segmentData.origin.index" textType = "origin" :textId = "segmentData.origin.docSourceId"
              @update-annotation = "updateAnnotation" :annotationMode="props.annotationMode" 
          />
        </div>

        <div class="alpheios-alignment-editor-align-segment-data-item alpheios-alignment-editor-align-segment-data-target">
          <segment-block v-for="(segmentTarget, targetId) in segmentData.targets" 
                  :key="getIndex('target',segmentData.index, targetId)"
                  :isFirst = "segmentData.isFirst"
                  :shownTabs = "state.shownTabs"
                  :segmentIndex = "segmentTarget.index" textType = "target" :textId = "segmentTarget.docSourceId"
                  :isLast = "lastTargetId && (targetId === lastTargetId)" :currentTargetId = "currentTargetId" 
                  :amountOfShownTabs = "amountOfShownTabs"
                  @update-annotation = "updateAnnotation" :annotationMode="props.annotationMode"
                  v-show="isShownTab(targetId)"
          />
        </div>

      </div>
    </div>
  </div>
</template>
<script setup>
import ActionsMenuAlignEditor from '@/vue/align-editor/actions-menu-align-editor.vue'
import SegmentBlock from '@/vue/align-editor/segment-block.vue'
import EditorTabs from '@/vue/common/editor-tabs.vue'

import { computed, inject, reactive, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'

const emit = defineEmits([ 'update-annotation' ])

const $textC = inject('$textC')
const $alignedGC = inject('$alignedGC')
const $historyAGC = inject('$historyAGC')

const $store = useStore()

const props = defineProps({
  annotationMode: {
    type: Boolean,
    required: false,
    default: false
  }
})

const state = reactive({
  shownTabs: [],
  shownTabsInited: false
})

watch(
  () => $store.state.alignmentRestarted,
  () => { state.shownTabsInited = false }
)

watch(
  () => $store.state.uploadCheck,
  () => { state.shownTabsInited = false }
)

const allTokenizedTargetTextsIds = computed(() => {
  const allIds = $textC.allTokenizedTargetTextsIds

  if (!state.shownTabsInited) {
    state.shownTabs = allIds.slice(0, 1)
    state.shownTabsInited = true
    $historyAGC.updateMode(state.shownTabs) 
  }

  const result = $store.state.docSourceUpdated && $store.state.alignmentUpdated ? allIds : []
  return result
})

const allAlignedTextsSegments = computed(() => {
  return $store.state.alignmentUpdated && $store.state.tokenUpdated  ? $alignedGC.allAlignedTextsSegments : []
})

const lastTargetId = computed(() => {
  return orderedTargetsId.value[orderedTargetsId.value.length - 1]
})

const orderedTargetsId = computed(() => {
  return Object.keys(allAlignedTextsSegments.value[0].targets).filter(targetId => state.shownTabs.includes(targetId))
})

const currentTargetId = computed(() => {
  return state.shownTabs.length === 1 ? state.shownTabs[0] : null
})

const amountOfShownTabs = computed(() => {
  return state.shownTabs.length
})

const isShownTab = (targetId) => {
  return state.shownTabs.includes(targetId)
}

const getIndex = (textType, index, additionalIndex = 0) => {
  return additionalIndex ? `${textType}-${index}-${additionalIndex}` : `${textType}-${index}`
}

const selectTab = (targetId) => {
  if ((state.shownTabs.length > 1) && state.shownTabs.includes(targetId)) {
    state.shownTabs = state.shownTabs.filter(innerTargetId => innerTargetId !== targetId)
  } else if (!state.shownTabs.includes(targetId)) {
    state.shownTabs.push(targetId)
  }  
  $historyAGC.updateMode(state.shownTabs)    
}

const updateAnnotation = (token) => {
  emit('update-annotation', token)
}

</script>

<style lang="scss">
  .alpheios-alignment-editor-align-groups-editor-container {
    // padding-top: 20px;
  }
  .alpheios-alignment-editor-align-define-container-inner {
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
      vertical-align: top;
    }
  }

</style>