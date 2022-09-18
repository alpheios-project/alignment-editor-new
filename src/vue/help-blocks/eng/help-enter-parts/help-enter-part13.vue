<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-enter-content-part11">
      <h4 class="alpheios-editor-help-content-title" @click="state.partVisible = !state.partVisible">FINAL CHECK</h4>
      <div class="alpheios-editor-help-content-text" v-show="state.partVisible">
          <p>When enabled, this popup appears when you press <b>[DONE]</b>, indicating that you have finished entering translations and 
          wish to prepare them for alignment. It does nothing except warn you one last time of what it believes the language 
          of each text to be and whether it contains xml-like markup. If you see a problem you should correct it before continuing because 
          it will probably cause the tokenizer to fail.
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