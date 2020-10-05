<template>
  <div class="alpheios-alignment-editor-align-define-container" v-if="showAlignEditor">
    <align-editor-tabs 
      v-if="allTargetTextsIds.length > 1"
      :tabs = "allTargetTextsIds" @selectTab = "selectTab"
    />
    
    <div class ="alpheios-alignment-editor-align-define-container-view-mode">
      <div class="alpheios-alignment-editor-align-segment-data"
           v-for="segmentData in allAlignedTextsSegments" :key="getIndex('origin', segmentData.index)"
      >
        <div class="alpheios-alignment-editor-align-segment-data-item alpheios-alignment-editor-align-segment-data-origin">
          <segment-block 
                  :segment = "segmentData.origin" :currentTargetId = "currentTargetId"
          />
        </div>

        <div class="alpheios-alignment-editor-align-segment-data-item alpheios-alignment-editor-align-segment-data-target">
          <segment-block v-for="(segmentTarget, targetId) in segmentData.targets" :key="getIndex('target',segmentData.index, targetId)"
                  :segment = "segmentTarget" 
                  :isLast = "lastTargetId && (targetId === lastTargetId)" :currentTargetId = "currentTargetId"
                  v-show="showTab(targetId)"
          />
        </div>

      </div>
    </div>
  </div>
</template>
<script>
import Vue from '@vue-runtime'
import SegmentBlock from '@/vue/align-editor/segment-block.vue'
import AlignEditorTabs from '@/vue/align-editor/align-editor-tabs.vue'

export default {
  name: 'AlignEditorEditMode',
  components: {
    segmentBlock: SegmentBlock,
    alignEditorTabs: AlignEditorTabs
  },
  props: {
  },
  data () {
    return {
      shownTabs: [],
      shownTabsInited: false
    }
  },
  computed: {
    allTargetTextsIds () {
      const allTargetTextsIds = this.$textC.allTargetTextsIds
      if (!this.shownTabsInited) {
        this.shownTabs = allTargetTextsIds.slice(0, 1)
        this.shownTabsInited = true
      }
      return this.$store.state.alignmentUpdated ? allTargetTextsIds : []
    },

    allAlignedTextsSegments () {
      return this.$store.state.alignmentUpdated ? this.$alignedC.allAlignedTextsSegments : []
    },

    /**
     * Checks if there are enough data for rendering editors
     */
    showAlignEditor () {
      return this.$store.state.alignmentUpdated && this.$alignedC.alignmentGroupsWorkflowStarted
    },
    lastTargetId () {
      if (this.shownTabs.length > 1) {
        return this.orderedTargetsId[this.orderedTargetsId.length - 1]
      } else {
        return this.shownTabs[0]
      }
    },
    orderedTargetsId () {
      return Object.keys(this.allAlignedTextsSegments[0].targets).filter(targetId => this.shownTabs.includes(targetId))
    },
    currentTargetId () {
      return this.shownTabs.length === 1 ? this.shownTabs[0] : null
    }

  },
  methods: {
    showTab (targetId) {
      return this.shownTabs.includes(targetId)
    },
    getIndex (textType, index, additionalIndex = 0) {
      return `${textType}-${index}-${additionalIndex}`
    },
    selectTab (targetId) {
      if ((this.shownTabs.length > 1) && this.shownTabs.includes(targetId)) {
        this.shownTabs = this.shownTabs.filter(innerTargetId => innerTargetId !== targetId)
      } else if (!this.shownTabs.includes(targetId)) {
        this.shownTabs.push(targetId)
      } else {
        return
      }
      
    }
  } 
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-align-define-container-view-mode {
    margin-top: 15px;
    border: 1px solid #ddd;
    border-bottom-color: transparent;
    background: #f3f3f3;
    // padding: 10px;

    .alpheios-alignment-editor-align-segment-data {
      &:before,
      &:after {
        clear: both;
        display: table;
        content: '';
      }

      border-bottom: 2px solid  #ddd;
    }    

    .alpheios-alignment-editor-align-text-segment {
      border-bottom: 2px solid  #e3e3e3;
      padding: 10px; 

      &.alpheios-align-text-segment-origin,
      &.alpheios-align-text-segment-target-last {
        border-bottom: 2px solid  transparent;
      }
    }

    .alpheios-alignment-editor-align-segment-data-item {
      width: 50%;
      float: left;

      // padding: 10px; 

      &.alpheios-alignment-editor-align-segment-data-target {
        border-left: 2px solid  #ddd;
      }
    }
  }

</style>