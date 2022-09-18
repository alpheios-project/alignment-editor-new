<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part11">
      <h4 class="alpheios-editor-help-content-title" @click="state.partVisible = !state.partVisible">OPTIONS FOR ALIGN TEXT</h4>
      <div class="alpheios-editor-help-content-text" v-show="state.partVisible">
          <p>Three options that can be set from this screen may be of considerable importance for some users but of no interest to others, 
            so they have been made optional here.
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