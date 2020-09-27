<template>
  <div class="alpheios-alignment-editor-align-define-container" v-if="showAlignEditor">
    <align-editor-tabs 
      v-if="allTargetSegmentsId.length > 1"
      :tabs = "allTargetSegmentsId" @selectTab = "selectTab"
    />
    
    <div class ="alpheios-alignment-editor-align-define-container-view-mode">
      <div class="alpheios-alignment-editor-align-segment-data"
           v-for="(segmentData, segmentIndex) in allAlignedTextsSegments" :key="getIndex('origin', segmentIndex)"
      >
        <div class="alpheios-alignment-editor-align-segment-data-item alpheios-alignment-editor-align-segment-data-origin">
          <segment-block 
                  :segment = "segmentData.origin" :show-alignment="showAlignment" 
                  @add-hover-token="addHoverToken" @remove-hover-token="removeHoverToken"
          />
        </div>

        <div class="alpheios-alignment-editor-align-segment-data-item alpheios-alignment-editor-align-segment-data-target">
          <segment-block v-for="(segmentTarget, targetId) in segmentData.targets" :key="getIndex('target',segmentIndex, targetId)"
                  :segment = "segmentTarget" :show-alignment="showAlignment" :targetId="targetId"
                  :isLast = "lastTargetId && (targetId === lastTargetId)"
                  v-show="showTab(targetId)"
                  @add-hover-token="addHoverToken" @remove-hover-token="removeHoverToken"
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
      showAlignment: [],
      activeTargetTab: null,
      shownTabs: [],
      lastTargetId: null,
      shownTabsInited: false
    }
  },
  computed: {
    allTargetSegmentsId () {
      if (!this.shownTabsInited) {
        this.shownTabs = this.$alignedC.allTargetTextsIds.slice(0, 1)
        this.shownTabsInited = true
        this.lastTargetId = this.shownTabs[0]
      }
      return this.$store.state.alignmentUpdated ? this.$alignedC.allTargetTextsIds : []
    },

    allAlignedTextsSegments () {
      return this.$store.state.alignmentUpdated ? this.$alignedC.allAlignedTextsSegments : {}
    },

    /**
     * Checks if there are enough data for rendering editors
     */
    showAlignEditor () {
      return this.$store.state.alignmentUpdated && this.$alignedC.alignedGroupsWorkflowStarted
    }
  },
  methods: {
    showTab (targetId) {
      return this.shownTabs.includes(targetId)
    },
    getIndex (textType, index, additionalIndex = 0) {
      return `${textType}-${index}-${additionalIndex}`
    },
     /**
     * Starts showing an alignment group workflow
     */
    addHoverToken (token) {
      this.showAlignment = this.$alignedC.findAlignmentGroupIds(token)
    },
    /**
     * Stops showing an alignment group workflow
     */
    removeHoverToken () {
      this.showAlignment = []
    },
    selectTab (targetId) {
      console.info('selectTab - ', this.shownTabs.includes(targetId), this.shownTabs)
      if ((this.shownTabs.length > 1) && this.shownTabs.includes(targetId)) {
        this.shownTabs = this.shownTabs.filter(innerTargetId => innerTargetId !== targetId)
        console.info('selectTab - 1')
      } else if (!this.shownTabs.includes(targetId)) {
        this.shownTabs.push(targetId)
        console.info('selectTab - 2')
      } else {
        console.info('selectTab - 3')
        return
      }

      if (this.shownTabs.length > 1) {
        const orderedTargetsId = Object.keys(Object.values(this.allAlignedTextsSegments)[0].targets).filter(targetId => this.shownTabs.includes(targetId))
        this.lastTargetId = orderedTargetsId[orderedTargetsId.length - 1]
      } else {
        this.lastTargetId = this.shownTabs[0]
      }
      
    }
  } 
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-align-define-container-view-mode {
    margin-top: 15px;
    border: 1px solid #ddd;
    background: #f3f3f3;
    padding: 10px;

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

      &.alpheios-align-text-segment-origin,
      &.alpheios-align-text-segment-target-last {
        border-bottom: 2px solid  transparent;
      }
    }

    .alpheios-alignment-editor-align-segment-data-item {
      width: 50%;
      float: left;

      padding: 10px; 

      &.alpheios-alignment-editor-align-segment-data-target {
        border-left: 2px solid  #ddd;
      }
    }
  }

</style>