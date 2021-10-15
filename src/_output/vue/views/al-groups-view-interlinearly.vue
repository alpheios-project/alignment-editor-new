<template>
    <div class="alpheios-al-editor-container alpheios-al-editor-view-interlinearly" v-if="fullData">
        
      <div class ="alpheios-al-editor-container-inner alpheios-al-editor-segment-view">

          <div class="alpheios-al-editor-segment-row"
                v-for="(segmentData, segIndex) in allOriginSegments" :key="getIndex('origin', segIndex)"
                :class = "{ 'alpheios-al-editor-segment-row-last': segIndex === allOriginSegments.length - 1 }"
            >
            <div class="alpheios-al-editor-segment-cell alpheios-al-editor-segment-cell-origin" >
              <segment-block textType = "origin"
                :segmentData = "segmentData.origin" :segIndex = "segIndex"
                :dir = "fullData.getDir('origin')" :lang = "fullData.getLang('origin')" 
                :langName = "fullData.getLangName('origin')" :metadata = "fullData.getMetadata('origin')"
                :shownTabs = "languageTargetIds" :interlinearly = "true"
              />
            </div><!-- alpheios-al-editor-segment-cell -->
          </div>
      </div>
    </div>
</template>
<script>
import TokenBlock from '@/_output/vue/token-block.vue'
import SegmentBlock from '@/_output/vue/segment-block.vue'

import GroupUtility from '@/_output/utility/group-utility.js'

export default {
  name: 'AlGroupsViewInterlinearly',
  components: {
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
    }
  },
  computed: {
    allOriginSegments () {
      return GroupUtility.allOriginSegments(this.fullData)
    }
  },
  methods: {
    
    getIndex (textType, index, additionalIndex = 0) {
      return additionalIndex ? `${textType}-${index}-${additionalIndex}` : `${textType}-${index}`
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
