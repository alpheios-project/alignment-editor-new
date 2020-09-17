<template>
  <div class="alpheios-alignment-editor-container" v-show="showAlignEditor">
      <h2>{{ l10n.getMsgS('ALIGN_EDITOR_HEADING') }} 
        (<span class="alpheios-alignment-editor-text-define-container__show-label" @click="toggleShowAlignBlocks">{{ showAlignBlocksLabel }}</span>)
      </h2>
      <div class="alpheios-alignment-editor-align-define-container" v-if="showAlignEditor" v-show="showAlignBlocks">
          <align-editor-single-block
            :align-text-data="originAlignedText" 
            :show-alignment="showAlignment"
            :alignment-updated = "alignmentUpdated"
            @click-token="clickToken" @add-hover-token="addHoverToken" @remove-hover-token="removeHoverToken"
          />
          <align-editor-single-block 
            :align-text-data="targetAlignedText"
            :show-alignment="showAlignment"
            :alignment-updated = "alignmentUpdated"
            @click-token="clickToken" @add-hover-token="addHoverToken" @remove-hover-token="removeHoverToken"
          />
      </div>
  </div>
</template>
<script>
import Vue from '@vue-runtime'
import AlignEditorSingleBlock from '@/vue/align-editor/align-editor-single-block.vue'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'AlignEditor',
  components: {
    alignEditorSingleBlock: AlignEditorSingleBlock
  },
  props: {
    showEditor: {
      type: Number,
      required: false
    },
    cssUpdate: {
      type: Number,
      required: false
    }
  },
  data () {
    return {
      showAlignBlocks: false,
      showAlignment: [],
      originUpdated: 1,
      targetUpdated: 1,
      alignmentUpdated: 1
    }
  },
  watch: {
    /**
     * Controlls if showEditor changes, then showAlignBlocs would be set to truth
     */
    showEditor () {
      this.showAlignBlocks = true
      this.updateOriginEditor()
      this.updateTargetEditor()
    },
    /**
     * Controlls if showEditor changes, then showAlignBlocs would be set to truth
     */
    cssUpdate () {
      this.updateTokenClasses()
    }
  },
  computed: {
    /**
     * Defines label show/hide texts block depending on showAlignBlocks
     */
    showAlignBlocksLabel () {
      return this.showAlignBlocks ? this.l10n.getMsgS('ALIGN_EDITOR_HIDE') : this.l10n.getMsgS('ALIGN_EDITOR_SHOW')
    },
    /**
     * Checks if there are enough data for rendering editors
     */
    showAlignEditor () {
      return Boolean(this.originAlignedText) && Boolean(this.originAlignedText.tokens) && Boolean(this.targetAlignedText) && Boolean(this.targetAlignedText.tokens)
    },
    /**
     * Returns originAlignedText from AlignedController
     */
    originAlignedText () {
      return this.originUpdated ? this.$alignedC.originAlignedText : {}
    },
    /**
     * Returns targetAlignedText from AlignedController
     */
    targetAlignedText () {
      return this.targetUpdated ? this.$alignedC.targetAlignedText : {}
    },
    l10n () {
      return L10nSingleton
    }
  },
  methods: {
    /**
     * Updates alignmentUpdated to recalculate css styles for tokens for both origin and target
     */
    updateTokenClasses () {
      this.alignmentUpdated = this.alignmentUpdated + 1
    },
    /**
     * Updates originUpdated flag to reupload originAlignedText from controller
     */
    updateOriginEditor () {
      this.originUpdated = this.originUpdated + 1
    },
    /**
     * Updates targetUpdated flag to reupload originAlignedText from controller
     */
    updateTargetEditor () {
      this.targetUpdated = this.targetUpdated + 1
    },

    /**
     * Toggle showAlignBlocks to change visibility for aligned blocks
     */
    toggleShowAlignBlocks () {
      this.showAlignBlocks = !this.showAlignBlocks
    },
    /**
     * Starts change token state in alignment groups workflow and update css classes
     */
    clickToken (token) {
      this.$alignedC.clickToken(token)
      this.updateTokenClasses()
      this.$emit('css-update-menu')
    },
    /**
     * Starts showing an alignment group workflow
     */
    addHoverToken (token) {
      this.showAlignment = this.$alignedC.findAlignmentGroupIds(token)
      this.updateTokenClasses()
    },
    /**
     * Stops showing an alignment group workflow
     */
    removeHoverToken () {
      this.showAlignment = []
      this.updateTokenClasses()
    }
  }
}
</script>
<style lang="scss">
    .alpheios-alignment-editor-align-define-container {
        margin-top: 15px;
        border: 1px solid #ddd;
        background: #f3f3f3;

        padding: 20px;

        &:before,
        &:after {
            clear: both;
            display: table;
            content: '';
        }
    }
</style>