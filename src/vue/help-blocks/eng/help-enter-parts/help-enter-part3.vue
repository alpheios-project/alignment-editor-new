<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-enter-content-part3">
      <h4 class="alpheios-editor-help-content-title" @click="state.partVisible = !state.partVisible">LANGUAGE ICON</h4>
      <div class="alpheios-editor-help-content-text" v-show="state.partVisible">
          <p>Alpheios will attempt to detect the language of the text in each entry box as soon as you leave it 
             and will post its choice as a three-letter icon at the top right of each box. 
             This icon can also be used to change the language if you find that it is incorrect.</p>

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
