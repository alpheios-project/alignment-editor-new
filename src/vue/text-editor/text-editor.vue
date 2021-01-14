<template>
  <div class="alpheios-alignment-editor-container">
      <h2>{{ l10n.getMsgS('TEXT_EDITOR_HEADING') }} 
        (<span class="alpheios-alignment-editor-header__show-label" @click="toggleShowTextsBlocks">{{ showTextsBlocksLabel }}</span>)
      </h2>

      <div class="alpheios-alignment-editor-text-blocks-container" id="alpheios-text-editor-blocks-container" v-show="showTextsBlocks">
        <div class="alpheios-alignment-editor-text-blocks-container-inner">

          <div class="alpheios-alignment-editor-text-blocks-single-container alpheios-alignment-editor-text-blocks-origin-container">
            <text-editor-single-block 
                text-type="origin" 
                :text-id = "originId"
            />
          </div>

          <div class="alpheios-alignment-editor-text-blocks-single-container alpheios-alignment-editor-text-blocks-target-container" v-if="allTargetTextsIds">
            <text-editor-single-block 
                v-for="(targetTextId, indexT) in allTargetTextsIds" :key="indexT"
                text-type = "target" 
                :text-id = "targetTextId"
                :index = "indexT"
            />
          </div>

        </div>
      </div>
  </div>
</template>
<script>
import TextEditorSingleBlock from '@/vue/text-editor/text-editor-single-block.vue'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'TextEditor',
  components: {
    textEditorSingleBlock: TextEditorSingleBlock
  },
  props: {  
    hideEditor: {
      type: Number,
      required: false
    },
    showEditor: {
      type: Number,
      required: false
    }
  },
  data () {
    return {
      showTextsBlocks: true
    }
  },
  watch: {
    /**
     * Catches property's change from parent component
     */
    hideEditor () {
      this.showTextsBlocks = false
    },
    showEditor () {
      this.showTextsBlocks = true
    }
  },
  /**
   * I placed an empty alignment here for now, because it is the first point where it should be existed.
   * Later when we define workflow for creation alignment depending on user authentication,
   * it could be moved out here
   */
  created () {
    this.$textC.createAlignment()
    this.$historyC.startTracking(this.$textC.alignment)
    this.$tokensEC.loadAlignment(this.$textC.alignment)
  },
  computed: {
    originId () {
      return this.$store.state.alignmentUpdated && this.$textC.originDocSource ? this.$textC.originDocSource.id : null
    },
    allTargetTextsIds () {
      return this.$store.state.alignmentUpdated && this.$store.state.uploadCheck && this.$textC.allTargetTextsIds.length > 0 ? this.$textC.allTargetTextsIds : [ null ]
    },
    /**
     * Defines label show/hide texts block depending on showTextsBlocks
     */
    showTextsBlocksLabel () {
      return this.showTextsBlocks ? this.l10n.getMsgS('TEXT_EDITOR_HIDE') : this.l10n.getMsgS('TEXT_EDITOR_SHOW')
    },
    l10n () {
      return L10nSingleton
    }
  },
  methods: {
    /**
     * Toggle show/hide texts blocks
     */
    toggleShowTextsBlocks () {
      this.showTextsBlocks = !this.showTextsBlocks
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-text-blocks-container-inner {
      &:before,
      &:after {
        content: '';
        display: block;
        clear: both;
      }
    }

    .alpheios-alignment-editor-text-blocks-container {
        .alpheios-alignment-editor-text-blocks-single-container {
          width: 50%;
          float: left;
        }
    }

    .alpheios-alignment-editor-text-blocks-origin-container {
      padding-right: 10px;
    }

    .alpheios-alignment-editor-text-blocks-target-container {
      padding-left: 10px;
    }

    .alpheios-alignment-editor-container-footer {
      text-align: center;
      border-top: 2px solid #757575;
      padding-top: 15px;
    }

    .alpheios-alignment-editor-header__show-label {
      cursor: pointer;
      font-size: 90%;
      text-decoration: underline;
      color: #185F6D;
    }
</style>