<template>
    <div class="alpheios-alignment-editor-text-blocks-single-direction-options">
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
import SettingsController from '@/lib/controllers/settings-controller'

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