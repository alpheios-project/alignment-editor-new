<template>
    <span class="alpheios-token-edit-actions-button-container">
        <tooltip :tooltipText = "tooltipText" tooltipDirection = "top" v-if="allowedCondition">
            <span class = "alpheios-token-edit-actions-button" 
                :id = "spanId" 
                @click.stop = "emit('click')"
            >
            <slot name = "enabled"></slot>
            </span>
        </tooltip>
        <tooltip :tooltipText = "tooltipText" tooltipDirection = "top" v-if="!allowedCondition">
          <span class = "alpheios-token-edit-actions-button alpheios-token-edit-actions-button__disabled" 
                  :id = "spanId" 
              >
              <slot name = "disabled"></slot>
          </span>
        </tooltip>
    </span>
</template>
<script setup>
import Tooltip from '@/vue/common/tooltip.vue'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import { computed, inject, reactive, onMounted, watch, ref } from 'vue'

const emit = defineEmits([ 'click' ])

const l10n = computed(() => { return L10nSingleton })
const props = defineProps({
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
})

const tooltipText = computed(() => {
  return l10n.value.getMsgS(props.tooltipMess)
})

const spanId = computed(() => {
  return `alpheios-token-edit-actions-button__${props.actionName.replace(' ', '_')}`
})

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
