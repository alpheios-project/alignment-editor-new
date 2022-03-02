<template>
    <div class="alpheios-al-editor-container alpheios-al-editor-view-interlinearly" v-if="fullData">
      <editor-tabs 
          v-if="languageTargetIds.length > 1"
          :tabs = "languageTargetIds" @selectTab = "selectTab"
          :tabsTooltips = "targetDataForTabs"
          v-show="false"
      />
      <div class ="alpheios-al-editor-container-inner alpheios-al-editor-segment-view">

          <div class="alpheios-al-editor-segment-row"
                v-for="(segmentData, segIndex) in allOriginSegments" :key="getIndex('origin', segIndex)"
                :class = "{ 'alpheios-al-editor-segment-row-last': segIndex === allOriginSegments.length - 1 }"
            >
            <div class="alpheios-al-editor-segment-cell alpheios-al-editor-segment-cell-origin" >
              <segment-block textType = "origin"
                :segmentData = "segmentData.origin" :segIndex = "segIndex"
                :dir = "fullData.getDir('origin')" :lang = "fullData.getLang('origin')" 
                :langName = "fullData.getLangName('origin')" :metadataShort = "fullData.getMetadataShort('origin')"
                :shownTabs = "shownTabs" :interlinearly = "true"
              />
            </div><!-- alpheios-al-editor-segment-cell -->
          </div>
      </div>
    </div>
</template>
<script>
import EditorTabs from '@/_output/vue/editor-tabs.vue'
import TokenBlock from '@/_output/vue/token-block.vue'
import SegmentBlock from '@/_output/vue/segment-block.vue'

import GroupUtility from '@/_output/utility/group-utility.js'

export default {
  name: 'AlGroupsViewInterlinearly',
  components: {
    editorTabs: EditorTabs,
    tokenBlock: TokenBlock,
    segmentBlock: SegmentBlock
  },
  props: {
    fullData: {
      type: Object,
      required: true
    },
    languageTargetIds: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      shownTabs: []
    }
  },
  watch: {
    languageTargetIds () {
      this.initShownTabs()
    }
  },
  mounted () {
    this.initShownTabs()
  },
  computed: {
    allOriginSegments () {
      return GroupUtility.allOriginSegments(this.fullData)
    },
    targetDataForTabs () {
      return GroupUtility.targetDataForTabs(this.fullData)
    }
  },
  methods: {
    initShownTabs () {
      this.shownTabs.splice(0, this.shownTabs.length)
      this.shownTabs.push(...this.languageTargetIds)
    },
    getIndex (textType, index, additionalIndex = 0) {
      return additionalIndex ? `${textType}-${index}-${additionalIndex}` : `${textType}-${index}`
    },
    selectTab (targetId) {
      if ((this.shownTabs.length > 1) && this.shownTabs.includes(targetId)) {
        this.shownTabs.splice(this.shownTabs.indexOf(targetId), 1)

      } else if (!this.shownTabs.includes(targetId)) {
        this.shownTabs.push(targetId)
      }     
    }
  }
}
</script>
<style lang="scss">

  .alpheios-al-editor-table-view {
    display: table;
    width: 100%;
    vertical-align: top;

    .alpheios-al-editor-segment-block-all-origins {
      width: 70%;
      display: table-cell;
      vertical-align: top;
    }
  
  }

</style>
