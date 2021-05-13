<template>
  <modal v-if="showModal" @close="$emit('closeModal')" class="alpheios-alignment-editor-modal-options">
    <template v-slot:header >
        <h2 class="alpheios-alignment-editor-modal-header">Options for Text Enter</h2>
    </template>
    <template v-slot:body >
        <div class="alpheios-alignment-editor-modal-options-block">
            <option-item-block :optionItem = "themeOptionItem" />
            <option-item-block :optionItem = "tokenizerOptionItem" />
            <option-item-block :optionItem = "maxCharactersOptionItem" />
            <option-item-block :optionItem = "useSpecificEnglishTokenizerOptionItem" />
            <option-item-block :optionItem = "showSummaryPopupOptionItem" />
        </div>
    </template>
  </modal>
</template>
<script>
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import Modal from '@/vue/common/modal.vue'

export default {
  name: 'OptionsTextEnter',
  components: {
    optionItemBlock: OptionItemBlock,
    modal: Modal
  },
  props: {
    showModal: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    themeOptionItem () {
      return this.$store.state.optionsUpdated && this.$settingsC.options.app.items.theme
    },
    tokenizerOptionItem () {
      return this.$store.state.optionsUpdated && this.$settingsC.options.app.items.tokenizer
    },
    maxCharactersOptionItem () {
      return this.$store.state.optionsUpdated && this.$settingsC.options.app.items.maxCharactersPerText
    },
    useSpecificEnglishTokenizerOptionItem () {
      return this.$store.state.optionsUpdated && this.$settingsC.options.app.items.useSpecificEnglishTokenizer
    },
    showSummaryPopupOptionItem () {
      return this.$store.state.optionsUpdated && this.$settingsC.options.app.items.showSummaryPopup
    }
  }
}
</script>
<style lang="scss">
.alpheios-alignment-editor-modal-options {
  .alpheios-modal-container {
    width: 700px;
  }
  .alpheios-modal-body {
    max-height: 700px;
    margin: 0 0 20px;

    border: 0;
    border-top: 2px solid #ddd;
    padding: 10px 0 0 0;
  }

  .alpheios-alignment-editor-modal-options-block {
      padding: 10px;
  }
  .alpheios-alignment-editor-modal-header {
    margin-bottom: 10px;
  }
}
</style>