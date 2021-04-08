<template>
  <div class="alpheios-alignment-align-editor-block alpheios-alignment-editor-container  alpheios-tools-enabled">
      <h2>{{ l10n.getMsgS('ALIGN_EDITOR_HEADING') }}</h2>
    
    <align-editor-view-mode v-if="renderAlignEditor"/>   
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
  },
  data () {
    return {
    }
  },
  watch: {
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    renderAlignEditor ()  {
      return this.$store.state.alignmentUpdated && this.$alignedGC.alignmentGroupsWorkflowStarted
    }
  },
  methods: {
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-align-editor-block.alpheios-alignment-editor-container {
    padding: 20px 10px 20px 40px;  
  }

</style>