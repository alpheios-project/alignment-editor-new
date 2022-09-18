<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part5">
      <h4 class="alpheios-editor-help-content-title" @click="state.partVisible = !state.partVisible">DESCRIBING</h4>
      <div class="alpheios-editor-help-content-text" v-show="state.partVisible">
          <p>If you have still not entered any description of some texts, the red icon of the open book that you saw 
            on the Enter Text screen will remain above them. Whenever this icon is visible, whether red or green, 
            you can click on it to open the description template to change or augment the description.
          </p>
          <p class="alpheios-editor-help-content-text__image alpheios-editor-help-content-text__image__wide"><img :src="state.hasNoDescriptionPNG" /></p>
        
          <p class="alpheios-editor-help-content-text__close-link" @click="state.partVisible = false">Close</p>
      </div>
  </div>
</template>
<script setup>
import hasNoDescriptionPNG from '@/_images/has-no-description.png'

import { reactive } from 'vue'

const state = reactive({
  partVisible: false,

  hasNoDescriptionPNG: hasNoDescriptionPNG
})
</script>
<style lang="scss">
</style>