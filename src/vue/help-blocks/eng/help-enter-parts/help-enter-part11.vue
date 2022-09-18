<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-enter-content-part11">
      <h4 class="alpheios-editor-help-content-title" @click="state.partVisible = !state.partVisible">Enable upload from DTS API</h4>
      <div class="alpheios-editor-help-content-text" v-show="state.partVisible">
          <p>This is a special api specification intended to make text in online digital corpora more findable, accessible, 
            interoperable and reusable through the use of standards such as W3C JSON-LD Hydra and TEI XML.
            <a href="https://distributed-text-services.github.io/specifications/">https://distributed-text-services.github.io/specifications/</a>
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