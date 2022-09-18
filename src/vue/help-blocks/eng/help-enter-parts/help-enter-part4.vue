<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-enter-content-part4">
      <h4 class="alpheios-editor-help-content-title" @click="state.partVisible = !state.partVisible">TEXT/XML ICON</h4>
      <div class="alpheios-editor-help-content-text" v-show="state.partVisible">
          <p>This icon will only display if you have enabled it in Academic Options. It tells you whether or not the application has detected 
            XML markup in that text entry box and lets you switch the choice if it is wrong.</p>

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