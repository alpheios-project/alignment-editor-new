<template>
    <div class="alpheios-alignment-editor-actions-menu">
      <div class="alpheios-alignment-editor-actions-menu__buttons">
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button"  id="alpheios-actions-menu-align-editor-button__undo"
            @click="undoAction" :disabled="!undoAvailable" >
            {{ l10n.getMsgS('ACTIONS_UNDO_TITLE') }}
        </button>
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-align-editor-button__redo"
            @click="redoAction" :disabled="!redoAvailable" >
            {{ l10n.getMsgS('ACTIONS_REDO_TITLE') }}
        </button>
      </div>
    </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'ActionsMenuAlignEditor',
  props: {
  },
  data () {
    return {
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    alignEditAvailable () {
      return this.$store.state.docSourceUpdated && this.$store.state.alignmentUpdated && this.$alignedGC.alignmentGroupsWorkflowStarted
    },
    undoAvailable () {
      return this.alignEditAvailable && this.$historyAGC.undoAvailable
    },
    redoAvailable () {
      return this.alignEditAvailable && this.$historyAGC.redoAvailable
    }
  },
  methods: {
    undoAction () {
      this.$historyAGC.undo()
    },
    redoAction () {
      this.$historyAGC.redo()
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-actions-menu {
    display: inline-block;
    width: 50%;
    vertical-align: middle;
    text-align: right;
    padding-right: 10px;
  }

  .alpheios-alignment-editor-actions-menu__buttons{
    padding: 5px 0 10px;
    text-align: left;
    display: inline-block;
  }
</style>