<template>
    <div class="alpheios-alignment-editor-align-target-tabs" v-if="tabs.length > 1">
      <span class="alpheios-alignment-editor-align-target-tab-item"
            :class="{ 'alpheios-alignment-editor-align-target-tab-item-active': tabsStates[index] && tabsStates[index].active }"
            v-for="(tabData, index) in tabs" :key="index" 
            @click="selectTab(tabData, index)">
        {{ index + 1 }}
      </span>
    </div>
</template>
<script>
export default {
  name: 'EditorTabs',
  props: {
    tabs: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      tabsStates: []
    }
  },
  mounted () {
    if (this.tabs.length > 0) {
      this.tabsStates = this.tabs.map((tab, index) => { 
        return { active: this.tabsStates.length === 0 ? index === 0 : Boolean(this.tabsStates[index]) && this.tabsStates[index].active }
      })
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
    padding-left: 51%;
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