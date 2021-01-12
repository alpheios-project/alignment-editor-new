<template>
  <div class="alpheios-alignment-editor-container" v-show="showAlignEditor">
    <div class="alpheios-alignment-editor-header">
      <h2>{{ l10n.getMsgS('TOKENS_EDITOR_HEADING') }} 
        (<span class="alpheios-alignment-editor-text-define-container__show-label" @click="toggleShowTokensEditBlocks">{{ showTokenEditBlocksLabel }}</span>)
      </h2>
    </div>

    <align-editor-tokens-edit-mode v-show="showTokensEditBlocks" v-if="showAlignEditor"/>
    
  </div>
</template>
<script>
import Vue from '@vue-runtime'

import AlignEditorTokensEditMode from '@/vue/tokens-editor/align-editor-tokens-edit-mode.vue'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'AlignEditor',
  components: {
    alignEditorTokensEditMode: AlignEditorTokensEditMode
  },
  props: {
  },
  data () {
    return {
      showTokensEditBlocks: true
    }
  },
  watch: {
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    /**
     * Checks if there are enough data for rendering editors
     */
    showAlignEditor () {
      return this.$store.state.alignmentRestarted && this.$store.state.alignmentUpdated && this.$alignedC.alignmentGroupsWorkflowStarted
    },
    showTokenEditBlocksLabel () {
      return this.showTokensEditBlocks ? this.l10n.getMsgS('TOKENS_EDITOR_HIDE') : this.l10n.getMsgS('TOKENS_EDITOR_SHOW')
    }
  },
  methods: {
    toggleShowTokensEditBlocks () {
      this.showTokensEditBlocks = !this.showTokensEditBlocks
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-header {
    margin: 15px 0;
  }
</style>