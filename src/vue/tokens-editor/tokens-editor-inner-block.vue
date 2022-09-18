<template>
  <div class="alpheios-alignment-editor-tokens-edit-editor-container">
    
    <actions-menu-tokens-editor @blockTokensActions = "blockTokensActions"/>
    
    <editor-tabs 
      v-if="allTokenizedTargetTextsIds.length > 1"
      :tabs = "allTokenizedTargetTextsIds" @selectTab = "selectTab"
      :tabsTooltips = "$textC.getTargetDataForTabs(allTokenizedTargetTextsIds)"
    />
    
    <div class ="alpheios-alignment-editor-tokens-edit-editor-container-inner">
      <div class="alpheios-alignment-editor-align-segment-data"
           v-for="segmentData in allAlignedTextsSegments" :key="getIndex('origin', segmentData.index)"
           :class = "{ 'alpheios-alignment-editor-align-segment-data-last': segmentData.index === allAlignedTextsSegments.length }"
      >
        <div class="alpheios-alignment-editor-align-segment-edit-data-item alpheios-alignment-editor-align-segment-data-origin">
          <segment-edit-block 
                  :currentTargetId = "currentTargetId" :blockTokensActionsFlag = "state.blockTokensActionsFlag"
                  :segmentIndex = "segmentData.origin.index" textType = "origin" :textId = "segmentData.origin.docSourceId"
                   @removeAllActivated = "removeAllActivated" @insertTokens = "insertTokens"
          />
        </div>

        <div class="alpheios-alignment-editor-align-segment-edit-data-item alpheios-alignment-editor-align-segment-data-target">
          <segment-edit-block v-for="(segmentTarget, targetId) in segmentData.targets" :key="getIndex('target',segmentData.index, targetId)"
                  :segmentIndex = "segmentTarget.index" textType = "target" :textId = "segmentTarget.docSourceId"
                  :isLast = "lastTargetId && (targetId === lastTargetId)" :currentTargetId = "currentTargetId"
                  v-show="isShownTab(targetId)"
                  :blockTokensActionsFlag = "state.blockTokensActionsFlag"
                  @removeAllActivated = "removeAllActivated" @insertTokens = "insertTokens"
          />
        </div>

      </div>
    </div>
  </div>
</template>
<script setup>
import SegmentEditBlock from '@/vue/tokens-editor/segment-edit-block.vue'
import ActionsMenuTokensEditor from '@/vue/tokens-editor/actions-menu-tokens-editor.vue'

import EditorTabs from '@/vue/common/editor-tabs.vue'
import { computed, inject, reactive, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'

const $store = useStore()
const $textC = inject('$textC')
const $alignedGC = inject('$alignedGC')
const $historyAGC = inject('$historyAGC')
const emit = defineEmits([ 'insertTokens' ])

const props = defineProps({
  removeAllActivatedFlag: {
    type: Number,
    required: false,
    default: 1
  }
})

const state = reactive({
  shownTabs: [],
  shownTabsInited: false,
  blockTokensActionsFlag: 1
})

watch( 
  () => $store.state.alignmentRestarted, 
  () => {
    state.shownTabsInited = false
  }
)

watch( 
  () => $store.state.uploadCheck, 
  () => {
    state.shownTabsInited = false
  }
)

watch( 
  () => props.removeAllActivatedFlag, 
  () => {
    removeAllActivated()
  }
)

const allTokenizedTargetTextsIds = computed(() => {
  const allTokenizedTargetTextsIds = $textC.allTokenizedTargetTextsIds
  if (!state.shownTabsInited || (state.shownTabs.length === 0)) {
    state.shownTabs = allTokenizedTargetTextsIds.slice(0, 1)
    state.shownTabsInited = true
    $historyAGC.updateMode(state.shownTabs) 
  }
  return $store.state.alignmentUpdated  ? allTokenizedTargetTextsIds : []
})

const allAlignedTextsSegments = computed(() => {
  return $store.state.alignmentUpdated && $store.state.tokenUpdated ? $alignedGC.allAlignedTextsSegments : []
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

const blockTokensActions = () => {
  state.blockTokensActionsFlag = state.blockTokensActionsFlag + 1
}

const removeAllActivated = () => {
  blockTokensActions()
}

const insertTokens = (token) => {
  emit('insertTokens', token)
}

</script>

<style lang="scss">
  .alpheios-alignment-editor-tokens-edit-editor-container {
    margin-top: 15px;
  }
  .alpheios-alignment-editor-tokens-edit-editor-container-inner {

    border: 1px solid #ddd;
    border-bottom-color: transparent;
    background: #F8F8F8;
    color: #ae0000;

    .alpheios-alignment-editor-align-segment-data {
      display: table;
      width: 100%;
      background: #F8F8F8;
      border-bottom: 2px solid  #ddd;

      &.alpheios-alignment-editor-align-segment-data-last {
        border-bottom-color: transparent;
      }
    }    

    .alpheios-alignment-editor-align-text-segment-edit {
      border-bottom: 2px solid  #e3e3e3;
      padding: 10px; 

      &.alpheios-align-text-segment-origin,
      &.alpheios-align-text-segment-target-last {
        border-bottom: 2px solid  transparent;
      }
    }

    .alpheios-alignment-editor-align-segment-edit-data-item {
      width: 50%;
      display: table-cell;

      &.alpheios-alignment-editor-align-segment-data-target {
        border-left: 2px solid  #ddd;
      }
    }
  }

</style>