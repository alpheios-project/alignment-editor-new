<template>
  <div class="alpheios-alignment-editor-tokens-edit-editor-container">
    <editor-tabs 
      v-if="allTokenizedTargetTextsIds.length > 1"
      :tabs = "allTokenizedTargetTextsIds" @selectTab = "selectTab"
    />
    
    <div class ="alpheios-alignment-editor-tokens-edit-editor-container-inner">
      <div class="alpheios-alignment-editor-align-segment-data"
           v-for="segmentData in allAlignedTextsSegments" :key="getIndex('origin', segmentData.index)"
           :class = "{ 'alpheios-alignment-editor-align-segment-data-last': segmentData.index === allAlignedTextsSegments.length }"
      >
        <div class="alpheios-alignment-editor-align-segment-edit-data-item alpheios-alignment-editor-align-segment-data-origin">
          <segment-edit-block 
                  :segment = "segmentData.origin" :currentTargetId = "currentTargetId"
          />
        </div>

        <div class="alpheios-alignment-editor-align-segment-edit-data-item alpheios-alignment-editor-align-segment-data-target">
          <segment-edit-block v-for="(segmentTarget, targetId) in segmentData.targets" :key="getIndex('target',segmentData.index, targetId)"
                  :segment = "segmentTarget" 
                  :isLast = "lastTargetId && (targetId === lastTargetId)" :currentTargetId = "currentTargetId"
                  v-show="isShownTab(targetId)"
          />
        </div>

      </div>
    </div>
  </div>
</template>
<script>
import Vue from '@vue-runtime'
import SegmentEditBlock from '@/vue/tokens-editor/segment-edit-block.vue'
import EditorTabs from '@/vue/common/editor-tabs.vue'

export default {
  name: 'TokensEditorInnerBlock',
  components: {
    segmentEditBlock: SegmentEditBlock,
    editorTabs: EditorTabs
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
    /**
     * Returns all targetIds; once it defines shownTabs - the list of active target tabs; 
     * for now we don't have a case when we need to re-define tabs, 
     * but if we would need it - we would update shownTabsInited with false
     * @returns {Array[String]}
     */
    allTokenizedTargetTextsIds () {
      const allTokenizedTargetTextsIds = this.$textC.allTokenizedTargetTextsIds
      if (!this.shownTabsInited) {
        this.shownTabs = allTokenizedTargetTextsIds.slice(0, 1)
        this.shownTabsInited = true
        this.$historyC.updateMode(this.shownTabs) 
      }
      return this.$store.state.alignmentUpdated ? allTokenizedTargetTextsIds : []
    },

    /**
     * @returns {Array[Object]}
     *          {Number} index - segment's order index
     *          {Segment} origin - origin segment by index
     *          {Object} targets - key {String} - targetId, value {Segment} - target segment by index and argetId
     */
    allAlignedTextsSegments () {
      return this.$store.state.alignmentUpdated && this.$store.state.tokenUpdated ? this.$alignedGC.allAlignedTextsSegments : []
    },

    /**
     * @returns {String} - targetId of the target segment, that is rendered the last to control css borders
     */
    lastTargetId () {
      return this.orderedTargetsId[this.orderedTargetsId.length - 1]
    },

    /**
     * @returns {Array[String]} - shown targetIds based on shownTabs with saved order
     */
    orderedTargetsId () {
      return Object.keys(this.allAlignedTextsSegments[0].targets).filter(targetId => this.shownTabs.includes(targetId))
    },

    /**
     * @returns {String|Null} - targetId if it only one tab is active and we could work with groups
     */
    currentTargetId () {
      return this.shownTabs.length === 1 ? this.shownTabs[0] : null
    }

  },
  methods: {
    /**
     * @param {String}
     * @returns {Boolean} - true - targetId is visible, false - not
     */
    isShownTab (targetId) {
      return this.shownTabs.includes(targetId)
    },

    /**
     * @param {String} - origin/target
     * @param {Number} - segment order index
     * @param {String} - targetId for target segment
     * @returns {String} - unique index for the segment
     */
    getIndex (textType, index, additionalIndex = 0) {
      return additionalIndex ? `${textType}-${index}-${additionalIndex}` : `${textType}-${index}`
    },

    /**
     * Changes active tabs by click
     * @param {String}
     */
    selectTab (targetId) {
      if ((this.shownTabs.length > 1) && this.shownTabs.includes(targetId)) {
        this.shownTabs = this.shownTabs.filter(innerTargetId => innerTargetId !== targetId)
      } else if (!this.shownTabs.includes(targetId)) {
        this.shownTabs.push(targetId)
      }  
      this.$historyC.updateMode(this.shownTabs)    
    }
  } 
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-tokens-edit-editor-container-inner {
    margin-top: 15px;
    border: 1px solid #ddd;
    border-bottom-color: transparent;
    background: #F8F8F8;
    color: #ae0000;

    .alpheios-alignment-editor-align-segment-data {
      &:before,
      &:after {
        clear: both;
        display: table;
        content: '';
      }

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
      float: left;

      &.alpheios-alignment-editor-align-segment-data-target {
        border-left: 2px solid  #ddd;
      }
    }
  }

</style>