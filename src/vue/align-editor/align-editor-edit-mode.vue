<template>
  <div class="alpheios-alignment-editor-align-define-container" v-if="showAlignEditor">
    <div class="alpheios-alignment-editor-align-target-tabs" v-if="allTargetSegmentsId.length > 1">
      <span class="alpheios-alignment-editor-align-target-tab-item"
            :class="{ 'alpheios-alignment-editor-align-target-tab-item-active': activeTargetTab === targetId }"
            v-for="(targetId, index) in allTargetSegmentsId" :key="index" 
            @click="selectTab(targetId)">
        {{ index + 1 }}
      </span>
    </div>
    <div class ="alpheios-alignment-editor-align-define-container-edit-mode">
        <segment-block v-for="(segment, index) in originAlignedText.segments" :key="getIndex('origin', segment.index)"
                :segment = "segment" :show-alignment="showAlignment"
                :isLast = "index === originAlignedText.segments.length-1"
                @add-hover-token="addHoverToken" @remove-hover-token="removeHoverToken"
        />

        <segment-block v-for="(data, index) in allTargetSegments" :key="getIndex('target', data.segment.index, data.targetId)"
                :segment = "data.segment" :show-alignment="showAlignment" :targetId = "data.targetId"
                :isLast = "index === allTargetSegments.length-1"
                @add-hover-token="addHoverToken" @remove-hover-token="removeHoverToken"
        />
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
      activeTargetTab: null
    }
  },
  computed: {
    /**
     * Returns originAlignedText from AlignedController
     */
    originAlignedText () {
      return this.$store.state.alignmentUpdated ? this.$alignedC.originAlignedText : {}
    },
    allTargetSegmentsId () {
      this.activeTargetTab = this.$alignedC.allTargetTextsIds[0]
      return this.$store.state.alignmentUpdated ? this.$alignedC.allTargetTextsIds : []
    },
    allTargetSegments () {
      return this.$store.state.alignmentUpdated ? this.$alignedC.filteredTargetTextsSegments(this.activeTargetTab) : []
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
      this.activeTargetTab = targetId
    }
  } 
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-align-define-container-edit-mode {
    display: flex;
    flex-wrap: wrap;
    margin-top: 15px;
    border: 1px solid #ddd;
    background: #f3f3f3;
    padding: 10px;
    

    .alpheios-alignment-editor-align-text-segment {
      flex-grow: 1;
      width: 50%;
      padding: 10px;
      border: 2px solid transparent;
      border-bottom: 2px solid  #ddd;
    }

    .alpheios-align-text-segment-origin {
      border-right: 2px solid  #ddd;
    }

    .alpheios-align-text-segment-origin-last,
    .alpheios-align-text-segment-target-last {
      border-bottom: 2px solid  transparent;
    }
  }

</style>