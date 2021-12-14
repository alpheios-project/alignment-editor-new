<template>
    <div class="alpheios-alignment-editor-modal-options-block">
        <option-item-block :optionItem = "themeOptionItem" :disabled = "readOnly" />
        <option-item-block :optionItem = "tokenizerOptionItem" :disabled = "readOnly" />
        <option-item-block :optionItem = "availableAnnotationTypesOptionItem"  :disabled = "disableAnnotationsTypes || readOnly" />
        <option-item-block :optionItem = "maxCharactersAnnotationTextOptionItem" :disabled = "readOnly" />
        <option-item-block :optionItem = "maxCharactersPerPart" :disabled = "readOnly" />
        <option-item-block :optionItem = "useSpecificEnglishTokenizerOptionItem" :disabled = "readOnly" />
        <option-item-block :optionItem = "showSummaryPopupOptionItem" :disabled = "readOnly" />
        <option-item-block :optionItem = "enableTokensEditorOptionItem" :disabled = "readOnly"/>

        <option-item-block :optionItem = "addIndexedDBSupportOptionItem" :disabled = "readOnly"/>
        <option-item-block :optionItem = "maxCharactersOptionItem" v-show="!addIndexedDBSupportValue" :disabled = "readOnly"/>
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
    readOnly: {
      type: Boolean,
      required: false,
      default: true
    } 
  },
  computed: {
    themeOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.theme
    },
    tokenizerOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.tokenizer
    },
    maxCharactersOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.maxCharactersPerText
    },
    useSpecificEnglishTokenizerOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.useSpecificEnglishTokenizer
    },
    showSummaryPopupOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.showSummaryPopup
    },
    enableTokensEditorOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableTokensEditor
    },

    addIndexedDBSupportOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.addIndexedDBSupport
    },
    availableAnnotationTypesOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.availableAnnotationTypes
    },

    maxCharactersAnnotationTextOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.maxCharactersAnnotationText
    },

    maxCharactersPerPart () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.maxCharactersPerPart
    }, 

    disableAnnotationsTypes () {
      return this.$store.state.updateAnnotations && this.$store.state.docSourceUpdated && this.$textC.hasAnnotations
    },
    addIndexedDBSupportValue () {
      return this.$store.state.optionsUpdated && SettingsController.addIndexedDBSupport
    }
  }
}
</script>