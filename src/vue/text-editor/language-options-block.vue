<template>
    <div class="alpheios-alignment-language-options" v-show="showOptions" v-if="renderOptions">
        <fieldset class="alpheios-alignment-options-fieldset alpheios-alignment-slim-fieldset alpheios-alignment-fieldset-label-auto">
            <option-item-block
              :optionItem = "localOptions.sourceText.items.language"
              :emitUpdateData = "true" :disabled="disabled"
              @updateData = "updateData" :labelsListType="textType" 
            />
        </fieldset>
    </div>
</template>
<script>
import OptionItemBlock from '@/vue/options/option-item-block.vue'

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
    }
  },
  computed: {
    renderOptions () {
      return this.$store.state.optionsUpdated && this.localOptions.ready
    },
    showOptions () {
      return this.$store.state.optionsUpdated && this.$settingsC.sourceTextOptionsLoaded
    }
  },
  methods: {
    updateData () {
      this.$emit('updateText')
    }
  }
}
</script>
<style lang="scss">
</style>