<template>
  <modal-base :modalName="modalName" :draggable="true" height="auto" :shiftY="0.3" >
    <div class="alpheios-alignment-editor-modal-source-type" data-alpheios-ignore="all">
      <div class="alpheios-modal-header" >
          <span class="alpheios-alignment-modal-close-icon" @click = "closeModal">
              <x-close-icon />
          </span>
      </div>
      <div class="alpheios-modal-body">
        <tokenize-options-block v-if="hasTokenizerOptionsValue" 
          @updateText = "emit('updateText')" :localOptions = "props.localOptions" :disabled="!docSourceEditAvailable"  
        />
      </div>
    </div>
  </modal-base>
</template>
<script setup>
import TokenizeOptionsBlock from '@/vue/text-editor/modal_slots/tokenize-options-block.vue'
import XCloseIcon from '@/inline-icons/xclose.svg'
import SettingsController from '@/lib/controllers/settings-controller'

import { computed, inject, reactive, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'

const $store = useStore()
const $textC = inject('$textC')
const $modal = inject('$modal')

const emit = defineEmits([ 'updateText' ])
const props = defineProps({
  textType: {
    type: String,
    required: true
  },
  textId: {
    type: String,
    required: false
  },
  localOptions: {
    type: Object,
    required: true
  }
})

const closeModal = () => {
  $modal.hide(modalName.value)
}

const formattedTextId  = computed(() => props.textId ?? 'no-id' )

const modalName = computed(() => {
  return `source-type-${props.textType}-${formattedTextId.value}`
})

const docSourceEditAvailable = computed(() => {
  return $store.state.docSourceUpdated && $store.state.alignmentUpdated && 
          !$textC.sourceTextIsAlreadyTokenized(props.textType, props.textId)
})

const hasTokenizerOptionsValue = computed(() => {
  return $store.state.optionsUpdated && SettingsController.hasTokenizerOptions
})

</script>

<style lang="scss">
.alpheios-alignment-editor-modal-source-type {
  .alpheios-modal-body {
    // max-height: 700px;
    border: 0;
  }
}
</style>