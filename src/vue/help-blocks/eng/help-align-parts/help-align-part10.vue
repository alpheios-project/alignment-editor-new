<template>
  <div class="alpheios-editor-help-content alpheios-editor-help-align-content-part10">
      <h4 class="alpheios-editor-help-content-title" @click="partVisible = !partVisible">STARTING OVER OR RESUMING</h4>
      <div class="alpheios-editor-help-content-text" v-show="partVisible">
          <p>The contents of individual text boxes (and their descriptions) can be discarded with the <b>X</b> in the upper right of the box. 
            To start a completely new alignment project you can select <b>Begin a New Alignment</b> from the menu in the upper left of this screen, 
            where you will also find the option to <b>Resume a previous alignment</b>.
          </p>
          <p class="alpheios-editor-help-content-text__image"><img :src="leftMenuPNG" /></p>
          <p class="alpheios-editor-help-content-text__close-link" @click="partVisible = false">Close</p>
      </div>
  </div>
</template>
<script>
import leftMenuPNG from '@/_images/left-menu.png'

export default {
  name: 'HelpAlignPart10',
  components: {
  },
  data () {
    return {
      partVisible: false,

      leftMenuPNG: leftMenuPNG
    }
  }
}
</script>
<style lang="scss">
</style>