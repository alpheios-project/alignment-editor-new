<template>
    <p class="alpheios-al-editor-segment-cell-target-row__bar" dir="ltr" ref="barRef">
      <span class="alpheios-al-editor-segment-cell-target-row__metadata"
            :class = "{ 'alpheios-al-editor-segment-cell-target-row__metadata-full': state.showFullMetadata }"
            @click = "toggleMetadata"
            v-show = "props.showData"
      >{{ props.metadataShort }}</span>
      <span class="alpheios-al-editor-segment-cell-target-row__langname" v-show = "props.showData">{{ props.langName }}</span>
    </p>
</template>
<script setup>
import { computed, reactive, inject, onMounted, watch, ref } from 'vue'

const emit = defineEmits([ 'updateMetadataHeight' ])

const props = defineProps({
  langName: {
    type: String,
    required: true
  },
  metadataShort: {
    type: String,
    required: false,
    default: ''
  },
  showData: {
    type: Boolean,
    required: false,
    default: true
  }
})

const state = reactive({
  showFullMetadata: false
})

const barRef = ref(null)

/**
 * Show/hide full metadata and emits an event to adapt padding-top for the cell
 */
const toggleMetadata = async () => {
  state.showFullMetadata = !state.showFullMetadata
  await nextTick()

  const clientRect = modalref.value.getBoundingClientRect() 
  if (clientRect) {
    emit('updateMetadataHeight', clientRect.height)
  }
}

</script>

<style lang="scss">
    .alpheios-al-editor-segment-cell-target-row__bar {
        margin: 0;
        display: inline-block;
        position: absolute;
        min-height: 2px;

        overflow-y: hidden;
        border-bottom: 0;
        top: 0;
        right: 0;
        left: 0;
        margin: 0;
        padding: 0;
        
        padding: 0px;
        font-size: 90%;

        background: #185F6D;
        color: #fff;
        z-index: 100;

        .alpheios-al-editor-segment-cell-target-row__metadata {
          display: inline-block;
          white-space: nowrap;
          text-overflow: ellipsis;
          width: calc(100% - 210px);
          cursor: pointer;
          text-align: left;
          vertical-align: top;
          overflow: hidden;
          padding: 5px 10px;

          &.alpheios-al-editor-segment-cell-target-row__metadata-full {
            white-space: initial;
          }
        }

        .alpheios-al-editor-segment-cell-target-row__langname {
          display: inline-block;
          width: 170px;
          text-align: right;
          vertical-align: top;
          padding: 5px;
        }
    }
</style>