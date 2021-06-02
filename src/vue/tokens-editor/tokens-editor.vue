<template>
  <div class="alpheios-alignment-editor-container">
    <div class="alpheios-alignment-editor-header">
      <h2>{{ l10n.getMsgS('TOKENS_EDITOR_HEADING') }}</h2>
    </div>

    <tokens-editor-inner-block v-if="renderTokensEditor"/>
    
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
    renderEditor: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      renderTokensEditor: false
    }
  },
  watch: {
    '$store.state.alignmentRestarted' () {
      this.renderTokensEditor = false
    },
    'renderEditor' () {
      if (this.alignmentStared) { this.renderTokensEditor = true }
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    alignmentStared ()  {
      return this.$store.state.alignmentUpdated && this.$alignedGC.alignmentGroupsWorkflowStarted
    }
  },
  methods: {
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-header {
    margin: 15px 0;
  }
</style>