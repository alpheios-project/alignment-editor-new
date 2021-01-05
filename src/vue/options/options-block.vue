<template>
  <div class="alpheios-alignment-options-block" id="alpheios-options">
    <div class="alpheios-alignment-editor-container">

      <fieldset class="alpheios-alignment-options__group alpheios-alignment-options__app-group">
        <legend>{{ l10n.getMsgS('OPTIONS_BLOCK_APPLICATION') }}</legend>
          <option-item-block
            :optionItem = "appOptionItems.theme"
          />
          <option-item-block
            :optionItem = "appOptionItems.tokenizer"
          />
      </fieldset>
      <p class="alpheios-alignment-options__buttons">
        <button class="alpheios-editor-button-tertiary alpheios-options-button alpheios-options-reset-all" 
            @click="resetOptions" >
            {{ l10n.getMsgS('OPTIONS_BLOCK_RESET_ALL') }}
        </button>
      </p>
    </div>
  </div>
</template>
<script>
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import L10nSingleton from '@/lib/l10n/l10n-singleton.js'


export default {
  name: 'OptionsBlock',
  components: {
    optionItemBlock: OptionItemBlock
  },
  props: {
  },
  data () {
    return {
    }
  },
  computed: {
    l10n () {
      return L10nSingleton
    },
    appOptionItems () {
      return this.$store.state.optionsUpdated && this.$settingsC.options.app.items
    }
  },
  methods: {
    async resetOptions () {
      await this.$settingsC.resetAllOptions()
    }
  }
}
</script>
<style lang="scss">
.alpheios-alignment-options-block .alpheios-alignment-editor-container{
  border-bottom: 5px solid #f8f8f8;
  border-top: 5px solid #f8f8f8;
}
.alpheios-alignment-options__group {
  padding: 10px;
  border: 2px groove threedface;
  margin-bottom: 30px;

  legend {
    display: block;
    padding: 0 10px;
    margin-bottom: 10px;
    line-height: inherit;
    color: inherit;
    white-space: normal;
    font-size: 110%;
    font-weight: bold;
  }
}
  .alpheios-alignment-options__buttons {
    padding: 5px 0 15px;
    text-align: left;
  }
</style>