<template>
    <div class="alpheios-token-edit-actions" v-show="props.token"
         :style = "cssStyles"
    >
      <div class="alpheios-token-edit-actions-inner" ref="el => (actionsInner = el)">
        <edit-token-button tooltipMess = "ACTION_BUTTON_UPDATE_TOKEN" :allowedCondition = "allowedUpdateTokenWord"
                        actionName = "update_token" @click = "emit('updateTokenWord', props.token)" 
                        v-show="enableEditTokensValue">
          <template v-slot:enabled><pen-icon /></template>
          <template v-slot:disabled><pen-icon /></template>
        </edit-token-button>

        <edit-token-button tooltipMess = "ACTION_BUTTON_MERGE_NEXT" :allowedCondition = "allowedMergeNext"
                        actionName = "merge_right" @click = "mergeToNext" v-show="enableMergeSplitTokensValue">
          <template v-slot:enabled><merge-right-icon /></template>
          <template v-slot:disabled><merge-right-icon /></template>
        </edit-token-button>

        <edit-token-button tooltipMess = "ACTION_BUTTON_SPLIT_TOKEN" :allowedCondition = "allowedSplit"
                        actionName = "split" @click = "emit('splitToken', props.token)" v-show="enableMergeSplitTokensValue">
          <template v-slot:enabled><split-icon /></template>
          <template v-slot:disabled><split-icon /></template>
        </edit-token-button>

        <edit-token-button tooltipMess = "ACTION_BUTTON_ADD_LINEBREAK" :allowedCondition = "allowedAddLineBreak"
                        actionName = "enter" @click = "emit('addLineBreak', props.token)" v-show="enableAddDeleteNewLinesValue">
          <template v-slot:enabled><enter-icon /></template>
          <template v-slot:disabled><enter-icon /></template>
        </edit-token-button>

        <edit-token-button tooltipMess = "ACTION_BUTTON_REMOVE_LINEBREAK" :allowedCondition = "allowedRemoveLineBreak"
                        actionName = "remove_enter" @click = "emit('removeLineBreak', props.token)" v-show="enableAddDeleteNewLinesValue">
          <template v-slot:enabled><remove-enter-icon /></template>
          <template v-slot:disabled><remove-enter-icon /></template>
        </edit-token-button>

        <edit-token-button tooltipMess = "ACTION_BUTTON_TO_PREV_SEGMENT" :allowedCondition = "allowedToPrevSegment"
                        actionName = "move_to_prev_segment" @click = "emit('moveToPrevSegment', props.token)"
                        v-show="enableMoveTokensToSegmentValue && renderMoveToPrevSegment"
                        >
          <template v-slot:enabled><prev-icon /></template>
          <template v-slot:disabled><prev-icon /></template>
        </edit-token-button>

        <edit-token-button tooltipMess = "ACTION_BUTTON_TO_NEXT_SEGMENT" :allowedCondition = "allowedToNextSegment"
                        actionName = "move_to_next_segment" @click = "emit('moveToNextSegment', props.token)"
                        v-show="enableMoveTokensToSegmentValue && renderMoveToNextSegment"
                        >
          <template v-slot:enabled><next-icon /></template>
          <template v-slot:disabled><next-icon /></template>
        </edit-token-button>

        <edit-token-button tooltipMess = "ACTION_BUTTON_INSERT" :allowedCondition = "allowedInsert"
                        actionName = "insert" @click = "emitInsertTokens"
                        v-show="enableAddDeleteTokensValue">
          <template v-slot:enabled><big-plus-icon /></template>
          <template v-slot:disabled><big-plus-icon /></template>
        </edit-token-button>

        <edit-token-button tooltipMess = "ACTION_BUTTON_DELETE" :allowedCondition = "allowedDelete"
                        actionName = "delete" @click = "emit('deleteToken', props.token)" v-show="enableAddDeleteTokensValue">
          <template v-slot:enabled><delete-icon /></template>
          <template v-slot:disabled><delete-icon /></template>
        </edit-token-button>
      </div>
    </div>
</template>
<script setup>
import PenIcon from '@/inline-icons/pen.svg'
import SplitIcon from '@/inline-icons/split.svg'
import MergeLeftIcon from '@/inline-icons/merge-left.svg'
import MergeRightIcon from '@/inline-icons/merge-right.svg'
import EnterIcon from '@/inline-icons/enter.svg'
import RemoveEnterIcon from '@/inline-icons/remove-enter.svg'
import NextIcon from '@/inline-icons/next.svg'
import PrevIcon from '@/inline-icons/prev.svg'
import DeleteIcon from '@/inline-icons/delete.svg'
import BigPlusIcon from '@/inline-icons/big-plus.svg'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import HistoryStep from '@/lib/data/history/history-step.js'
import EditTokenButton from '@/vue/tokens-editor/actions-menu/edit-token-button.vue'
import SettingsController from '@/lib/controllers/settings-controller'

import { computed, inject, reactive, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'

const $store = useStore()
const l10n = computed(() => { return L10nSingleton })

const emit = defineEmits([ 'updateTokenWord', 'splitToken', 'mergeToken', 'addLineBreak', 'removeLineBreak', 'moveToPrevSegment', 'moveToNextSegment', 'insertTokens', 'deleteToken' ])

const $alignedGC = inject('$alignedGC')
const $tokensEC = inject('$tokensEC')

const actionsInner = ref(null)
const props = defineProps({
  token: {
    type: Object,
    required: false
  },
  leftPos: {
    type: Number,
    required: false,
    default: 0
  },
  topPos: {
    type: Number,
    required: false,
    default: 0
  },
  containerWidth: {
    type: Number,
    required: false,
    default: 0
  }
})

const cssStyles = computed(() => {
  const  top = props.topPos + 'px'
  const menuWidth = actionsInner.value ? actionsInner.value.offsetWidth : 0

  if ((props.leftPos + menuWidth + 20) > props.containerWidth) {
    return { 
      right: '0px',
      top
    }
  } else {
    return { 
      left: (props.leftPos - 10) + 'px',
      top
    }
  }
})

const allowedUpdateTokenWord = computed(() => {
  return $store.state.optionsUpdated && SettingsController.allowUpdateTokenWordOptionValue
})

const allowedMergePrev = computed(() => {
  return $store.state.optionsUpdated && $store.state.tokenUpdated && $tokensEC.allowedMergePrev(props.token)
})

const allowedMergeNext = computed(() => {
  return $store.state.optionsUpdated && $store.state.tokenUpdated && $tokensEC.allowedMergeNext(props.token)
})

const allowedSplit = computed(() => {
  return $store.state.optionsUpdated && $store.state.tokenUpdated && $tokensEC.allowedSplit(props.token)
})

const allowedAddLineBreak = computed(() => {
  return $store.state.optionsUpdated && $tokensEC.allowedAddLineBreak(props.token)
})

const allowedRemoveLineBreak = computed(() => {
  return $store.state.optionsUpdated && $tokensEC.allowedRemoveLineBreak(props.token)
})

const allowedToNextSegment = computed(() => {
  return $store.state.optionsUpdated && $tokensEC.allowedToNextSegment(props.token)
})

const allowedToPrevSegment = computed(() => {
  return $store.state.optionsUpdated && $tokensEC.allowedToPrevSegment(props.token)
})

const allowedDelete = computed(() => {
  return $store.state.optionsUpdated && $store.state.tokenUpdated && $tokensEC.allowedDelete(props.token)
})

const allowedInsert = computed(() => {
  return true
})

const renderMoveToPrevSegment = computed(() => {
  return $store.state.alignmentRestarted && $store.state.uploadCheck && !$alignedGC.hasOnlyOneSegment
})

const renderMoveToNextSegment = computed(() => {
  return $store.state.alignmentRestarted && $store.state.uploadCheck && !$alignedGC.hasOnlyOneSegment
})

const enableAddDeleteNewLinesValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.enableAddDeleteNewLines
})

const enableAddDeleteTokensValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.enableAddDeleteTokens
})

const enableMergeSplitTokensValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.enableMergeSplitTokens
})

const enableMoveTokensToSegmentValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.enableMoveTokensToSegment
})

const enableEditTokensValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.enableEditTokens
})

const mergeToPrev = () => {
  emit('mergeToken', props.token, HistoryStep.directions.PREV)
}

const mergeToNext = () => {
  emit('mergeToken', props.token, HistoryStep.directions.NEXT)
}

const emitInsertTokens = () => {
  emit('insertTokens', props.token)
}
</script>

<style lang="scss">
  .alpheios-token-edit-actions {
    display: inline-block;
    padding: 0 10px;

    position: absolute;
    top: -10px;
    z-index: 1000;
  }
</style>
