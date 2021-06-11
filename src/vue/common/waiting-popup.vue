<template>
    <modal v-if="showModal" @close="$emit('closeModal')" class="alpheios-alignment-editor-modal-waiting">
        <template v-slot:body >
            <waiting />
        </template>
    </modal>
</template>
<script>
import Modal from '@/vue/common/modal.vue'
import Waiting from '@/vue/common/waiting.vue'

export default {
  name: 'WaitingPopup',
  components: {
    modal: Modal,
    waiting: Waiting
  },
  props: {
    showModal: {
      type: Boolean,
      required: false,
      default: false
    }
  }
}
</script>
<style lang="scss">
  .alpheios-alignment-editor-modal-waiting {
    .alpheios-modal-body {
      border: 0;
      padding: 10px 0;
    }
  }
</style>