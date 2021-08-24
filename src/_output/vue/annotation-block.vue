<template>
  <modal classes="alpheios-alignment-editor-modal-annotations" name="annotations" :draggable="true" height="auto">
    <div class="alpheios-modal-header">
        <span class="alpheios-alignment-modal-close-icon" @click = "$emit('closeModal')">
            <x-close-icon />
        </span>
        <h3 class="alpheios-alignment-editor-modal-header">Test annotation</h3>
    </div>
  </modal>
</template>
<script>
import XCloseIcon from '@/inline-icons/x-close.svg'

export default {
  name: 'AnnotationBlock',
  components: {
    xCloseIcon: XCloseIcon
  }

}
</script>