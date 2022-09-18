<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part12">
      <h4 class="alpheios-editor-help-content-title" @click="state.partVisible = !state.partVisible">ANNOTATING</h4>
      <div class="alpheios-editor-help-content-text" v-show="state.partVisible">
          <p>When this option is enabled (on by default), <b>SHIFT-clicking</b> on any word will open 
            a box to permit an annotation that you can currently characterize as morphology, lemma-id 
            or simply comment, and letting you set the maximum number of characters it will accept.
          </p>
          <p class="alpheios-editor-help-content-text__close-link" @click="state.partVisible = false">Close</p>
      </div>
  </div>
</template>
<script setup>
import { reactive } from 'vue'

const state = reactive({
  partVisible: false
})
</script>

<style lang="scss">
</style>