<template>
    <div class="alpheios-editor-content-pagination" >
        <span class="alpheios-editor-content-pagination-span alpheios-editor-content-pagination-link" 
              @click = "getPage(first)" v-if="showPaginationFirst">
              {{ first }}</span>
        <span class="alpheios-editor-content-pagination-span alpheios-editor-content-pagination-text" 
              v-if="showPointsFirstPrevious">
              ...</span>
        <span class="alpheios-editor-content-pagination-span alpheios-editor-content-pagination-link" 
              @click = "getPage(previous)" v-if="showPaginationPrevious">
              {{ previous }}</span>
        <span class="alpheios-editor-content-pagination-span alpheios-editor-content-pagination-text" >
              {{ current }}</span>
        <span class="alpheios-editor-content-pagination-span alpheios-editor-content-pagination-link" 
              @click = "getPage(next)" v-if="showPaginationNext">
              {{ next }}</span>
        <span class="alpheios-editor-content-pagination-span alpheios-editor-content-pagination-text" 
              v-if="showPointsNextLast">
              ...</span>
        <span class="alpheios-editor-content-pagination-span alpheios-editor-content-pagination-link" 
              @click = "getPage(last)" v-if="showPaginationLast">
              {{ last }}</span>

        <span class="alpheios-editor-content-pagination-span alpheios-editor-content-pagination-go-to">
          <label class="alpheios-alignment-editor-metadata-item__label">
            {{ l10n.getMsgS('UPLOAD_DTSAPI_GO_TO_PAGE') }}</label>
          <input
              class="alpheios-alignment-input alpheios-alignment-editor-pagination-go-to"
              type="number"
              v-model="state.goToValue"
              id="alpheios-alignment-editor-pagination-go-to-input"
              @keyup.enter = "goToPage"
              :min = "first"
              :max = "last"
          >
        </span>
    </div>
</template>
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

import { computed, inject, reactive, onMounted } from 'vue'

const l10n = computed(() => { return L10nSingleton })
const emit = defineEmits([ 'getPage' ])

const props = defineProps({
  first: {
    type: Number,
    required: true
  },
  previous: {
    type: Number,
    required: false
  },
  next: {
    type: Number,
    required: false
  },
  last: {
    type: Number,
    required: true
  },
  current: {
    type: Number,
    required: true
  }
})

const state = reactive({
  goToValue: null
})

const showPaginationFirst = computed(() => {
  return props.first !== props.current
})

const showPointsFirstPrevious = computed(() => {
  return props.previous && (props.first !== props.previous)
})

const showPaginationPrevious = computed(() => {
  return props.previous && (props.first !== props.previous)
})

const showPaginationNext = computed(() => {
  return props.next && (props.next !== props.last)
})

const showPointsNextLast = computed(() => {
  return props.next && (props.next !== props.last)
})

const showPaginationLast = computed(() => {
  return props.last !== props.current
})

const getPage = (pageNum) => {
  emit('getPage', pageNum)
}

const goToPage = () => {
  if ((state.goToValue >= props.first) && (state.goToValue <= props.last) && (state.goToValue !== props.current)) {
    emit('getPage', state.goToValue)
  }
}


</script>

<style lang="scss">
.alpheios-editor-content-pagination {
  margin-bottom: 10px;
}

.alpheios-editor-content-pagination-link {
  padding: 5px;
  background: #ddd;
  cursor: pointer;
  margin-right: 5px;
  font-weight: bold;
}

.alpheios-editor-content-pagination-text {
  padding: 5px;
  margin-right: 5px;
}

.alpheios-editor-content-pagination-span {
  display: inline-block;
}

.alpheios-editor-content-pagination-go-to input.alpheios-alignment-editor-pagination-go-to {
    display: inline-block;
    width: 150px;
}
</style>