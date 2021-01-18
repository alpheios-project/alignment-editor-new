<template>
    <span class="alpheios-token-edit-actions-button-container">
        <tooltip :tooltipText = "tooltipText" tooltipDirection = "top" v-if="allowedCondition">
            <span class = "alpheios-token-edit-actions-button" 
                :id = "spanId" 
                @click = "$emit('click')"
            >
            <slot name = "enabled"></slot>
            </span>
        </tooltip>
        <span class = "alpheios-token-edit-actions-button alpheios-token-edit-actions-button__disabled" v-if="!allowedCondition"
                :id = "spanId" 
            >
            <slot name = "disabled"></slot>
        </span>
    </span>
</template>
<script>
import Tooltip from '@/vue/common/tooltip.vue'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'ActionsButtonTokenEdit',
  components: {
    tooltip: Tooltip
  },
  props: {
    tooltipMess: {
      type: String,
      required: true
    },
    allowedCondition: {
      type: Boolean,
      required: true
    },
    actionName: {
      type: String,
      required: true
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },

    tooltipText () {
      return this.l10n.getMsgS(this.tooltipMess)
    },

    spanId () {
      return `alpheios-token-edit-actions-button__${this.actionName.replace(' ', '_')}`
    }
  }
}

</script>
<style lang="scss">
  .alpheios-token-edit-actions-button-container {
    display: inline-block;
    vertical-align: middle;
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
