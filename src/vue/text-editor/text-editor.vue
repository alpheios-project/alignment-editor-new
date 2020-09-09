<template>
  <div class="alpheios-alignment-editor-container">
      <h2>{{ l10n.getMsgS('TEXT_EDITOR_HEADING') }} 
        (<span class="alpheios-alignment-editor-text-define-container__show-label" @click="toggleShowTextsBlocks">{{ showTextsBlocksLabel }}</span>)
      </h2>
      <div class="alpheios-alignment-editor-text-define-container" id="alpheios-text-editor-blocks-container" v-show="showTextsBlocks">
        <div class="alpheios-alignment-editor-text-define-container-inner">
          <div class="alpheios-alignment-editor-text-container alpheios-alignment-editor-origin-text-container">
            <text-editor-single-block 
                text-id="origin" 
                @update-text = "updateOriginText" 
                :external-text = "updatedOrigin"
            />
          </div>

          <div class="alpheios-alignment-editor-text-container alpheios-alignment-editor-target-text-container">
            <text-editor-single-block 
                text-id="target" 
                @update-text = "updateTargetText" 
                :external-text = "updatedTarget" 
                :disabled = "disableTargetTextBlock"   
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
    originUpdated: {
      type: Number,
      required: true
    },
    targetUpdated: {
      type: Number,
      required: true
    },
    hideEditor: {
      type: Number,
      required: false
    }
  },
  data () {
    return {
      showTextsBlocks: true,
      updatedOriginText: null,
      updatedTargetText: null,
      disableTargetTextBlock: true
    }
  },
  watch: {
    /**
     * Catches property's change from parent component
     */
    hideEditor () {
      this.showTextsBlocks = false
    }
  },
  /**
   * I placed empty alignment here for now, because it is the first point where it should be existed.
   * Later when we define workflow for creation alignment depending on user authentication,
   * it could be moved out here
   */
  created () {
    this.$textC.createAlignment()
  },
  computed: {
    /**
     * Defines label show/hide texts block depending on showTextsBlocks
     */
    showTextsBlocksLabel () {
      return this.showTextsBlocks ? this.l10n.getMsgS('TEXT_EDITOR_HIDE') : this.l10n.getMsgS('TEXT_EDITOR_SHOW')
    },
    /**
     * Catches if originUpdated was updated and update origin text from controller
     */
    updatedOrigin () {
      return this.originUpdated && this.originText ?  this.originText : null
    },
    /**
     * Catches if targetUpdated was updated and update target text from controller
     */
    updatedTarget () {
      return this.targetUpdated && this.targetText ?  this.targetText : null
    },
    /**
     * Retrieves origin doc source from controller
     */
    originText () {
      return this.originUpdated ? this.$textC.originDocSource : {}
    },
    /**
     * Retrieves target doc source from controller
     */
    targetText () {
      return this.targetUpdated ? this.$textC.targetDocSource : {}
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
    },
    /**
     * Updates origin doc source via texts controller
     * @param {Object} textData
     *        {String} textData.text
     *        {String} textData.direction
     *        {String} textData.lang
     */
    updateOriginText (textData) {
      this.$textC.updateOriginDocSource(textData)
    },
    /**
     * Updates target doc source via texts controller
     * @param {Object} textData
     *        {String} textData.text
     *        {String} textData.direction
     *        {String} textData.lang
     */
    updateTargetText (textData) {
      this.$textC.updateTargetDocSource(textData)
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-text-define-container-inner {
      &:before,
      &:after {
        content: '';
        display: block;
        clear: both;
      }
    }

    .alpheios-alignment-editor-text-define-container {
        .alpheios-alignment-editor-text-container {
          width: 50%;
          float: left;
        }
    }

    .alpheios-alignment-editor-origin-text-container {
      padding-right: 10px;
    }

    .alpheios-alignment-editor-target-text-container {
      padding-left: 10px;
    }

    .alpheios-alignment-editor-container-footer {
      text-align: center;
      border-top: 2px solid #757575;
      padding-top: 15px;
    }

    .alpheios-alignment-editor-text-define-container__show-label {
      cursor: pointer;
      font-size: 90%;
      text-decoration: underline;
      color: #185F6D;
    }
</style>