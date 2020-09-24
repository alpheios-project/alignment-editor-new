<template>
  <div class="alpheios-alignment-editor-align-define-container" v-if="showAlignEditor">
    <div class="alpheios-alignment-editor-align-target-tabs" v-if="allTargetSegmentsId.length > 1">
      <span class="alpheios-alignment-editor-align-target-tab-item"
            :class="{ 'alpheios-alignment-editor-align-target-tab-item-active': shownTabs.includes(targetId) }"
            v-for="(targetId, index) in allTargetSegmentsId" :key="index" 
            @click="selectTab(targetId)">
        {{ index + 1 }}
      </span>
    </div>
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
                  :isLast = "targetId === lastTargetId"
                  v-show="shownTabs.includes(targetId)"
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

export default {
  name: 'AlignEditorEditMode',
  components: {
    segmentBlock: SegmentBlock
  },
  props: {
  },
  data () {
    return {
      showAlignment: [],
      activeTargetTab: null,
      shownTabs: []
    }
  },
  computed: {
    allTargetSegmentsId () {
      this.shownTabs = this.$alignedC.allTargetTextsIds.map(id => id)
      return this.$store.state.alignmentUpdated ? this.$alignedC.allTargetTextsIds : []
    },

    lastTargetId () {
      return this.$store.state.alignmentUpdated ? this.$alignedC.allTargetTextsIds[this.$alignedC.allTargetTextsIds.length - 1] : null
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
      if (this.shownTabs.includes(targetId)) {
        this.shownTabs = this.shownTabs.filter(innerTargetId => innerTargetId !== targetId)
      } else {
        this.shownTabs.push(targetId)
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

    &.alpheios-alignment-editor-align-target-tab-item-active,
    &:hover {
      background: #185F6D;
    }
  }
</style>