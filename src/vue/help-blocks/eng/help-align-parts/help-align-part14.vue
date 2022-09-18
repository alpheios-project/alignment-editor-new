<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part14">
      <h4 class="alpheios-editor-help-content-title" @click="state.partVisible = !state.partVisible">ALPHEIOS READING TOOLS TOOLBAR</h4>
      <div class="alpheios-editor-help-content-text" v-show="state.partVisible">
          <p>The various resources of the Reading Tools (grammars, inflection tables, dictionaries etc) can also be accessed directly, 
            without clicking on any word, through a floating toolbar whose display is optional on this screen. 
            But again, access requires internet connectivity.
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