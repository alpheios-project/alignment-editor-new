<template>
  <div class="alpheios-alignment-editor-container" v-show="showAlignEditor">
    <div class="alpheios-alignment-editor-header">
      <h2>{{ l10n.getMsgS('TOKENS_EDITOR_HEADING') }} 
        (<span class="alpheios-alignment-editor-header__show-label" @click="toggleShowTokensEditBlocks">{{ showTokenEditBlocksLabel }}</span>)
      </h2>
    </div>

    <tokens-editor-inner-block v-show="showTokensEditBlocks" v-if="renderTokensEditor"/>
    
  </div>
</template>
<script>
import Vue from '@vue-runtime'

import TokensEditInnerBlock from '@/vue/tokens-editor/tokens-editor-inner-block.vue'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'TokensEditor',
  components: {
    TokensEditorInnerBlock: TokensEditInnerBlock
  },
  props: {
  },
  data () {
    return {
      showTokensEditBlocks: false,
      renderTokensEditor: false
    }
  },
  watch: {
    '$store.state.alignmentRestarted' () {
      this.renderTokensEditor = false
      this.showTokensEditBlocks = false
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    /**
     * Checks if there are enough data for rendering editors
     */
    showAlignEditor () {
      return this.$store.state.alignmentRestarted && this.$store.state.alignmentUpdated && this.$alignedGC.alignmentGroupsWorkflowStarted
    },
    showTokenEditBlocksLabel () {
      return this.showTokensEditBlocks ? this.l10n.getMsgS('TOKENS_EDITOR_HIDE') : this.l10n.getMsgS('TOKENS_EDITOR_SHOW')
    }
  },
  methods: {
    toggleShowTokensEditBlocks () {
      this.showTokensEditBlocks = !this.showTokensEditBlocks
      if (this.showTokensEditBlocks) {
        this.renderTokensEditor = true
      }
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-header {
    margin: 15px 0;
  }
</style>