<template>
    <div class="alpheios-alignment-editor-options-block">
        <fieldset  class="alpheios-alignment-editor-modal-options-block-fieldset">
            <option-item-block :optionItem = "enableAddDeleteNewLinesOptionItem" :showCheckboxTitle = "true" />
            <option-item-block :optionItem = "enableAddDeleteTokensOptionItem" :showCheckboxTitle = "true" />
            <option-item-block :optionItem = "enableMergeSplitTokensOptionItem" :showCheckboxTitle = "true" />
            <option-item-block :optionItem = "enableMoveTokensToSegmentOptionItem" :showCheckboxTitle = "true" />
            <option-item-block :optionItem = "enableEditTokensOptionItem" :showCheckboxTitle = "true" />
        </fieldset>
    </div>
</template>
<script>
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import SettingsController from '@/lib/controllers/settings-controller.js'

export default {
  name: 'SelectEditIcons',
  components: {
    optionItemBlock: OptionItemBlock
  },
  props: {},
  computed: {
    enableAddDeleteNewLinesOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableAddDeleteNewLines
    },
    enableAddDeleteTokensOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableAddDeleteTokens
    },
    enableMergeSplitTokensOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableMergeSplitTokens
    },
    enableMoveTokensToSegmentOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableMoveTokensToSegment
    },
    enableEditTokensOptionItem () {
      return this.$store.state.optionsUpdated && SettingsController.allOptions.app.items.enableEditTokens
    }
  }
}
</script>