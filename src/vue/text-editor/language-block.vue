<template>
  <modal v-if="showModal" @close="$emit('closeModal')" class="alpheios-alignment-editor-modal-language">
    <template v-slot:body >
      <direction-options-block 
        @updateText = "$emit('updateText')" :localOptions = "localOptions" :disabled="!docSourceEditAvailable"  
      />

      <language-options-block :textType = "textType"
        @updateText = "$emit('updateText')" @updateDirection = "$emit('updateDirection')" :localOptions = "localOptions" 
      />
    </template>
  </modal>
</template>
<script>
import Modal from '@/vue/common/modal.vue'
import DirectionOptionsBlock from '@/vue/text-editor/direction-options-block.vue'
import LanguageOptionsBlock from '@/vue/text-editor/language-options-block.vue'

export default {
  name: 'LanguageBlock',
  components: {
    directionOptionsBlock: DirectionOptionsBlock,
    languageOptionsBlock: LanguageOptionsBlock,
    modal: Modal
  },
  props: {
    textType: {
      type: String,
      required: true
    },
    textId: {
      type: String,
      required: false
    },
    showModal: {
      type: Boolean,
      required: false,
      default: false
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