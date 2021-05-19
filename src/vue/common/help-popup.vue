<template>
    <modal v-if="showModal" @close="$emit('closeModal')" class="alpheios-alignment-editor-modal-help">
        <template v-slot:header >
          <h2 class="alpheios-alignment-editor-modal-header">Help</h2>
        </template>
        <template v-slot:body >
            <slot name="content"></slot>
        </template>
    </modal>
</template>
<script>
import Modal from '@/vue/common/modal.vue'

export default {
  name: 'HelpPopup',
  components: {
    modal: Modal
  },
  props: {
    showModal: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
    }
  }
}
</script>
<style lang="scss">
.alpheios-alignment-editor-modal-help {
  .alpheios-modal-container {
    width: 700px;
  }
  .alpheios-modal-body {
    // max-height: 700px;
    border: 0;
    padding: 0 15px 0 0;
    margin: 0 0 20px;
  }
  .alpheios-alignment-editor-modal-header {
    text-transform: uppercase;
    margin-bottom: 10px;
  }
}
</style>