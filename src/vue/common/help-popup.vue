<template>
    <modal :classes="classes" :name="mname" :draggable="true" height="auto">
        <div class="alpheios-modal-header" >
          <span class="alpheios-alignment-modal-close-icon" @click="$emit('closeModal')">
              <x-close-icon />
          </span>
          <h2 class="alpheios-alignment-editor-modal-header">Help</h2>
        </div>
        <div class="alpheios-modal-body" >
            <slot name="content"></slot>
        </div>
    </modal>
</template>
<script>
import XCloseIcon from '@/inline-icons/x-close.svg'

export default {
  name: 'HelpPopup',
  components: {
    xCloseIcon: XCloseIcon
  },
  props: {
    mname: {
      type: String,
      required: true
    }
  },
  data () {
    return {
    }
  },
  computed: {
    classes () {
      return `alpheios-alignment-editor-modal-help alpheios-alignment-editor-modal-${this.mname}`
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