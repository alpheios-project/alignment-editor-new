<template>
  <modal v-if="showModal" @close="$emit('closeModal')" class="alpheios-alignment-editor-modal-source-type">
    <template v-slot:body >
      <tokenize-options-block v-if="$settingsC.hasTokenizerOptions" 
        @updateText = "$emit('updateText')" :localOptions = "localOptions" :disabled="!docSourceEditAvailable"  
      />
    </template>
  </modal>
</template>
<script>
import Modal from '@/vue/common/modal.vue'
import TokenizeOptionsBlock from '@/vue/text-editor/tokenize-options-block.vue'
export default {
  name: 'SourceTypeBlock',
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
  components: {
    tokenizeOptionsBlock: TokenizeOptionsBlock,
    modal: Modal
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
.alpheios-alignment-editor-modal-source-type {
  .alpheios-modal-body {
    // max-height: 700px;
    border: 0;
  }
}
</style>