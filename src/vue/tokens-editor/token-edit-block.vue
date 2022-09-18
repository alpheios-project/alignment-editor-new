<template>
    <span class="alpheios-alignment-editor-token-edit alpheios-alignment-editor-token-edit-span" :class="additionalClasses" 
          :ref="el => (tokenref = el)">
      {{ token.beforeWord }}

      <tooltip :tooltipText="l10n.getMsgS('TOKENS_EDIT_IS_NOT_EDITABLE_TOOLTIP')" tooltipDirection="top" v-if="!isEditableToken">
        <span class="alpheios-alignment-editor-token-edit-input-container">
          <span class="alpheios-alignment-editor-token-edit__input-width-machine" aria-hidden="true">{{ state.tokenWord }}</span>
        </span>
      </tooltip>

        <span class="alpheios-alignment-editor-token-edit-input-container" v-if="isEditableToken">
          <span class="alpheios-alignment-editor-token-edit__input-width-machine" aria-hidden="true">{{ state.tokenWord }}</span>
          <input
              class = "alpheios-alignment-input alpheios-alignment-editor-token-edit-input"
              type = "text"
              v-model = "state.tokenWord"
              :id = "itemId"
              @focus = "showActionsMenu"
              :disabled = "!isEditableToken"
              @keydown="checkKeyPres"
              :ref = "itemId"
              :class="tokenClasses"
              autocomplete="off"
          >
        </span>
      {{ token.afterWord }}
    </span>
</template>
<script setup>
import Tooltip from '@/vue/common/tooltip.vue'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import HistoryStep from '@/lib/data/history/history-step.js'
import SettingsController from '@/lib/controllers/settings-controller'

import { computed, inject, reactive, onMounted, watch, ref, nextTick  } from 'vue'
import { useStore } from 'vuex'

const emit = defineEmits([ 'hideActionsMenu', 'removeAllActivated', 'showActionsMenu' ])

const $store = useStore()
const l10n = computed(() => { return L10nSingleton })

const $textC = inject('$textC')
const $tokensEC = inject('$tokensEC')

const tokenref = ref(null)

const props = defineProps({
  token: {
    type: Object,
    required: true
  },
  deactivated : {
    type: Number,
    required: false,
    default: 0
  },
  updateTokenIdWord : {
    type: String,
    required: false,
    default: null
  },
  mergeTokenPrevIdWord : {
    type: String,
    required: false,
    default: null
  },
  mergeTokenNextIdWord : {
    type: String,
    required: false,
    default: null
  },
  splitTokenIdWord : {
    type: String,
    required: false,
    default: null
  },
  addLineBreakIdWord : {
    type: String,
    required: false,
    default: null
  },
  removeLineBreakIdWord : {
    type: String,
    required: false,
    default: null
  }
})

const state = reactive({
  tokenWord: null,
  activated: false,
  allowedKeyCodes: [32, 37, 39]
})

watch(
  () => $store.state.tokenUpdated,
  () => { state.tokenWord = props.token.word }
)
watch(
  () => props.deactivated,
  () => { state.tokenWord = props.token.word }
)

watch(
  () => props.updateTokenIdWord,
  () => { 
    if (state.activated && (props.updateTokenIdWord === props.token.idWord)) {
      updateTokenWord()
    }
  }
)

watch(
  () => props.mergeTokenPrevIdWord,
  () => { 
    if (state.activated && (props.mergeTokenPrevIdWord === props.token.idWord)) {
      mergeToken(HistoryStep.directions.PREV)
    }
  }
)

watch(
  () => props.mergeTokenNextIdWord,
  () => { 
    if (state.activated && (props.mergeTokenNextIdWord === props.token.idWord)) {
      mergeToken(HistoryStep.directions.NEXT)
    }
  }
)

watch(
  () => props.splitTokenIdWord,
  () => { 
    if (state.activated && (props.splitTokenIdWord === props.token.idWord)) {
      splitToken()
    }
  }
)

watch(
  () => props.addLineBreakIdWord,
  () => { 
    if (state.activated && (props.addLineBreakIdWord === props.token.idWord)) {
      addLineBreakAfterToken()
    }
  }
)

watch(
  () => props.removeLineBreakIdWord,
  () => { 
    if (state.activated && (props.removeLineBreakIdWord === props.token.idWord)) {
      removeLineBreakAfterToken()
    }
  }
)

onMounted(() => {
  state.tokenWord = props.token.word
})

const itemId = computed(() => {
  return $store.state.tokenUpdated && `${props.token.idWord}-input-id`
})

const additionalClasses = computed(() => {
  return {
    'alpheios-alignment-editor-token-edit-span__activated' : state.activated,
    'alpheios-alignment-editor-token-edit-not-editable': !isEditableToken.value
  }
})

const isEditableToken = computed(() => {
  return $store.state.alignmentUpdated && $tokensEC.isEditableToken(props.token)
})

const allowedUpdateTokenWord = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allowUpdateTokenWordOptionValue
})

const tokenClasses = computed(() => {
  return { 
    'alpheios-token-annotated': hasAnnotations.value
  }
})

const hasAnnotations = computed(() => {
  return $store.state.updateAnnotations && $textC.getAnnotations(props.token).length > 0
})

const updateTokenWord = () => {
  if (allowedUpdateTokenWord.value && (props.token.word !== state.tokenWord)) {
    $tokensEC.updateTokenWord(props.token, state.tokenWord)
    hideActionsMenu()
  }
}

const mergeToken = (direction) => {
  $tokensEC.mergeToken(props.token, direction)
  hideActionsMenu()
}

const splitToken = () =>  {
  $tokensEC.splitToken(props.token, state.tokenWord)
  hideActionsMenu()
}

const addLineBreakAfterToken = () => {
  $tokensEC.addLineBreakAfterToken(props.token)
  hideActionsMenu()
}

const removeLineBreakAfterToken = () => {
  $tokensEC.removeLineBreakAfterToken(props.token)
  hideActionsMenu()
}

const hideActionsMenu = () => {
  state.activated = false
  emit('hideActionsMenu')
}

const showActionsMenu = async () => {
  emit('removeAllActivated')

  await nextTick()

  state.activated = true
  emit('showActionsMenu', {
    token: props.token,
    leftPos: tokenref.value.offsetLeft,
    topPos: tokenref.value.offsetTop
  })
}

const checkKeyPres = (event) => {
  if (!allowedUpdateTokenWord.value && state.allowedKeyCodes.indexOf(event.keyCode) === -1) {
    event.preventDefault()
  }
}
</script>


<style lang="scss">
  .alpheios-alignment-editor-token-edit-span {
    display: inline-block;
    vertical-align: baseline;
    padding: 4px;
    position: relative;
  }

  .alpheios-alignment-editor-token-edit__input-width-machine {
    display: inline-block;
    vertical-align: top;
    padding: 8px;
    visibility: hidden;
  }
 
  .alpheios-alignment-editor-token-edit-input-container {
    display: inline-block;
    vertical-align: baseline;
    position: relative;
    padding: 4px;
    color: #000;
  }

  input.alpheios-alignment-editor-token-edit-input {
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 10;

    &.alpheios-token-annotated {
      border-width: 2px;
      border-color: #ae0000;
    }
  }

  .alpheios-alignment-editor-token-edit-span__activated {
    margin-top: 30px;
  }

  .alpheios-alignment-editor-token-edit-not-editable 
  .alpheios-alignment-editor-token-edit__input-width-machine {
    visibility: initial;
  }



</style>