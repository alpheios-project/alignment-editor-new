<template>
    <div class="alpheios-alignment-editor-align-target-tabs" v-if="tabs.length > 1">
      <template v-for="(tabData, index) in props.tabs" :key="index">
        <tooltip :tooltipText = "props.tabsTooltips[tabData]" tooltipDirection = "top" 
                  v-if="props.tabsTooltips[tabData]" >
          <span class="alpheios-alignment-editor-align-target-tab-item"
                :class="{ 'alpheios-alignment-editor-align-target-tab-item-active': state.tabsStates[index] }"
                
                @click="selectTab(tabData, index)">
            {{ index + 1 }}
          </span>
        </tooltip>

        <span class="alpheios-alignment-editor-align-target-tab-item" v-else  
              :class="{ 'alpheios-alignment-editor-align-target-tab-item-active': state.tabsStates[index]  }"
              
              @click="selectTab(tabData, index)">
          {{ index + 1 }}
        </span>
      </template>
    </div>
</template>
<script setup>
import Tooltip from '@/_output/vue/common/tooltip.vue'

import { computed, reactive, inject, onMounted, watch } from 'vue'
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
  () => props.tabs,
  () => {
    state.tabsStates.splice(0, state.tabsStates.length)
    props.tabs.forEach((tab, index) => state.tabsStates.push(true))
  }
)

onMounted(() => {
  if (props.tabs.length > 0) {
    props.tabs.forEach((tab, index) => state.tabsStates.push(true))
  }
})

/**
 * It checks if the tab could be selected (for now we couldn't have no selected tabs)
 * @param {Number} - index order of targetId
 */
const couldBeSelected = (index) => {
  return !((state.tabsStates.filter(state => state).length === 1) && (state.tabsStates[index]))
}

/**
 * First it checks if the tab could be selected (for example we couldn't have no selected tabs)
 * Then it changes selected tab state to oposite and emits event
 * @param {String} - targetId
 * @param {Number} - index order of targetId
 */
const selectTab = (tabData, index) => {
  if (!couldBeSelected.value(index)) {
    return
  }
  
  state.tabsStates.splice(index, 1, !state.tabsStates[index])
  emit('selectTab', tabData)
}

</script>

<style lang="scss">
  .alpheios-alignment-editor-align-target-tabs {
    padding-left: 51%;
    padding-top: 10px;
  }
  .alpheios-alignment-editor-align-target-tab-item {
    cursor: pointer;
    display: inline-block;

    border-radius: 30px;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;

    margin: 0 10px 0 0;

    background: #bebebe;
    color: #fff;

    &.alpheios-alignment-editor-align-target-tab-item-active {
      background: #185F6D;
    }
  }
</style>