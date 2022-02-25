<template>
    <div class="alpheios-alignment-editor-align-target-tabs" v-if="tabs.length > 1">
      <template v-for="(tabData, index) in tabs" >
        <tooltip :tooltipText = "tabsTooltips[tabData]" tooltipDirection = "top" v-if="tabsTooltips[tabData]" :key="index">
          <span class="alpheios-alignment-editor-align-target-tab-item"
                :class="{ 'alpheios-alignment-editor-align-target-tab-item-active': tabsStates[index] }"
                
                @click="selectTab(tabData, index)">
            {{ index + 1 }}
          </span>
        </tooltip>

        <span class="alpheios-alignment-editor-align-target-tab-item" v-else :key="index" 
              :class="{ 'alpheios-alignment-editor-align-target-tab-item-active': tabsStates[index]  }"
              
              @click="selectTab(tabData, index)">
          {{ index + 1 }}
        </span>
      </template>
    </div>
</template>
<script>
import Tooltip from '@/_output/vue/tooltip.vue'

export default {
  name: 'EditorTabs',
  components: {
    tooltip: Tooltip
  },
  props: {
    tabs: {
      type: Array,
      required: true
    },
    tabsTooltips: {
      type: Object,
      required: false,
      default: () => { return {} }
    }
  },
  data () {
    return {
      tabsStates: []
    }
  },
  watch: {
    tabs () {
      this.tabsStates.splice(0, this.tabsStates.length)
      // this.tabs.forEach((tab, index) => this.tabsStates.push(index === 0))
      this.tabs.forEach((tab, index) => this.tabsStates.push(true))
    }
  },
  /**
   * Inits tabStates from passed tabs
   */
  mounted () {
    if (this.tabs.length > 0) {
      // this.tabs.forEach((tab, index) => this.tabsStates.push(index === 0))
      this.tabs.forEach((tab, index) => this.tabsStates.push(true))
    }
  },
  computed: {
  },
  methods: {
    /**
     * It checks if the tab could be selected (for now we couldn't have no selected tabs)
     * @param {Number} - index order of targetId
     */
    couldBeSelected (index) {
      return !((this.tabsStates.filter(state => state).length === 1) && (this.tabsStates[index]))
    },

    /**
     * First it checks if the tab could be selected (for example we couldn't have no selected tabs)
     * Then it changes selected tab state to oposite and emits event
     * @param {String} - targetId
     * @param {Number} - index order of targetId
     */
    selectTab (tabData, index) {
      if (!this.couldBeSelected(index)) {
        return
      }
      
      this.tabsStates.splice(index, 1, !this.tabsStates[index])
      this.$emit('selectTab', tabData)
    }
  }
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