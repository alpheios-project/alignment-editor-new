<template>
    <div class="alpheios-alignment-editor-text-blocks-single-direction-options" v-if="showOptions">
        <fieldset class="alpheios-alignment-editor-options-fieldset alpheios-alignment-editor-options-fieldset-slim alpheios-alignment-editor-options-fieldset-label-auto">
            <option-item-block
              :optionItem = "localOptions.sourceText.items.direction"
              :emitUpdateData = "true"
              @updateData = "updateData" :disabled="disabled"
            />
        </fieldset>
    </div>
</template>
<script>
import OptionItemBlock from '@/vue/options/option-item-block.vue'

export default {
  name: 'DirectionOptionsBlock',
  components: {
    optionItemBlock: OptionItemBlock
  },
  props: {
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
    /**
     * @returns {Boolean} - true if sourceText options are loaded
     */
    showOptions () {
      return this.$store.state.optionsUpdated && this.localOptions.ready && this.$settingsC.sourceTextOptionsLoaded
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
.alpheios-alignment-editor-text-blocks-single-direction-options {
  .alpheios-alignment-option-item {
    margin-bottom: 10px;
  }
}
</style>