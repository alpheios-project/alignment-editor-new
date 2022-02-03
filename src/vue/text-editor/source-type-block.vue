<template>
  <modal :classes="classes" :name="mname"  :draggable="true" height="auto">
    <div class="alpheios-modal-header" >
        <span class="alpheios-alignment-modal-close-icon" @click = "$emit('closeModal')">
            <x-close-icon />
        </span>
    </div>
    <div class="alpheios-modal-body">
      <tokenize-options-block v-if="hasTokenizerOptions" 
        @updateText = "$emit('updateText')" :localOptions = "localOptions" :disabled="!docSourceEditAvailable"  
      />
    </div>
  </modal>
</template>
<script>
import TokenizeOptionsBlock from '@/vue/text-editor/tokenize-options-block.vue'
import XCloseIcon from '@/inline-icons/x-close.svg'
import SettingsController from '@/lib/controllers/settings-controller'

export default {
  name: 'SourceTypeBlock',
  props: {
    mname: {
      type: String,
      required: true
    },
    textType: {
      type: String,
      required: true
    },
    textId: {
      type: String,
      required: false
    },
    localOptions: {
      type: Object,
      required: true
    }
  },
  components: {
    tokenizeOptionsBlock: TokenizeOptionsBlock,
    xCloseIcon: XCloseIcon
  },
  data () {
    return {
    }
  },
  computed: {
    docSourceEditAvailable () {
      return this.$store.state.docSourceUpdated && this.$store.state.alignmentUpdated && 
             !this.$textC.sourceTextIsAlreadyTokenized(this.textType, this.textId)
    },
    hasTokenizerOptions () {
      return this.$store.state.optionsUpdated && SettingsController.hasTokenizerOptions
    },
    classes () {
      return `alpheios-alignment-editor-modal-source-type alpheios-alignment-editor-modal-${this.mname}`
    }
  }
}

</script>
<style lang="scss">
.alpheios-alignment-editor-modal-source-type {
  .alpheios-modal-body {
    // max-height: 700px;
    border: 0;
  }
}
</style>