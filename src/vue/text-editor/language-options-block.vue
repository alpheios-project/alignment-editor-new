<template>
    <div class="alpheios-alignment-editor-text-blocks-single-language-options" v-if="showOptions">
        <fieldset class="alpheios-alignment-editor-options-fieldset alpheios-alignment-editor-options-fieldset-slim alpheios-alignment-editor-options-fieldset-label-auto">
            <option-item-block
              :optionItem = "optionItem"
              :emitUpdateData = "true" :disabled="disabled"
              :showLabelText = "showLangLabel"
              @updateData = "updateData" :labelsListType="textType" 
            />
        </fieldset>
    </div>
</template>
<script>
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import SettingsController from '@/lib/controllers/settings-controller'

export default {
  name: 'LanguageOptionsBlock',
  components: {
    optionItemBlock: OptionItemBlock
  },
  props: {
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
  },
  data () {
    return {
      showLangLabel: false
    }
  },
  computed: {
    showOptions () {
      return this.$store.state.optionsUpdated && this.localOptions.ready && SettingsController.sourceTextOptionsLoaded
    },
    optionItem () {
      return this.$store.state.optionsUpdated && this.localOptions.sourceText.items.language
    }
  },
  methods: {
    updateData () {
      this.$emit('updateDirection')
      this.$emit('updateText')
    }
  }
}
</script>
<style lang="scss">
</style>