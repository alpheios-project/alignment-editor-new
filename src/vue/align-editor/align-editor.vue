<template>
  <div class="alpheios-alignment-editor-container" v-show="showAlignEditor">
    <div class="alpheios-alignment-editor-header alpheios-tools-enabled">
      <h2>{{ l10n.getMsgS('ALIGN_EDITOR_HEADING') }} 
        (<span class="alpheios-alignment-editor-header__show-label" @click="toggleShowAlignBlocks">{{ showAlignBlocksLabel }}</span>)
      </h2>
    </div>
    
    <align-editor-view-mode v-show="showAlignBlocks" v-if="showAlignEditor"/>   
  </div>
</template>
<script>
import Vue from '@vue-runtime'

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
      return this.$store.state.alignmentRestarted && this.$store.state.alignmentUpdated && this.$alignedGC.alignmentGroupsWorkflowStarted
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
  .alpheios-alignment-editor-header {
    margin: 0 0 10px;
  }
</style>