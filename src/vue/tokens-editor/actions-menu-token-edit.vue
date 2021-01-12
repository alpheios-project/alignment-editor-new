<template>
    <div class="alpheios-token-edit-actions" v-show="token"
         :style = "cssStyles"
    >
      <div class="alpheios-token-edit-actions-inner" ref="actionsInner">
        <tooltip :tooltipText="l10n.getMsgS('ACTION_BUTTON_UPDATE_TOKEN')" tooltipDirection="top">
          <span class="alpheios-token-edit-actions-button" id="alpheios-token-edit-actions-button__update-token" @click="$emit('updateTokenWord', token)">
            <ok-icon />
          </span>
        </tooltip>
        <tooltip :tooltipText="l10n.getMsgS('ACTION_BUTTON_MERGE_LEFT')" tooltipDirection="top">
          <span class="alpheios-token-edit-actions-button" id="alpheios-token-edit-actions-button__merge-left" @click="$emit('mergeToken', token, 'left')">
              <merge-left-icon />
          </span>
        </tooltip>
        <tooltip :tooltipText="l10n.getMsgS('ACTION_BUTTON_MERGE_RIGHT')" tooltipDirection="top">
          <span class="alpheios-token-edit-actions-button" id="alpheios-token-edit-actions-button__merge-right" @click="$emit('mergeToken', token, 'right')">
            <merge-right-icon />
          </span>
        </tooltip>
        <tooltip :tooltipText="l10n.getMsgS('ACTION_BUTTON_SPLIT_TOKEN')" tooltipDirection="top">
          <span class="alpheios-token-edit-actions-button" id="alpheios-token-edit-actions-button__split" @click="$emit('splitToken', token)">
            <split-icon />
          </span>
        </tooltip>
      </div>
    </div>
</template>
<script>
import OkIcon from '@/inline-icons/ok.svg'
import SplitIcon from '@/inline-icons/split.svg'
import MergeLeftIcon from '@/inline-icons/merge-left.svg'
import MergeRightIcon from '@/inline-icons/merge-right.svg'

import Tooltip from '@/vue/common/tooltip.vue'

import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'ActionsMenuTokenEdit',
  components: {
    okIcon: OkIcon,
    splitIcon: SplitIcon,
    mergeLeftIcon: MergeLeftIcon,
    mergeRightIcon: MergeRightIcon,
    tooltip: Tooltip
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

  .alpheios-token-edit-actions-button {
    display: inline-block;
    margin: 0 2px;
    width: 20px;
    height: 20px;
    vertical-align: middle;
    border: 1px solid;
    border-radius: 20px;
    cursor: pointer;
    text-align: center;
    line-height: 20px;

    padding: 3px;
    svg {
      display: inline-block;
      width: 100%;
      height: 100%;
      vertical-align: top;
    }
  }
</style>
