<template>
    <div class="alpheios-alignment-editor-options-block alpheios-alignment-editor-options-block__select-edit-icons">
        <p class="alpheios-alignment-editor-options-block__select-edit-description">{{ l10n.getMsgS(description[screenType]) }}</p>
        <fieldset  class="alpheios-alignment-editor-modal-options-block-fieldset" :class="{ 'alpheios-alignment-editor-modal-options-block-fieldset__hidden-border': hiddenBorder }">
            <option-item-block :optionItem = "enableAddDeleteNewLinesOptionItem" :showLabelTextAsCheckboxLabel = "showLabelTextAsCheckboxLabel" />
            <option-item-block :optionItem = "enableAddDeleteTokensOptionItem" :showLabelTextAsCheckboxLabel = "showLabelTextAsCheckboxLabel" />
            <option-item-block :optionItem = "enableMergeSplitTokensOptionItem" :showLabelTextAsCheckboxLabel = "showLabelTextAsCheckboxLabel" />
            <option-item-block :optionItem = "enableMoveTokensToSegmentOptionItem" :showLabelTextAsCheckboxLabel = "showLabelTextAsCheckboxLabel" />
            <option-item-block :optionItem = "enableEditTokensOptionItem" :showLabelTextAsCheckboxLabel = "showLabelTextAsCheckboxLabel" />
        </fieldset>
    </div>
</template>
<script>
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import SettingsController from '@/lib/controllers/settings-controller.js'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'

export default {
  name: 'SelectEditIcons',
  components: {
    optionItemBlock: OptionItemBlock
  },
  props: {
    showLabelTextAsCheckboxLabel: {
      type: Boolean,
      required: false,
      default: false
    },
    hiddenBorder: {
      type: Boolean,
      required: false,
      default: false
    },
    screenType: {
      type: String,
      required: false,
      default: 'align'
    }
  },
  data () {
    return {
      description: {
        align: 'OPTIONS_EDIT_ICONS_DESC_ALIGN',
        edit: 'OPTIONS_EDIT_ICONS_DESC_EDIT'
      }
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
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
<style lang="scss">
  .alpheios-alignment-editor-options-block.alpheios-alignment-editor-options-block__select-edit-icons {
    .alpheios-alignment-editor-modal-options-block-fieldset.alpheios-alignment-editor-modal-options-block-fieldset__hidden-border {
      margin: 0;
      border-width: 0;
      padding: 0;
    }

    .alpheios-alignment-editor-options-block__select-edit-description {
      color: #999999;
      // width: 70%;
      font-size: 90%;
      margin: 0 0 10px;
    }
  }
</style>