<template>
    <div class="alpheios-alignment-direction-options" v-show="showOptions" v-if="renderOptions">
        <fieldset class="alpheios-alignment-options-fieldset alpheios-alignment-slim-fieldset alpheios-alignment-fieldset-label-auto">
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