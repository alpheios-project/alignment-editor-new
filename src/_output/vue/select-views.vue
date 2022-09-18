<template>
    <div class = "alpheios-alignment-header-line" :class="{ 'alpheios-alignment-header-line-in-header' : inHeader }">
        <div class = "alpheios-alignment-radio-block alpheios-alignment-option-item__control">
            <span v-for="(item, idx) in state.localAllViewTypes" :key="idx">
              <input type="radio" :id="itemIdWithValue(item.value)" :value="item.value" v-model="state.viewType" 
                :data-checked1="item.value"
                :data-checked2="state.viewType"
                @change="changeViewType"
                :ref="el => (itemRefs[idx] = el)"
              />
              <label :for="itemIdWithValue(item.value)" @click = "clickInput(idx)"> {{ item.label }} </label>
            </span>
            <span>
            <select
                class="alpheios-alignment-select alpheios-alignment-select__sentence-count"
                v-model="state.sentenceCount" id="alpheios-alignment-select__sentence-count"
                @change="changeViewType"
                >
              <option v-for="item in state.sentenceChoice" :key="item.value" :value = "item.value">{{ item.label }}</option>
            </select>
            </span>
        </div>

    </div>
</template>
<script setup>
import Tooltip from '@/_output/vue/common/tooltip.vue'
import { computed, inject, reactive, onMounted, watch, ref, nextTick } from 'vue'

const emit = defineEmits([ 'updateViewType' ])
const itemRefs = []

const props = defineProps({
  inHeader: {
    type: Boolean,
    required: false,
    default: true
  },
  allViewTypes: {
    type: Array,
    required: true
  }
})

const state = reactive({
  sentenceCount: 0,
  viewType: null,
  sentenceChoice: [
    { value: 0, label: 'current' },
    { value: 1, label: 'one on each side' }
  ],
  localAllViewTypes: []
})

onMounted(async () => {
  props.allViewTypes.forEach(viewType => {
    state.localAllViewTypes.push(viewType)
    itemRefs.push(ref(null))
  })
  state.viewType = state.localAllViewTypes[0]

  await nextTick()
  itemRefs[0].click()
})

const itemIdWithValue = (value) => {
  return `alpheios-alignment-radio-block__${value.toLowerCase().replace(' ', '_')}`
}

const changeViewType = () => {
  emit('updateViewType', { viewType: state.viewType, sentenceCount: state.sentenceCount })
}

const clickInput = (itemIndex) => {
  if (!itemRefs[itemIndex].checked) {
    itemRefs[itemIndex].click()
  }
}
</script>

<style lang="scss">
  .alpheios-alignment-header-line {
    padding: 60px 0 10px;
    &.alpheios-alignment-header-line-in-header {
      padding-top: 0;
    }
  }

  .alpheios-alignment-radio-block {
    // margin: 0 10px 10px;
    span {
        display: block;
        // margin-right: 20px;
        // margin-bottom: 5px;
        background: #fff;
        border-bottom: 1px solid #e0e0e0;
        padding: 5px;
    }

    input.alpheios-alignment-input__sentence-count {
      width: 50px;
    }
  }

  .alpheios-alignment-header-line-in-header {
    .alpheios-alignment-radio-block {
      text-align: right;
      span {
        display: inline-block;
        margin-right: 20px;
        margin-bottom: 5px;
        background: transparent;
        border-bottom: none;
        padding: 0;

        &:last-of-type {
          margin-right: 0;
        }
      }
    }
  }
</style>