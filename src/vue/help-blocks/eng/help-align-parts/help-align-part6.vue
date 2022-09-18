<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part6">
      <h4 class="alpheios-editor-help-content-title" @click="state.partVisible = !state.partVisible">ANNOTATING</h4>
      <div class="alpheios-editor-help-content-text" v-show="state.partVisible">
          <p>If you wish to add a brief annotation to a word, you can do this with <b>SHIFT-Click</b>.</p>
          <p>An ANNOTATING option allows you to change the size of this window.</p>
          <p class="alpheios-editor-help-content-text__image"><img :src="state.annotatingOptionPNG" /></p>
        
          <p class="alpheios-editor-help-content-text__close-link" @click="state.partVisible = false">Close</p>
      </div>
  </div>
</template>
<script setup>
import annotatingOptionPNG from '@/_images/annotating-option.png'

import { reactive } from 'vue'

const state = reactive({
  partVisible: false,

  annotatingOptionPNG: annotatingOptionPNG
})
</script>
<style lang="scss">
</style>