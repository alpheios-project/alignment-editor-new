<template>
  <modal v-if="showModal" @close="$emit('closeModal')" class="alpheios-alignment-editor-modal-options">
    <template v-slot:header >
        <h2 class="alpheios-alignment-editor-modal-header">Options for Text Align</h2>
    </template>
    <template v-slot:body >
        <div class="alpheios-alignment-editor-modal-options-block">
        </div>
    </template>
  </modal>
</template>
<script>
import OptionItemBlock from '@/vue/options/option-item-block.vue'
import Modal from '@/vue/common/modal.vue'

export default {
  name: 'OptionsTextAlign',
  components: {
    optionItemBlock: OptionItemBlock,
    modal: Modal
  },
  props: {
    showModal: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {

  }
}
</script>
<style lang="scss">
.alpheios-alignment-editor-modal-options {
  .alpheios-modal-container {
    width: 700px;
  }
  .alpheios-modal-body {
    max-height: 700px;
    // border: 0;
    margin: 0 0 20px;
  }

  .alpheios-alignment-editor-modal-options-block {
      padding: 10px;
  }
  .alpheios-alignment-editor-modal-header {
    margin-bottom: 10px;
  }
}
</style>