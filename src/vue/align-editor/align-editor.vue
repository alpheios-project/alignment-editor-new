<template>
  <div class="alpheios-alignment-editor-container" v-show="showAlignEditor">
    <div class="alpheios-alignment-editor-header">
      <h2>{{ l10n.getMsgS('ALIGN_EDITOR_HEADING') }} 
        (<span class="alpheios-alignment-editor-text-define-container__show-label" @click="toggleShowAlignBlocks">{{ showAlignBlocksLabel }}</span>)
      </h2>
    </div>
    
    <align-editor-view-mode v-show="showAlignBlocks"/>
    
  </div>
</template>
<script>
import Vue from '@vue-runtime'
import SegmentBlock from '@/vue/align-editor/segment-block.vue'
import AlignEditorViewMode from '@/vue/align-editor/align-editor-view-mode.vue'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'AlignEditor',
  components: {
    alignEditorViewMode: AlignEditorViewMode
  },
  props: {
    showEditor: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      showAlignBlocks: false
    }
  },
  watch: {
    /**
     * Controlls if showEditor changes, then showAlignBlocs would be set to truth
     */
    showEditor () {
      this.showAlignBlocks = true
    }
  },
  computed: {
    /**
     * Defines label show/hide texts block depending on showAlignBlocks
     */
    showAlignBlocksLabel () {
      return this.showAlignBlocks ? this.l10n.getMsgS('ALIGN_EDITOR_HIDE') : this.l10n.getMsgS('ALIGN_EDITOR_SHOW')
    },
    l10n () {
      return L10nSingleton
    },
    /**
     * Checks if there are enough data for rendering editors
     */
    showAlignEditor () {
      return this.$store.state.alignmentUpdated && this.$alignedC.alignmentGroupsWorkflowStarted
    }
  },
  methods: {
    /**
     * Toggle showAlignBlocks to change visibility for aligned blocks
     */
    toggleShowAlignBlocks () {
      this.showAlignBlocks = !this.showAlignBlocks
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-editor__link-label {
    cursor: pointer;
    font-size: 90%;
    color: #467e8a;
    display: inline-block;
    padding: 0 3px;

    &:hover {
      text-decoration: underline;
      color: #185F6D;
    }

    &.alpheios-alignment-editor__link-label-active {
      text-decoration: underline;
      color: #185F6D;
    }
  }
</style>