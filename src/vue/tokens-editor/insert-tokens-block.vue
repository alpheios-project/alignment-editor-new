<template>
  <modal-base modalName="insert-tokens" :draggable="true" height="auto" :shiftY="0.3" > 
    <div class="alpheios-alignment-editor-modal-insert-tokens" >
      <div class="alpheios-modal-header" v-if="props.token">
          <span class="alpheios-alignment-modal-close-icon" @click = "closeModal">
              <x-close-icon />
          </span>
          <h3 class="alpheios-alignment-editor-modal-header">
            {{ l10n.getMsgS('INSERT_TOKENS_BLOCK_HEADER', { word: props.token.word }) }}</h3>
      </div>
      <div class="alpheios-modal-body" v-if="props.token">
        <div class = "alpheios-alignment-radio-block alpheios-alignment-option-item__control" >
            <span v-for="(dir, dirIndex) in directions" :key="dirIndex">
                <input type="radio" :id="itemIdWithValue(dir.value)" :value="dir.value" v-model="state.curDirection" >
                <label :for="itemIdWithValue(dir.value)">{{ dir.label }}</label>
            </span>
        </div>
        <textarea id="alpheios-alignment-insert-tokens-textarea" v-model="state.words" 
            class="alpheios-alignment-editor-text-blocks-textarea">
        ></textarea>
      </div>
      <div class="alpheios-modal-footer" v-if="props.token">
        <p class="alpheios-alignment-annotations-footer__buttons" >
          <button class="alpheios-editor-button-tertiary alpheios-modal-button"
              @click="insertTokens" :disabled="false">
              {{ l10n.getMsgS('INSERT_TOKENS_BLOCK_SAVE_BUTTON') }}
          </button>
          <button class="alpheios-editor-button-tertiary alpheios-modal-button" @click="closeModal">
            {{ l10n.getMsgS('INSERT_TOKENS_BLOCK_CANCEL_BUTTON') }}</button>
        </p>
      </div>
    </div>
  </modal-base>
</template>
<script setup>
import XCloseIcon from '@/inline-icons/xclose.svg'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import HistoryStep from '@/lib/data/history/history-step.js'

import { computed, inject, reactive, watch } from 'vue'
import { useStore } from 'vuex'

const l10n = computed(() => { return L10nSingleton })
const $tokensEC = inject('$tokensEC')
const $modal =  inject('$modal')

const props = defineProps({
  token: {
    type: Object,
    required: false
  }
})

const state = reactive({
  curDirection: null,
  words: null
})

const directions = computed(() => {
  state.curDirection = HistoryStep.directions.PREV
  return [ 
          { label: l10n.value.getMsgS('INSERT_TOKENS_DIR_PREV'), value: HistoryStep.directions.PREV },
          { label: l10n.value.getMsgS('INSERT_TOKENS_DIR_NEXT'), value: HistoryStep.directions.NEXT }
        ]
})

const initData = () => {
  state.words = null
  state.curDirection = HistoryStep.directions.PREV
}

const itemIdWithValue = (dir) => {
  return `alpheios-alignment-radio-direction-${dir}`
}

const insertTokens = () => {
  $tokensEC.insertTokens(state.words, props.token, state.curDirection)
  closeModal()
}

const closeModal = () => {
  $modal.hide('insert-tokens')
  initData()
}

</script>

<style lang="scss">
  .alpheios-alignment-editor-modal-insert-tokens {
    .alpheios-modal-body {
        border: 0;
        padding: 0;
    }

    .alpheios-alignment-radio-block {
      margin-top: 0;
      margin-bottom: 15px;
      span {
        display: inline-block;
        margin-right: 20px;
        vertical-align: middle;
      }
    }

    .alpheios-alignment-editor-text-blocks-textarea {
      padding: 10px 55px 10px 10px;
      width:100%;
      min-height: 100px;
      font-size: inherit;
    }
  }
</style>
