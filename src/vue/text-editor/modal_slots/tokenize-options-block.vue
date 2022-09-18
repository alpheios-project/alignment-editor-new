<template>
    <div class="alpheios-alignment-editor-text-blocks-single-tokenize-options" v-if="showOptions">
        <fieldset class="alpheios-alignment-editor-options-fieldset alpheios-alignment-editor-options-fieldset-slim alpheios-alignment-editor-options-fieldset-label-auto">
            <legend>{{ l10n.getMsgS('TEXT_EDITOR_BLOCK_TOKENIZE_OPTIONS') }}</legend>
            <option-item-block
              :optionItem = "props.localOptions.sourceText.items.sourceType"
              :emitUpdateData = "true"
              @updateData = "emit('updateText')" :disabled="props.disabled"
            />
        </fieldset>

      <div class="alpheios-alignment-editor-tokenize-options__details-container" v-show = "enableTokenizationOptionsChoice">
        <fieldset class="alpheios-alignment-editor-options-fieldset alpheios-alignment-editor-options-fieldset__text" 
            v-show="sourceType === 'text'">
            <legend>{{ l10n.getMsgS('TEXT_EDITOR_BLOCK_TOKENIZE_OPTIONS_TEXT') }}</legend>
            <option-item-block
                v-for="textOptItem in props.localOptions.text.items" :key="textOptItem.domain"
                :optionItem = "textOptItem" :emitUpdateData = "true"
                @updateData = "emit('updateText')" :disabled="props.disabled"
            />
        </fieldset>

        <fieldset class="alpheios-alignment-editor-options-fieldset alpheios-alignment-editor-options-fieldset__tei" 
            v-show="sourceType === 'tei'">
            <legend>{{ l10n.getMsgS('TEXT_EDITOR_BLOCK_TOKENIZE_OPTIONS_TEI') }}</legend>
            <option-item-block
                v-for="textOptItem in props.localOptions.tei.items" :key="textOptItem.domain"
                :optionItem = "textOptItem" :emitUpdateData = "true"
                @updateData = "emit('updateText')" :disabled="props.disabled"

            />
        </fieldset>
      </div>

    </div>
</template>
<script setup>
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import SettingsController from '@/lib/controllers/settings-controller.js'

import { computed, inject, reactive, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'

const l10n = computed(() => { return L10nSingleton })
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

const showOptions = computed(() => {
  return $store.state.optionsUpdated && props.localOptions.ready && SettingsController.tokenizerOptionsLoaded
})

const sourceType = computed(() => {
  return $store.state.optionsUpdated && props.localOptions.ready && 
         props.localOptions.sourceText.items.sourceType.currentValue
})

const enableTokenizationOptionsChoice = computed(() => {
  return $store.state.optionsUpdated && SettingsController.enableTokenizationOptionsChoice
})

</script>
<style lang="scss">
p.alpheios-alignment-editor-tokenize-options__details-toggle {
  display: inline-block;
  cursor: pointer;
  font-size: 90%;
  text-decoration: underline;
  color: #185F6D;
  margin: 0;
}
.alpheios-alignment-editor-text-blocks-single-tokenize-options  {
  .alpheios-alignment-option-item {
    margin-bottom: 5px;
  }
  p.alpheios-alignment-editor-tokenize-options__details-toggle {
    display: inline-block;
    cursor: pointer;
    font-size: 90%;
    text-decoration: underline;
    margin: 0;
  }
}
</style>

