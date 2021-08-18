<template>
    <modal classes="alpheios-alignment-editor-modal-waiting" name="waiting" :draggable="true" height="auto">
        <div class="alpheios-modal-body">
            <waiting />
        </div>
    </modal>
</template>
<script>
import Waiting from '@/vue/common/waiting.vue'

export default {
  name: 'WaitingPopup',
  components: {
    waiting: Waiting
  },
  props: {
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