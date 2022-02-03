<template>
    <div class="alpheios-alignment-editor-options-block">
        <fieldset  class="alpheios-alignment-editor-modal-options-block-fieldset">
            <option-item-block :optionItem = "enableAddDeleteNewLinesOptionItem" :showCheckboxTitle = "true" />
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
    }
  }
}
</script>