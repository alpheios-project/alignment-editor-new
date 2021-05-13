<template>
    <div class="alpheios-alignment-editor-align-target-tabs" v-if="tabs.length > 1">
      <template v-for="(tabData, index) in tabs" >
        <tooltip :tooltipText = "tabsTooltips[tabData]" tooltipDirection = "top" v-if="tabsTooltips[tabData]" :key="index">
          <span class="alpheios-alignment-editor-align-target-tab-item" 
                :class="{ 'alpheios-alignment-editor-align-target-tab-item-active': tabsStatesFinal[index] && tabsStatesFinal[index].active }" 
                @click="selectTab(tabData, index)">
            {{ index + 1 }}
          </span>
        </tooltip>

        <span class="alpheios-alignment-editor-align-target-tab-item" :key="index" v-else
              :class="{ 'alpheios-alignment-editor-align-target-tab-item-active': tabsStatesFinal[index] && tabsStatesFinal[index].active }" 
              @click="selectTab(tabData, index)">
          {{ index + 1 }}
        </span>
      </template>
    </div>
</template>
<script>
import Tooltip from '@/vue/common/tooltip.vue'

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
    '$store.state.uploadCheck' () {
      this.tabsStates = []
    }
  },
  computed: {
    tabsStatesFinal () {
      if (this.tabs.length > this.tabsStates.length) {
        const newTabStates = this.tabs.map((tab, index) => { 
          return { active: this.tabsStates.length === 0 ? index === 0 : Boolean(this.tabsStates[index]) && this.tabsStates[index].active }
        })
        this.tabsStates = newTabStates
      }
      return this.$store.state.uploadCheck && this.$store.state.alignmentUpdated && this.tabsStates
    }
  },
  methods: {
    /**
     * It checks if the tab could be selected (for now we couldn't have no selected tabs)
     * @param {Number} - index order of targetId
     */
    couldBeSelected (index) {
      return !((this.tabsStates.filter(state => state.active).length === 1) && (this.tabsStates[index].active))
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
      
      this.tabsStates[index].active = !this.tabsStates[index].active
      this.$emit('selectTab', tabData)
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-align-target-tabs {
    display: inline-block;
    padding-left: 0;
    position: relative;
    width: 49%;
    vertical-align: middle;
    padding-left: 10px;
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