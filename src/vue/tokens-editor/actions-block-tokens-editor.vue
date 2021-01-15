<template>
    <div class="alpheios-alignment-editor-actions-menu">
      <div class="alpheios-alignment-editor-actions-menu__buttons">
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button"  id="alpheios-actions-menu-button__undo"
            @click="undo" >
            {{ l10n.getMsgS('ACTIONS_TOKENS_EDIT_UNDO') }}
        </button>
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" id="alpheios-actions-menu-button__redo"
            @click="redo" >
            {{ l10n.getMsgS('ACTIONS_TOKENS_EDIT_REDO') }}
        </button>
      </div>
    </div>
</template>
<script>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'ActionsBlockTokensEditor',
  props: {
  },
  data () {
    return {
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    }
  },
  methods: {
    undo () {
      console.info('undo tokens edit')
    },
    redo () {
      console.info('redo tokens edit')
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-actions-menu__buttons,
  .alpheios-alignment-editor-actions-menu__upload-block {
    padding: 5px 0 15px;
    text-align: left;
  }
</style>