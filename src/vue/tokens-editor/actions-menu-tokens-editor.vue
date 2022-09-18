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
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import { computed, inject, reactive, watch } from 'vue'

import { useStore } from 'vuex'

const emit = defineEmits([ 'blockTokensActions', 'blockTokensActions' ])

const l10n = computed(() => { return L10nSingleton })
const $store = useStore()
const $tokensEC = inject('$tokensEC')

const undoTokensEditAvailable = computed(() => {
  return $store.state.tokenUpdated && $store.state.uploadCheck && $tokensEC.undoTokensEditAvailable
})

const redoTokensEditAvailable = computed(() => {
  return $store.state.tokenUpdated && $store.state.uploadCheck && $tokensEC.redoTokensEditAvailable
})

const undoTokensEditStep = () => {
  emit('blockTokensActions')
  $tokensEC.undoTokensEditStep()
}

const redoTokensEditStep = () => {
  emit('blockTokensActions')
  $tokensEC.redoTokensEditStep()
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