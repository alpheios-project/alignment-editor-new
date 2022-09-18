<template>
    <div class="alpheios-alignment-editor-text-blocks-single-direction-options">
        <fieldset class="alpheios-alignment-editor-options-fieldset alpheios-alignment-editor-options-fieldset-slim alpheios-alignment-editor-options-fieldset-label-auto">
            <option-item-block
              :optionItem = "optionItem"
              :emitUpdateData = "true"
              @updateData = "emit('updateText')" :disabled="props.disabled"
            />
        </fieldset>
    </div>
</template>
<script setup>
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import SettingsController from '@/lib/controllers/settings-controller'
import { computed, inject, reactive, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'

const $store = useStore()
const emit = defineEmits([ 'updateText' ])

const props = defineProps({
  localOptions: {
    type: Object,
    required: true
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  }
})

const optionItem = computed(() => {
  return $store.state.optionsUpdated && props.localOptions.sourceText && props.localOptions.sourceText.items.direction
})

</script>
<style lang="scss">
.alpheios-alignment-editor-text-blocks-single-direction-options {
  .alpheios-alignment-option-item {
    margin-bottom: 10px;
  }
}
</style>