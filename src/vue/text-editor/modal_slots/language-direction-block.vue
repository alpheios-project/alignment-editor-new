<template>
  <modal-base :modalName="modalName" :draggable="true" height="auto" :shiftY="0.3" >
    <div class="alpheios-alignment-editor-modal-language" data-alpheios-ignore="all">
      <div class="alpheios-modal-header" >
          <span class="alpheios-alignment-modal-close-icon" @click = "closeModal">
              <x-close-icon />
          </span>
      </div>
      <div class="alpheios-modal-body">
        <direction-options-block 
          @updateText = "emit('updateText')" :localOptions = "props.localOptions" :disabled="!docSourceEditAvailable"  
        />

        <language-options-block :textType = "props.textType"
          @updateText = "emit('updateText')" @updateDirection = "emit('updateDirection')" :localOptions = "props.localOptions" 
        />
      </div>
    </div>
  </modal-base>
</template>
<script setup>
import DirectionOptionsBlock from '@/vue/text-editor/modal_slots/direction-options-block.vue'
import LanguageOptionsBlock from '@/vue/text-editor/modal_slots/language-options-block.vue'
import XCloseIcon from '@/inline-icons/xclose.svg'

import { computed, inject, reactive, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'

const $store = useStore()
const $textC = inject('$textC')
const $modal = inject('$modal')

const emit = defineEmits([ 'updateText', 'updateDirection' ])

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
  return `language-${props.textType}-${formattedTextId.value}`
})

const docSourceEditAvailable = computed(() => {
  return Boolean($store.state.docSourceUpdated) && 
          !$textC.sourceTextIsAlreadyTokenized(props.textType, props.textId)
})

</script>

<style lang="scss">
.alpheios-alignment-editor-modal-language {
  .alpheios-modal-body {
    // max-height: 700px;
    border: 0;
  }
}
</style>