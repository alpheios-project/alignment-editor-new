<template>
    <div class="alpheios-alignment-editor-align-target-tabs" v-if="props.tabs.length > 1">

      <template v-for="(tabData, index) in props.tabs" >

        <tooltip :tooltipText = "props.tabsTooltips[tabData]" tooltipDirection = "top" 
                 v-if="props.tabsTooltips[tabData]" >
          <span class="alpheios-alignment-editor-align-target-tab-item" 
                :class="{ 'alpheios-alignment-editor-align-target-tab-item-active': tabsStatesFinal[index] && tabsStatesFinal[index].active }" 
                @click="selectTab(tabData, index)">
            {{ index + 1 }}
          </span>
        </tooltip>

        <span class="alpheios-alignment-editor-align-target-tab-item" 
              v-if="!props.tabsTooltips[tabData]"
              :class="{ 'alpheios-alignment-editor-align-target-tab-item-active': tabsStatesFinal[index] && tabsStatesFinal[index].active }" 
              @click="selectTab(tabData, index)">
          {{ index + 1 }}
        </span>

      </template>

    </div>
</template>
<script setup>
import Tooltip from '@/vue/common/tooltip.vue'

import { computed, inject, reactive, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'

const $store = useStore()

const $alignedGC = inject('$alignedGC')
const emit = defineEmits([ 'selectTab' ])

const props = defineProps({
  tabs: {
    type: Array,
    required: true
  },
  tabsTooltips: {
    type: Object,
    required: false,
    default: () => { return {} }
  }
})

const state = reactive({
  tabsStates: []
})

watch(
  () => $store.state.uploadCheck,
  () => { state.tabsStates = [] }
)

const tabsStatesFinal = computed(() => {
  if (props.tabs.length > state.tabsStates.length) {
    const newTabStates = props.tabs.map((tab, index) => { 
      return { active: state.tabsStates.length === 0 ? 
                       index === 0 : 
                       Boolean(state.tabsStates[index]) && state.tabsStates[index].active }
    })
    state.tabsStates = newTabStates
  }

  return $store.state.uploadCheck && $store.state.alignmentUpdated && state.tabsStates
})
    
const couldBeSelected  = (index) => {
  return !((state.tabsStates.filter(state => state.active).length === 1) && (state.tabsStates[index].active))
}

const selectTab = (tabData, index) => {
  if ($alignedGC.checkIfHasActiveAlignmentGroup()) {
    return
  }

  if (!couldBeSelected(index)) {
    return
  }
  
  // this.toggleTabSelection(tabData, index)
  switchTabselection(tabData, index)
}

const switchTabselection = (tabData, index) => {
  if (!state.tabsStates[index].active) {
    const activeIndex = state.tabsStates.findIndex(tabState => tabState.active)
    state.tabsStates[activeIndex].active = false

    state.tabsStates[index].active = true
    emit('selectTab', tabData)
    emit('selectTab', props.tabs[activeIndex])
  }
}

const toggleTabSelection = (tabData, index) => {
  state.tabsStates[index].active = !state.tabsStates[index].active
  emit('selectTab', tabData)
}
</script>

<style lang="scss">
  .alpheios-alignment-editor-align-target-tabs {
    display: inline-block;
    padding-left: 0;
    position: relative;
    width: 49%;
    vertical-align: middle;
    // padding-left: 10px;
    padding: 10px;
  }
  .alpheios-alignment-editor-align-target-tab-item {
    cursor: pointer;
    display: inline-block;

    border-radius: 30px;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;

    margin: 0 10px 3px 0;

    background: #bebebe;
    color: #fff;

    &.alpheios-alignment-editor-align-target-tab-item-active {
      background: #185F6D;
    }
  }
</style>