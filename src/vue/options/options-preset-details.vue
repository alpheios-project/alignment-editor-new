<template>
    <div class="alpheios-alignment-editor-modal-options-block">
        <option-item-block :optionItem = "themeOptionItem" :disabled = "readOnly" 
            :emitUpdateData = "true" @updateData = "$emit('updateData', 'theme')"/>

        <option-item-block :optionItem = "tokenizerOptionItem" :disabled = "readOnly" 
            :emitUpdateData = "true" @updateData = "$emit('updateData', 'tokenizer')"/>

        <option-item-block :optionItem = "availableAnnotationTypesOptionItem"  :disabled = "disableAnnotationsTypes || readOnly" 
            :emitUpdateData = "true" @updateData = "$emit('updateData', 'availableAnnotationTypes')"/>

        <option-item-block :optionItem = "maxCharactersAnnotationTextOptionItem" :disabled = "readOnly" 
            :emitUpdateData = "true" @updateData = "$emit('updateData', 'maxCharactersAnnotationText')"/>

        <option-item-block :optionItem = "maxCharactersPerPartOptionItem" :disabled = "readOnly" 
            :emitUpdateData = "true" @updateData = "$emit('updateData', 'maxCharactersPerPart')"/>

        <option-item-block :optionItem = "useSpecificEnglishTokenizerOptionItem" :disabled = "readOnly" 
            :emitUpdateData = "true" @updateData = "$emit('updateData', 'useSpecificEnglishTokenizer')"/>

        <option-item-block :optionItem = "showSummaryPopupOptionItem" :disabled = "readOnly" 
            :emitUpdateData = "true" @updateData = "$emit('updateData', 'showSummaryPopup')"/>

        <option-item-block :optionItem = "enableTokensEditorOptionItem" :disabled = "readOnly" 
            :emitUpdateData = "true" @updateData = "$emit('updateData', 'enableTokensEditor')"/>

        <option-item-block :optionItem = "addIndexedDBSupportOptionItem" :disabled = "readOnly"
            :emitUpdateData = "true" @updateData = "$emit('updateData', 'addIndexedDBSupport')"/>

        <option-item-block :optionItem = "maxCharactersOptionItem" v-show="!addIndexedDBSupportValue" :disabled = "readOnly"
            :emitUpdateData = "true" @updateData = "$emit('updateData', 'maxCharacters')"/>

    </div>
</template>
<script>
import SettingsController from '@/lib/controllers/settings-controller.js'
import OptionItemBlock from '@/vue/options/option-item-block.vue'

export default {
  name: 'OptionsPresetDetails',
  components: {
    optionItemBlock: OptionItemBlock
  },
  props: {
    options: {
      type: Object,
      required: true
    },
    readOnly: {
      type: Boolean,
      required: false,
      default: true
    } 
  },
  computed: {
    themeOptionItem () {
      return this.options.items.theme
    },
    tokenizerOptionItem () {
      return this.options.items.tokenizer
    },
    maxCharactersOptionItem () {
      return this.options.items.maxCharactersPerText
    },
    useSpecificEnglishTokenizerOptionItem () {
      return this.options.items.useSpecificEnglishTokenizer
    },
    showSummaryPopupOptionItem () {
      return this.options.items.showSummaryPopup
    },
    enableTokensEditorOptionItem () {
      return this.options.items.enableTokensEditor
    },

    addIndexedDBSupportOptionItem () {
      return this.options.items.addIndexedDBSupport
    },
    availableAnnotationTypesOptionItem () {
      return this.options.items.availableAnnotationTypes
    },

    maxCharactersAnnotationTextOptionItem () {
      return this.options.items.maxCharactersAnnotationText
    },

    maxCharactersPerPartOptionItem () {
      return this.options.items.maxCharactersPerPart
    }, 

    disableAnnotationsTypes () {
      return this.$store.state.updateAnnotations && this.$store.state.docSourceUpdated && this.$textC.hasAnnotations
    },
    addIndexedDBSupportValue () {
      return this.addIndexedDBSupportOptionItem.currentValue
    }
  }
}
</script>