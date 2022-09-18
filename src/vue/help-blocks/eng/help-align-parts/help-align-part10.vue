<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part10">
      <h4 class="alpheios-editor-help-content-title" @click="state.partVisible = !state.partVisible">STARTING OVER OR RESUMING</h4>
      <div class="alpheios-editor-help-content-text" v-show="state.partVisible">
          <p>The contents of individual text boxes (and their descriptions) can be discarded with the <b>X</b> in the upper right of the box. 
            To start a completely new alignment project you can select <b>Begin a New Alignment</b> from the menu in the upper left of this screen, 
            where you will also find the option to <b>Resume a previous alignment</b>.
          </p>
          <p class="alpheios-editor-help-content-text__image"><img :src="state.leftMenuPNG" /></p>
          <p class="alpheios-editor-help-content-text__close-link" @click="state.partVisible = false">Close</p>
      </div>
  </div>
</template>
<script setup>
import leftMenuPNG from '@/_images/left-menu.png'

import { reactive } from 'vue'

const state = reactive({
  partVisible: false,

  leftMenuPNG: leftMenuPNG
})
</script>
<style lang="scss">
</style>