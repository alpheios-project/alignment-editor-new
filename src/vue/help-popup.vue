<template>
    <modal v-if="showModal" @close="$emit('closeModal')" class="alpheios-alignment-editor-modal-help">
        <template v-slot:header >
          <h2 class="alpheios-alignment-editor-modal-help-header">Help</h2>
        </template>
        <template v-slot:body >
            <slot name="content"></slot>
        </template>
        <template v-slot:footer>
            <button class="alpheios-editor-button-tertiary alpheios-actions-menu-button" @click="$emit('closeModal')">Close</button>
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
    max-height: 700px;
    border: 0;
    padding: 0 15px 0 0;
    margin: 0 0 20px;
  }
}

.alpheios-alignment-editor-modal-help-header {
  text-transform: uppercase;
}
</style>