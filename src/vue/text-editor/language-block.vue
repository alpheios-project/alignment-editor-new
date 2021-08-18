<template>
  <modal :classes="classes" :name="mname"  :draggable="true" height="auto">
    <div class="alpheios-modal-header" >
        <span class="alpheios-alignment-modal-close-icon" @click = "$emit('closeModal')">
            <x-close-icon />
        </span>
    </div>
    <div class="alpheios-modal-body">
      <direction-options-block 
        @updateText = "$emit('updateText')" :localOptions = "localOptions" :disabled="!docSourceEditAvailable"  
      />

      <language-options-block :textType = "textType"
        @updateText = "$emit('updateText')" @updateDirection = "$emit('updateDirection')" :localOptions = "localOptions" 
      />
    </div>
  </modal>
</template>
<script>
import DirectionOptionsBlock from '@/vue/text-editor/direction-options-block.vue'
import LanguageOptionsBlock from '@/vue/text-editor/language-options-block.vue'
import XCloseIcon from '@/inline-icons/x-close.svg'

export default {
  name: 'LanguageBlock',
  components: {
    directionOptionsBlock: DirectionOptionsBlock,
    languageOptionsBlock: LanguageOptionsBlock,
    xCloseIcon: XCloseIcon
  },
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
  data () {
    return {
    }
  },
  computed: {
    docSourceEditAvailable () {
      return Boolean(this.$store.state.docSourceUpdated) && 
             !this.$textC.sourceTextIsAlreadyTokenized(this.textType, this.textId)
    },
    classes () {
      return `alpheios-alignment-editor-modal-language alpheios-alignment-editor-modal-${this.mname}`
    }
  }
}

</script>
<style lang="scss">
.alpheios-alignment-editor-modal-language {
  .alpheios-modal-body {
    // max-height: 700px;
    border: 0;
  }
}
</style>