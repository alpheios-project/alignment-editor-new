<template>
    <div class="alpheios-token-edit-actions" v-show="token"
         :style = "cssStyles"
    >
      <div class="alpheios-token-edit-actions-inner" ref="actionsInner">
        <actions-button tooltipMess = "ACTION_BUTTON_UPDATE_TOKEN" :allowedCondition = "allowedUpdateTokenWord"
                        actionName = "update_token" @click = "$emit('updateTokenWord', token)">
          <template v-slot:enabled><pen-icon /></template>
          <template v-slot:disabled><pen-icon /></template>
        </actions-button>

        <actions-button tooltipMess = "ACTION_BUTTON_MERGE_LEFT" :allowedCondition = "allowedMergePrev"
                        actionName = "merge_left" @click = "mergeToPrev">
          <template v-slot:enabled><merge-left-icon /></template>
          <template v-slot:disabled><merge-left-icon /></template>
        </actions-button>

        <actions-button tooltipMess = "ACTION_BUTTON_MERGE_RIGHT" :allowedCondition = "allowedMergeNext"
                        actionName = "merge_right" @click = "mergeToNext">
          <template v-slot:enabled><merge-right-icon /></template>
          <template v-slot:disabled><merge-right-icon /></template>
        </actions-button>

        <actions-button tooltipMess = "ACTION_BUTTON_SPLIT_TOKEN" :allowedCondition = "allowedSplit"
                        actionName = "split" @click = "$emit('splitToken', token)">
          <template v-slot:enabled><split-icon /></template>
          <template v-slot:disabled><split-icon /></template>
        </actions-button>

        <actions-button tooltipMess = "ACTION_BUTTON_ADD_LINEBREAK" :allowedCondition = "allowedAddLineBreak"
                        actionName = "enter" @click = "$emit('addLineBreak', token)">
          <template v-slot:enabled><enter-icon /></template>
          <template v-slot:disabled><enter-icon /></template>
        </actions-button>

        <actions-button tooltipMess = "ACTION_BUTTON_REMOVE_LINEBREAK" :allowedCondition = "allowedRemoveLineBreak"
                        actionName = "remove_enter" @click = "$emit('removeLineBreak', token)">
          <template v-slot:enabled><remove-enter-icon /></template>
          <template v-slot:disabled><remove-enter-icon /></template>
        </actions-button>

        <actions-button tooltipMess = "ACTION_BUTTON_TO_PREV_SEGMENT" :allowedCondition = "allowedToPrevSegment"
                        actionName = "move_to_prev_segment" @click = "$emit('moveToPrevSegment', token)">
          <template v-slot:enabled><prev-icon /></template>
          <template v-slot:disabled><prev-icon /></template>
        </actions-button>

        <actions-button tooltipMess = "ACTION_BUTTON_TO_NEXT_SEGMENT" :allowedCondition = "allowedToNextSegment"
                        actionName = "move_to_next_segment" @click = "$emit('moveToNextSegment', token)">
          <template v-slot:enabled><next-icon /></template>
          <template v-slot:disabled><next-icon /></template>
        </actions-button>

        <actions-button tooltipMess = "ACTION_BUTTON_DELETE" :allowedCondition = "allowedDelete"
                        actionName = "delete" @click = "$emit('deleteToken', token)">
          <template v-slot:enabled><delete-icon /></template>
          <template v-slot:disabled><delete-icon /></template>
        </actions-button>
      </div>
    </div>
</template>
<script>
import PenIcon from '@/inline-icons/pen.svg'
import SplitIcon from '@/inline-icons/split.svg'
import MergeLeftIcon from '@/inline-icons/merge-left.svg'
import MergeRightIcon from '@/inline-icons/merge-right.svg'

import EnterIcon from '@/inline-icons/enter.svg'
import RemoveEnterIcon from '@/inline-icons/remove-enter.svg'

import NextIcon from '@/inline-icons/next.svg'
import PrevIcon from '@/inline-icons/prev.svg'

import DeleteIcon from '@/inline-icons/delete.svg'

import Tooltip from '@/vue/common/tooltip.vue'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import HistoryStep from '@/lib/data/history/history-step.js'
import ActionsButtonTokenEdit from '@/vue/tokens-editor/actions-button-token-edit.vue'

export default {
  name: 'ActionsMenuTokenEdit',
  components: {
    penIcon: PenIcon,
    splitIcon: SplitIcon,
    mergeLeftIcon: MergeLeftIcon,
    mergeRightIcon: MergeRightIcon,
    enterIcon: EnterIcon,
    removeEnterIcon: RemoveEnterIcon,
    nextIcon: NextIcon,
    prevIcon: PrevIcon,
    deleteIcon: DeleteIcon,
    actionsButton: ActionsButtonTokenEdit
  },
  props: {
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
  },
  data () {
    return {
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    cssStyles () {
      const  top = this.topPos + 'px'
      const menuWidth = this.$refs.actionsInner ? this.$refs.actionsInner.offsetWidth : 0

      if ((this.leftPos + menuWidth + 20) > this.containerWidth) {
        return { 
          right: '0px',
          top
        }
      } else {
        return { 
          left: (this.leftPos - 10) + 'px',
          top
        }
      }
    }, 
    allowedUpdateTokenWord () {
      return this.$store.state.optionsUpdated && this.$settingsC.allowUpdateTokenWordOptionValue
    },
    allowedMergePrev () {
      return this.$store.state.optionsUpdated && this.$tokensEC.allowedMergePrev(this.token)
    },
    allowedMergeNext () {
      return this.$store.state.optionsUpdated && this.$tokensEC.allowedMergeNext(this.token)
    },
    allowedSplit () {
      return this.$store.state.optionsUpdated && this.$tokensEC.allowedSplit(this.token)
    },
    allowedAddLineBreak () {
      return this.$store.state.optionsUpdated && this.$tokensEC.allowedAddLineBreak(this.token)
    },
    allowedRemoveLineBreak () {
      return this.$store.state.optionsUpdated && this.$tokensEC.allowedRemoveLineBreak(this.token)
    },
    allowedToNextSegment () {
      return this.$store.state.optionsUpdated && this.$tokensEC.allowedToNextSegment(this.token)
    },
    allowedToPrevSegment () {
      return this.$store.state.optionsUpdated && this.$tokensEC.allowedToPrevSegment(this.token)
    },
    allowedDelete () {
      return this.$store.state.optionsUpdated && this.$tokensEC.allowedDelete(this.token)
    }
  },
  methods: {
    mergeToPrev () {
      this.$emit('mergeToken', this.token, HistoryStep.directions.PREV)
    },
    mergeToNext () {
      this.$emit('mergeToken', this.token, HistoryStep.directions.NEXT)
    }
  }
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
