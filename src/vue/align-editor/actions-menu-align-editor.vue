<template>
    <div class="alpheios-alignment-editor-actions-menu" data-alpheios-ignore="all">
      <div class="alpheios-alignment-editor-actions-menu__buttons">
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button  alpheios-disabled"  
                id="alpheios-actions-menu-align-editor-button__undo"
            @click="undoAction" :disabled="!undoAvailable" >
            {{ l10n.getMsgS('ACTIONS_UNDO_TITLE') }}
        </button>
        <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button  alpheios-disabled" 
                id="alpheios-actions-menu-align-editor-button__redo"
            @click="redoAction" :disabled="!redoAvailable" >
            {{ l10n.getMsgS('ACTIONS_REDO_TITLE') }}
        </button>
      </div>
    </div>
</template>
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import { computed, inject, reactive, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'

const $store = useStore()
const l10n = computed(() => { return L10nSingleton })

const $alignedGC = inject('$alignedGC')
const $historyAGC = inject('$historyAGC')

const alignEditAvailable = computed(() => {
  return $store.state.docSourceUpdated && $store.state.alignmentUpdated && 
         $store.state.uploadCheck && $alignedGC.alignmentGroupsWorkflowStarted
})

const undoAvailable = computed(() => {
  return alignEditAvailable.value && $historyAGC.undoAvailable
})

const redoAvailable = computed(() => {
  return alignEditAvailable.value && $historyAGC.redoAvailable
})

const undoAction = () => {
  $historyAGC.undo()
}

const redoAction = () => {
  $historyAGC.redo()
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
    
    .alpheios-actions-menu-button {
      margin-right: 10px;
    }

  }
</style>