<template>
    <div class="alpheios-alignment-editor-actions-menu">
      <div class="alpheios-alignment-editor-actions-menu__buttons">
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button"  id="alpheios-actions-menu-tokens-editor-button__undo"
            @click="undoTokensEditStep" :disabled="!undoTokensEditAvailable" >
            {{ l10n.getMsgS('ACTIONS_UNDO_TITLE') }}
        </button>
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-tokens-editor-button__redo"
            @click="redoTokensEditStep" :disabled="!redoTokensEditAvailable" >
            {{ l10n.getMsgS('ACTIONS_REDO_TITLE') }}
        </button>
      </div>
    </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'ActionsMenuTokensEditor',
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
    undoTokensEditAvailable () {
      return this.$store.state.tokenUpdated && this.$tokensEC.undoTokensEditAvailable
    },
    redoTokensEditAvailable () {
      return this.$store.state.tokenUpdated && this.$tokensEC.redoTokensEditAvailable
    }
  },
  methods: {
    undoTokensEditStep () {
      this.$emit('blockTokensActions')
      this.$tokensEC.undoTokensEditStep()
    },
    redoTokensEditStep () {
      this.$emit('blockTokensActions')
      this.$tokensEC.redoTokensEditStep()
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-actions-menu__buttons{
    padding: 5px 0 15px;
    text-align: left;
  }
</style>