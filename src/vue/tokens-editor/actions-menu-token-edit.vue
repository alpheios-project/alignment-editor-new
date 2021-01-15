<template>
    <div class="alpheios-token-edit-actions" v-show="token"
         :style = "cssStyles"
    >
      <div class="alpheios-token-edit-actions-inner" ref="actionsInner">
        <actions-button tooltipMess = "ACTION_BUTTON_UPDATE_TOKEN" :allowedCondition = "allowedUpdateTokenWord"
                        actionName = "update_token" @click = "$emit('updateTokenWord', token)">
          <template v-slot:enabled><ok-icon /></template>
          <template v-slot:disabled><ok-icon /></template>
        </actions-button>

        <actions-button tooltipMess = "ACTION_BUTTON_MERGE_LEFT" :allowedCondition = "allowedMergeLeft"
                        actionName = "merge_left" @click = "mergeToLeft">
          <template v-slot:enabled><merge-left-icon /></template>
          <template v-slot:disabled><merge-left-icon /></template>
        </actions-button>

        <actions-button tooltipMess = "ACTION_BUTTON_MERGE_RIGHT" :allowedCondition = "allowedMergeRight"
                        actionName = "merge_right" @click = "mergeToRight">
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
      </div>
    </div>
</template>
<script>
import OkIcon from '@/inline-icons/ok.svg'
import SplitIcon from '@/inline-icons/split.svg'
import MergeLeftIcon from '@/inline-icons/merge-left.svg'
import MergeRightIcon from '@/inline-icons/merge-right.svg'
import EnterIcon from '@/inline-icons/enter.svg'

import Tooltip from '@/vue/common/tooltip.vue'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import TokensEditController from '@/lib/controllers/tokens-edit-controller.js'
import ActionsButtonTokenEdit from '@/vue/tokens-editor/actions-button-token-edit.vue'

export default {
  name: 'ActionsMenuTokenEdit',
  components: {
    okIcon: OkIcon,
    splitIcon: SplitIcon,
    mergeLeftIcon: MergeLeftIcon,
    mergeRightIcon: MergeRightIcon,
    enterIcon: EnterIcon,
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
    allowedMergeLeft () {
      return this.$store.state.optionsUpdated && this.$tokensEC.allowedMergeLeft(this.token)
    },
    allowedMergeRight () {
      return this.$store.state.optionsUpdated && this.$tokensEC.allowedMergeRight(this.token)
    },
    allowedSplit () {
      return this.$store.state.optionsUpdated && this.$tokensEC.allowedSplit(this.token)
    },
    allowedAddLineBreak () {
      return this.$store.state.optionsUpdated && this.$tokensEC.allowedAddLineBreak(this.token)
    }
  },
  methods: {
    mergeToLeft () {
      this.$emit('mergeToken', this.token, TokensEditController.direction.LEFT)
    },
    mergeToRight () {
      this.$emit('mergeToken', this.token, TokensEditController.direction.RIGHT)
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
