<template>
    <div class="alpheios-alignment-editor-text-blocks-single-language-options" v-if="showOptions">
        <fieldset class="alpheios-alignment-editor-options-fieldset alpheios-alignment-editor-options-fieldset-slim alpheios-alignment-editor-options-fieldset-label-auto">
            <option-item-block
              :optionItem = "optionItem"
              :emitUpdateData = "true" :disabled="props.disabled"
              :showLabelText = "false"
              @updateData = "updateData" :labelsListType="props.textType" 
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
const emit = defineEmits([ 'updateText', 'updateDirection' ])

const props = defineProps({
  textType: {
    type: String,
    required: true
  },
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
  return $store.state.optionsUpdated && props.localOptions.sourceText && props.localOptions.sourceText.items.language
})

const showOptions = computed(() => {
  return $store.state.optionsUpdated && props.localOptions.ready && SettingsController.sourceTextOptionsLoaded
})

const updateData = () => {
  emit('updateDirection')
  emit('updateText')
}

</script>

<style lang="scss">
</style>